# Sleekblue Media Houz

React + Express website for a Nigerian printing and branding company.

## Stack
- **Frontend:** React 19, Vite 8, Tailwind CSS 4, react-router-dom v7
- **Backend:** Express 5, JWT auth, multer (file uploads), helmet, rate-limiting
- **Data storage:** JSON files at root (site-data.json, leads.json, etc.)
- **Images:** Local uploads stored in `uploads/` at runtime

## How to run
- **Production (Hostinger):** `npm install && npm run build && npm start`
- **Dev (API only):** `node server.js` — listens on `process.env.PORT || 3000`
- **Dev (frontend HMR):** `npm run dev` — Vite on port 5000, proxies `/api` to port 3000

## Key environment variables
- `JWT_SECRET` — required, used to sign admin JWTs
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — admin dashboard credentials
- `PORT` — set automatically by Hostinger

## Project layout
```
server.js          Root entry point (Express API + serves dist/)
package.json       Root package (main: server.js, start: node server.js)
vite.config.js     Vite config — builds to dist/, @assets alias → ./attached_assets
src/               React source
public/            Static assets
attached_assets/   Product/hero reference images
uploads/           Runtime file uploads (not committed)
*.json             CMS/data files (site-data, leads, analytics, etc.)
```

## User preferences
