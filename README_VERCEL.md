Vercel deployment notes

This repository contains a Vite React client in `client/` and an Express server in `server/`.

To deploy the client as a static site on Vercel:
1. Ensure the root `package.json` provides a `vercel-build` script that builds the client. It runs `cd client && npm ci && npm run build`.
2. `vercel.json` is configured to use `client/index.html` as the static-build entry and expects the build output in `client/dist`.

If Vercel reports "No Output Directory named 'dist' found", run locally and paste the build output for diagnosis:

```powershell
cd H:\AwakePro
npm run vercel-build
```

If the client build uses a different output directory, update `vercel.json` -> `distDir` accordingly.

## Environment Variables

After deploying, add these environment variables in your Vercel dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | ✅ Yes |
| `DATABASE_URL` | Your Database connection string | ✅ Yes |