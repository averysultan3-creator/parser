# Data source setup

## Amazon Location

Amazon Location is the preferred map/place source when configured. It is used before Google Places in `all_sources`.

```env
AWS_LOCATION_API_KEY=your_aws_location_key
AWS_LOCATION_REGION=eu-north-1
```

In AWS Console the key must allow Amazon Location Places actions, especially `SearchText`. For local backend testing keep application restrictions compatible with a Node backend. The parser calls:

```text
POST https://places.geo.eu-north-1.amazonaws.com/v2/search-text?key=...
```

Amazon Location is a place/contact database, not a legal company registry. For "all registered firms" use CEIDG/API/export as the seed, then Amazon Location and internet parsing enrich contacts and website status.

## Google Places

If `/api/discover` returns `The caller does not have permission`, the key is present but Google Cloud rejects it.

1. Open Google Cloud Console -> APIs & Services -> Library.
2. Enable `Places API (New)` for the same project where the API key was created.
3. Make sure Billing is attached to that project.
4. Open APIs & Services -> Credentials -> your API key.
5. Set `API restrictions` to `Restrict key`, then select `Places API (New)`.
6. For local backend testing set `Application restrictions` to `None`.
7. Save, wait 2-5 minutes, then restart the parser.

Important: this parser calls Google from the Node backend. Do not use website referrer restrictions for local backend calls. After deployment, restrict by server IP.

## CEIDG / registry

The parser supports the official CEIDG API endpoint:

```env
CEIDG_API_TOKEN=your_bearer_token
CEIDG_API_ENDPOINT=https://dane.biznes.gov.pl/api/ceidg/v3/firmy
```

The public CEIDG website can be used manually for search/export. In backend automation it may return `403 Forbidden`, so the parser has a no-token fallback:

1. Try public indexed CEIDG/registry pages.
2. If CEIDG pages are not accessible/indexed, use public registry/catalog/contact search.
3. Open found company pages and extract phone, email and website for calling.

For fully official registry data, use `CEIDG_API_TOKEN`. For calling lists, the no-token fallback is usually enough because it prioritizes reachable phone/email/site sources.
