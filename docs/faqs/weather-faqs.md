> ## Documentation Index
> Fetch the complete documentation index at: https://docs.polymarket.us/llms.txt
> Use this file to discover all available pages before exploring further.

# Weather FAQs

> Frequently asked questions about trading Weather Contracts on Polymarket US

## General Rules

### What kinds of Weather Contracts are offered?

Polymarket US offers Temperature Contracts -- Event Contracts that resolve based on whether the temperature in a specified location during a specified period satisfies a specified condition relative to a specified value.

Polymarket US also offers Rain Contracts -- daily yes/no Event Contracts that resolve based on whether measurable precipitation is recorded in a specified location on a specified date.

### How are Weather Contracts settled?

Settlement is determined by the official NWS Daily Climate Report (CLI) published by the local Weather Forecast Office. The CLI is an official government record that reports observed high, low, and average temperatures for a given location and date.

Rain Contracts settle on the PRECIPITATION (IN) figure in the same report. A figure of 0.01 inches or more counts as measurable precipitation and resolves the Contract to "Yes"; a trace ("T") does not count. The figure is total liquid-equivalent precipitation, so snow, sleet, hail or freezing rain included in it counts.

The settlement source for each currently offered city is:

| City | Station | CLI Source |
| - | - | - |
| New York City | KNYC (Central Park) | [CLINYC](https://forecast.weather.gov/product.php?site=NWS\&issuedby=NYC\&product=CLI\&format=CI\&version=1\&glossary=1\&highlight=off) |
| San Francisco | KSFO (San Francisco International Airport) | [CLISFO](https://forecast.weather.gov/product.php?site=NWS\&issuedby=SFO\&product=CLI\&format=CI\&version=1\&glossary=1\&highlight=off) |
| Miami | KMIA (Miami International Airport) | [CLIMIA](https://forecast.weather.gov/product.php?site=NWS\&issuedby=MIA\&product=CLI\&format=CI\&version=1\&glossary=1\&highlight=off) |
| Chicago | KMDW (Chicago Midway Airport) | [CLIMDW](https://forecast.weather.gov/product.php?site=NWS\&issuedby=MDW\&product=CLI\&format=CI\&version=1\&glossary=1\&highlight=off) |
| Los Angeles | KLAX (Los Angeles International Airport) | [CLILAX](https://forecast.weather.gov/product.php?site=NWS\&issuedby=LAX\&product=CLI\&format=CI\&version=1\&glossary=1\&highlight=off) |
| Philadelphia | KPHL (Philadelphia International Airport) | [CLIPHL](https://forecast.weather.gov/product.php?site=NWS\&issuedby=PHL\&product=CLI\&format=CI\&version=1\&glossary=1\&highlight=off) |

### When does settlement occur?

For Temperature Contracts, settlement occurs at 8:00 AM ET on the day following the Contract's specified date. If the CLI reading is inconsistent with the 24-hour METAR observation for the same location, settlement may be delayed until 11:00 AM ET for review. If no data is published within one week of the scheduled release, the Contract settles at last fair market prices.

For Rain Contracts, settlement occurs after 2:00 PM ET on the day following the Contract's specified date, once the governing CLI is known. If no CLI has been published within 7 days of the specified date, settlement may be delayed by up to 7 more days; if none is published by then, the Contract settles at last fair market prices.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.