# Sleekblue Media Houz

Premium printing and branding company website — die-cut stickers, flex banners, business cards, corporate branding, and more.

Built with **React + Vite** (frontend) and **Express** (backend API), deployable as a Node.js web app on Hostinger.

---

## Project Structure

```
/
├── server.js          # Express API server (root entry point)
├── package.json       # Root package — dependencies, scripts, engines
├── vite.config.js     # Vite build config
├── tailwind.config.js
├── postcss.config.js
├── index.html         # Vite HTML entry
├── src/               # React frontend source
├── public/            # Static assets (fonts, manifest, sw.js)
├── attached_assets/   # Product/hero images
├── site-data.json     # CMS data (hero, products, blog)
├── leads.json         # Lead submissions
└── uploads/           # Uploaded files (created at runtime)
```

---

## Environment Variables

Configure these in Hostinger hPanel → Node.js → Environment Variables (never commit real values):

| Variable         | Required | Description                                      |
|------------------|----------|--------------------------------------------------|
| `JWT_SECRET`     | ✅        | Long random string (min 32 chars) for JWT signing |
| `ADMIN_USERNAME` | ✅        | Admin dashboard login username                   |
| `ADMIN_PASSWORD` | ✅        | Admin dashboard login password                   |
| `PORT`           | ⬜        | Assigned automatically by Hostinger              |

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Deployment on Hostinger (Node.js Web App)

1. Connect your GitHub repository in hPanel.
2. Set the environment variables above.
3. Configure the deployment command:
   ```
   npm install && npm run build && npm start
   ```
4. Hostinger will run `npm start` (`node server.js`) to launch the app.

The server serves the built React frontend from `dist/` and handles all API routes under `/api/`.

---

## Local Development

```bash
npm install
npm run build        # Build React frontend once
npm start            # Start Express server (serves built frontend on port 3000)
```

Or for hot-reload dev mode:
```bash
npm run dev          # Vite dev server only (port 5000, proxies /api to port 3000)
# In a separate terminal:
node server.js       # Express API server (port 3000)
```
