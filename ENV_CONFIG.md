# Environment Variables

## Development (Local)
Create a `.env.local` file in the `client/` directory:
```bash
VITE_API_URL=http://localhost:3000
```

## Production (Vercel/Netlify)
Set the environment variable in your deployment platform:
```bash
VITE_API_URL=https://evoluigestao-api.onrender.com
```
(Replace with your actual Render backend URL)

## Render Backend
The backend is deployed at: https://evoluigestao-api.onrender.com (configure this in Render dashboard)

Environment variables needed on Render:
- `NODE_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
