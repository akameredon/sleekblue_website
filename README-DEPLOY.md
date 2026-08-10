# Deployment Guide (Hostinger / Node.js VPS)

This project serves the React frontend and Express API from a single Node.js process. Follow every step in order.

---

## 1. Prerequisites

- Node.js v18 or later (v20 recommended)
- SSH access to your server
- Your Paystack **Live** secret key (Paystack Dashboard → Settings → API Keys)

---

## 2. Upload Files

Upload everything **except** `node_modules/` and `.env` to your server (FTP / File Manager / `rsync`).

---

## 3. Environment Configuration

```bash
# On the server, copy the example file and open it for editing
cp .env.example .env
nano .env        # or vi .env
```

Fill in **every** value:

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No | Leave blank — Hostinger sets this automatically |
| `NODE_ENV` | Yes | Must be `production` |
| `JWT_SECRET` | **Yes** | Min 32 chars — generate with the command below |
| `ADMIN_USERNAME` | No | Defaults to `admin` |
| `ADMIN_PASSWORD` | **Yes** | Use a strong password |
| `PAYSTACK_SECRET_KEY` | **Yes** | Your Paystack live secret key |

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Never commit your `.env` file to version control.** It is already in `.gitignore`.

The server **refuses to start** in production if `JWT_SECRET`, `ADMIN_PASSWORD`, or `PAYSTACK_SECRET_KEY` are missing or if `JWT_SECRET` is shorter than 32 characters. All errors are reported together so you can fix them in one pass.

---

## 4. Install Dependencies & Build

```bash
npm install
npm run build
```

> If `npm install` fails due to optional dependency errors (Vite/Rolldown), delete `package-lock.json` and `node_modules/` then retry.

---

## 5. Create Required Directories

The `runtime/`, `uploads/`, and `logs/` directories must be writable by the Node.js process:

```bash
mkdir -p logs runtime uploads
```

---

## 6. Start the Server

**Recommended — PM2 (persistent across reboots):**
```bash
pm2 start ecosystem.config.cjs
pm2 save          # persist across server reboots
pm2 startup       # print the command to run on boot (follow its instructions)
```

**Simple (for testing only):**
```bash
npm start
```

---

## 7. Verify the Deployment

```bash
# Check the server is running and secrets were accepted
pm2 logs sleekblue --lines 30

# Confirm the API responds
curl http://localhost:3000/api/site-data
```

## 8. Post-deploy smoke test

The GitHub deploy workflow now runs a remote smoke test after SSH deploy completes. It checks the live site with `/api/health` and fails the deployment if the health endpoint does not respond successfully.

If you need to override the site URL used by the smoke test, set the `SITE_URL` repository secret in GitHub Actions.

```text
SITE_URL=https://sleekbluemedia.com
```

## 9. Dependabot

Dependabot is configured to run weekly for npm dependencies. When updates are available, it opens automated pull requests labeled `dependencies` and `automated`.

Review these PRs carefully before merging, especially for major package updates that may affect production behavior.

## 10. Production health monitoring

A GitHub workflow now checks the production `/api/health` endpoint every 4 hours. It uses the `SITE_URL` repository secret when available and fails if the service is not healthy.

```text
SITE_URL=https://sleekbluemedia.com
```

---

## 11. File Permissions

`runtime/` and `uploads/` must be writable by the Node.js process (the server uses file-based JSON storage):

```bash
chmod -R 755 runtime uploads
```
