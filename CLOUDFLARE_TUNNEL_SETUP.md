# Cloudflare named tunnel setup

This repo is ready for a stable Cloudflare Tunnel setup.

## Target

- Public URL: `https://parser.auraglobal-merchants.com`
- Local service: `http://localhost:4317`

## Cloudflare dashboard

1. Go to `Zero Trust` or `Networking > Tunnels`.
2. Create a named tunnel.
3. Add a published application route for `parser.auraglobal-merchants.com`.
4. Point the service to `http://localhost:4317`.
5. Copy the tunnel token from the dashboard.

## Local machine / server

Put these values into `.env`:

```env
PARSER_PUBLIC_URL=https://parser.auraglobal-merchants.com
CLOUDFLARE_TUNNEL_TOKEN=eyJ...
```

Then start:

```bat
start-parser.bat
```

The launcher will:

- start the backend on `http://localhost:4317`
- start the Cloudflare tunnel with the saved token
- publish the stable URL into `public/tunnel.json`
- keep `worker-link.txt` in sync for the Pages frontend

