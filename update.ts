#!/usr/bin/env node
/**
 * Syncs the local mirror in `docs/` with the Polymarket US documentation.
 *
 * Upstream is a Mintlify site that publishes llmstxt.org endpoints, so there is no HTML
 * scraping here: `llms.txt` enumerates every page and every OpenAPI/AsyncAPI spec, each page
 * has a clean `.md` twin, and we copy all of it byte-for-byte.
 *
 * Run order matters. The guardrail runs before anything touches the working tree, and
 * pruning runs after it: the failure mode this protects against is upstream serving a
 * truncated `llms.txt`, which a prune-first script would turn into a mass deletion.
 *
 * Runs on Node >= 22.18 (native TypeScript type stripping) or Bun; no dependencies.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, posix, relative, sep } from "node:path";

const BASE = "https://docs.polymarket.us/";
const LLMS_TXT = `${BASE}llms.txt`;
const HOME = `${BASE}api-reference/introduction`;
const DOCS_DIR = "docs";
const METADATA_FILE = ".metadata.json";
const INDEX_FILE = "INDEX.md";
const USER_AGENT =
  "polymarket-us-docs/1.0 (+https://github.com/justrhoto/polymarket-us-docs; docs mirror)";

/** Fail the run rather than prune if the file count falls by more than this fraction. */
const SHRINK_TOLERANCE = 0.1;
const CONCURRENCY = 8;
const MAX_ATTEMPTS = 3;

/**
 * Listed upstream but deliberately not mirrored, with the reason shown in INDEX.md. Keep this
 * short: every entry is a judgement call that the nightly job cannot revisit on its own.
 */
const EXCLUDED: Record<string, string> = {
  [`${BASE}developers-old/open-api/connect-wss.json`]:
    "Stale AsyncAPI spec for the international Polymarket CLOB (ws-subscriptions-clob.polymarket.com), " +
    "not Polymarket US. YAML despite the .json name, and referenced by no page.",
};

/** A `- [title](url): description` entry from llms.txt, with its url made absolute. */
type Entry = { title: string; url: string; description: string };

/** An entry we mirror, with its resolved local path and fetched body. */
type Page = Entry & { path: string; body: string };

type Metadata = {
  source: string;
  pageCount: number;
  /** URLs deliberately not mirrored, so new ones show up in a diff rather than vanishing. */
  skipped: string[];
  /** Per-file sha256. Deliberately no timestamp: this file must only change when content does. */
  files: Record<string, string>;
};

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url: string): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      // Other 4xx will not fix themselves; fail fast instead of burning retries.
      if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { fatal: true });
      return await res.text();
    } catch (error) {
      lastError = error;
      if ((error as { fatal?: boolean }).fatal || attempt === MAX_ATTEMPTS) break;
      await sleep(500 * 2 ** (attempt - 1));
    }
  }
  throw new Error(`Failed to fetch ${url}: ${lastError}`);
}

/**
 * Parses `- [Title](url): description` lines. Pages use absolute URLs; the spec sections use
 * site-relative ones, so both are resolved against BASE. Upstream lists some pages under two
 * navigation sections; the first occurrence wins, which keeps its original nav position.
 */
function parseLlmsTxt(text: string): Entry[] {
  const entries: Entry[] = [];
  const seen = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*-\s*\[([^\]]*)\]\(([^)\s]+)\)\s*:?\s*(.*)$/);
    if (!match) continue;
    const [, title, href, description] = match;
    const url = new URL(href, BASE).href;
    if (seen.has(url)) continue;
    seen.add(url);
    entries.push({ title: title.trim(), url, description: description.trim() });
  }
  return entries;
}

const isSpec = (url: string) => url.endsWith(".json");

/** We mirror `.md` pages and `.json` specs on the docs host; everything else is reported, never dropped silently. */
const isMirrorable = (url: string) =>
  url.startsWith(BASE) && (url.endsWith(".md") || url.endsWith(".json")) && !(url in EXCLUDED);

/** `https://docs.polymarket.us/api-reference/x.md` -> `docs/api-reference/x.md`, preserving upstream structure verbatim. */
const localPath = (url: string) => `${DOCS_DIR}/${url.slice(BASE.length)}`;

/**
 * A 200 is not proof of content: a misbehaving CDN or a site-wide error page can serve HTML
 * for every URL. Reject anything that is not the format we asked for, before any write.
 */
function validate(entry: Entry, body: string): void {
  if (!body.trim()) throw new Error(`Empty body from ${entry.url}`);
  if (isSpec(entry.url)) {
    try {
      JSON.parse(body);
    } catch {
      throw new Error(`Invalid JSON from ${entry.url}`);
    }
  } else if (/^\s*<(!doctype|html)/i.test(body)) {
    throw new Error(`Got HTML instead of Markdown from ${entry.url}`);
  }
}

async function readMetadata(): Promise<Metadata | null> {
  try {
    return JSON.parse(await readFile(METADATA_FILE, "utf8")) as Metadata;
  } catch {
    return null;
  }
}

/** Every existing mirrored file, as posix-style repo-relative paths. */
async function existingFiles(): Promise<string[]> {
  const out: string[] = [];
  const walk = async (dir: string) => {
    let items;
    try {
      items = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      const full = join(dir, item.name);
      if (item.isDirectory()) await walk(full);
      else if (/\.(md|json)$/.test(item.name)) {
        out.push(relative(".", full).split(sep).join(posix.sep));
      }
    }
  };
  await walk(DOCS_DIR);
  return out;
}

/** Fetches every entry with a bounded worker pool. Any failure aborts the whole run. */
async function fetchPages(entries: Entry[]): Promise<Page[]> {
  const pages: Page[] = new Array(entries.length);
  let cursor = 0;
  let done = 0;
  const worker = async () => {
    while (cursor < entries.length) {
      const index = cursor++;
      const entry = entries[index];
      const body = await fetchText(entry.url);
      validate(entry, body);
      pages[index] = { ...entry, path: localPath(entry.url), body };
      if (++done % 25 === 0) console.log(`  fetched ${done}/${entries.length}`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return pages;
}

/** Acronyms and brand casing that naive title-casing of a URL segment gets wrong. */
const WORDS: Record<string, string> = {
  api: "API",
  apis: "APIs",
  faq: "FAQ",
  faqs: "FAQs",
  fix: "FIX",
  grpc: "gRPC",
  kyc: "KYC",
  rfqs: "RFQs",
  sdks: "SDKs",
  refdata: "Reference Data",
  referencedata: "Reference Data",
  orderbook: "Order Book",
  typescript: "TypeScript",
  websocket: "WebSocket",
};

const MINOR_WORDS = new Set(["a", "and", "for", "in", "of", "on", "or", "the", "to"]);

/** `streaming-endpoints` -> `Streaming Endpoints`; unknown segments still read sensibly. */
const labelOf = (segment: string) =>
  segment
    .split("-")
    .map((w, i) =>
      WORDS[w] ?? (i > 0 && MINOR_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)),
    )
    .join(" ");

type Operation = { spec: string; method: string; endpoint: string };

/**
 * Endpoint pages embed their operation as a fence header:
 * ````yaml /api-reference/oapi-schemas/orders-schema.json post /v1/orders
 */
function operationOf(body: string): Operation | null {
  const match = body.match(
    /^`{3,}ya?ml\s+(\S+\.json)\s+(get|post|put|patch|delete|head|options)\s+(\S+)/im,
  );
  return match ? { spec: match[1], method: match[2].toUpperCase(), endpoint: match[3] } : null;
}

/**
 * Section and subsection come from the URL, not a hand-kept list, so a new upstream section
 * lands in the index with a readable heading and no human in the loop.
 *
 * Endpoint pages are the exception: they are sectioned by the spec they embed. Upstream files
 * institutional endpoints under `api-reference/` URLs, and grouping those by URL would list
 * institutional-host endpoints beside the retail API, which is exactly the mix-up an index
 * must prevent.
 */
function groupOf(page: Page): [section: string, subsection: string] {
  const segments = page.path.slice(DOCS_DIR.length + 1).split("/");
  if (segments.length === 1) return ["General", ""];
  const subsection = segments.length > 2 ? segments.slice(1, -1).map(labelOf).join(" / ") : "";
  const specRoot = operationOf(page.body)?.spec.split("/").filter(Boolean)[0];
  return [labelOf(specRoot ?? segments[0]), subsection];
}

/** Spec site path (`/institutional/oapi-schemas/x.json`) -> first declared server URL. */
function serversBySpec(specs: Page[]): Map<string, string> {
  const servers = new Map<string, string>();
  for (const spec of specs) {
    try {
      const url = (JSON.parse(spec.body) as { servers?: { url?: string }[] }).servers?.[0]?.url;
      if (url) servers.set(`/${spec.url.slice(BASE.length)}`, url);
    } catch {
      // validate() already guarantees JSON; this only guards the property access.
    }
  }
  return servers;
}

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\s+/g, " ");
const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

function buildIndex(pages: Page[], skipped: Entry[]): string {
  const docs = pages.filter((p) => !isSpec(p.url));
  const specs = pages.filter((p) => isSpec(p.url));
  const servers = serversBySpec(specs);

  // Map preserves insertion order, and llms.txt is in upstream navigation order, so the index
  // reads in the same order as the live sidebar without any sorting.
  const groups = new Map<string, Map<string, Page[]>>();
  for (const page of docs) {
    const [section, subsection] = groupOf(page);
    if (!groups.has(section)) groups.set(section, new Map());
    const subsections = groups.get(section)!;
    if (!subsections.has(subsection)) subsections.set(subsection, []);
    subsections.get(subsection)!.push(page);
  }

  const lines = [
    "# Index",
    "",
    "<!-- Generated by update.ts. Do not edit by hand; your changes will be overwritten. -->",
    "",
    `${docs.length} pages and ${specs.length} API specifications mirrored from the ` +
      `[Polymarket US documentation](${HOME}).`,
    "",
  ];

  for (const [section, subsections] of groups) {
    lines.push(`## ${section}`, "");
    // A section's own top-level pages (overviews, introductions) lead it; the rest keep nav order.
    const ordered = [...subsections].sort(([a], [b]) => Number(a !== "") - Number(b !== ""));
    for (const [subsection, entries] of ordered) {
      if (subsection) lines.push(`### ${subsection}`, "");
      const hasEndpoints = entries.some((p) => operationOf(p.body));
      lines.push(
        hasEndpoints ? "| Page | Method | Path | Server |" : "| Page | Description |",
        hasEndpoints ? "| --- | --- | --- | --- |" : "| --- | --- |",
      );
      for (const page of entries) {
        const link = `[${cell(page.title || page.path)}](${page.path})`;
        if (hasEndpoints) {
          const op = operationOf(page.body);
          const server = op ? servers.get(op.spec) : undefined;
          lines.push(
            `| ${link} | ${op?.method ?? ""} | ${op ? `\`${op.endpoint}\`` : ""} | ` +
              `${server ? `\`${server}\`` : ""} |`,
          );
        } else {
          lines.push(`| ${link} | ${cell(truncate(page.description, 160))} |`);
        }
      }
      lines.push("");
    }
  }

  if (specs.length) {
    lines.push(
      "## API specifications",
      "",
      "Machine-readable OpenAPI and AsyncAPI documents behind the endpoint pages above.",
      "",
      "| Spec | Title | Server |",
      "| --- | --- | --- |",
    );
    for (const spec of specs) {
      let title = "";
      try {
        title = (JSON.parse(spec.body) as { info?: { title?: string } }).info?.title ?? "";
      } catch {
        // validate() already guarantees JSON; this only guards the property access.
      }
      const server = servers.get(`/${spec.url.slice(BASE.length)}`);
      lines.push(
        `| [${cell(spec.path.slice(DOCS_DIR.length + 1))}](${spec.path}) | ${cell(title)} | ` +
          `${server ? `\`${server}\`` : ""} |`,
      );
    }
    lines.push("");
  }

  if (skipped.length) {
    lines.push(
      "## Not mirrored",
      "",
      "Listed upstream but outside the mirror (not Markdown or JSON, not on the documentation " +
        "host, or deliberately excluded).",
      "",
    );
    for (const entry of skipped) {
      const reason = EXCLUDED[entry.url];
      lines.push(`- [${entry.title}](${entry.url})${reason ? ` — ${reason}` : ""}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  console.log(`Enumerating ${LLMS_TXT}`);
  const entries = parseLlmsTxt(await fetchText(LLMS_TXT));
  const mirrorable = entries.filter((e) => isMirrorable(e.url));
  const skipped = entries.filter((e) => !isMirrorable(e.url));
  console.log(
    `  ${entries.length} entries: ${mirrorable.length} mirrorable, ${skipped.length} skipped`,
  );
  for (const entry of skipped) console.log(`  skipping ${entry.url}`);

  // Guardrail. Runs before any write, and before any prune.
  const previous = await readMetadata();
  if (!mirrorable.some((e) => !isSpec(e.url))) {
    throw new Error("llms.txt yielded no mirrorable pages; refusing to touch the mirror.");
  }
  if (previous) {
    const floor = Math.floor(previous.pageCount * (1 - SHRINK_TOLERANCE));
    if (mirrorable.length < floor) {
      throw new Error(
        `File count fell from ${previous.pageCount} to ${mirrorable.length} (floor ${floor}). ` +
          "Upstream may be broken; refusing to sync. Re-run once upstream recovers, or edit " +
          `${METADATA_FILE} by hand if the drop is genuine.`,
      );
    }
  }

  console.log(`Fetching ${mirrorable.length} files`);
  const pages = await fetchPages(mirrorable);

  const wanted = new Set(pages.map((p) => p.path));
  const before = await existingFiles();
  let added = 0;
  let modified = 0;
  for (const page of pages) {
    const existing = await readFile(page.path, "utf8").catch(() => null);
    if (existing === page.body) continue;
    await mkdir(dirname(page.path), { recursive: true });
    await writeFile(page.path, page.body);
    if (existing === null) added++;
    else modified++;
  }

  const orphans = before.filter((f) => !wanted.has(f));
  for (const orphan of orphans) await rm(orphan);

  await writeFile(INDEX_FILE, buildIndex(pages, skipped));
  const metadata: Metadata = {
    source: LLMS_TXT,
    pageCount: pages.length,
    skipped: skipped.map((e) => e.url),
    files: Object.fromEntries(
      pages.map((p) => [p.path, sha256(p.body)] as const).sort((a, b) => a[0].localeCompare(b[0])),
    ),
  };
  await writeFile(METADATA_FILE, `${JSON.stringify(metadata, null, 2)}\n`);

  const summary = `${modified} modified, ${added} added, ${orphans.length} removed`;
  const changed = modified + added + orphans.length > 0;
  console.log(`Done: ${summary}`);
  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT, `changed=${changed}\nsummary=${summary}\n`, {
      flag: "a",
    });
  }
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  // exitCode rather than exit(): exiting with fetch sockets still open crashes libuv on Windows.
  process.exitCode = 1;
});
