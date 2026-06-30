# Google Places and CEIDG setup

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

The public CEIDG website can be used manually for search/export, but automated backend search needs the API token. Without the token, use internet/contact discovery or import CSV from CEIDG.
