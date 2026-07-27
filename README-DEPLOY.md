# Deployment Guide (Hostinger / Node.js)

This project has been hardened for production deployment on Hostinger or any standard Node.js/Express environment.

## 1. Prerequisites
- A Node.js environment (v18+)
- Your site files uploaded via FTP or File Manager (make sure to include `.env`, `package.json`, and all files except `node_modules`).

## 2. Environment Configuration
1. Open the `.env` file on your server.
2. Ensure `NODE_ENV=production`.
3. Set `JWT_SECRET` to a long, secure random string.
4. Set your `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
*(Never commit `.env` to source control!)*

## 3. Installation & Build
Connect to your server via SSH and run:
```bash
npm install
npm run build
```
*Note: If `npm install` fails due to optional dependency errors with Vite/Rolldown, remove `package-lock.json` and `node_modules` and try `npm install` again.*

## 4. Starting the Server
The application is configured to serve both the Express API and the Vite React frontend from a single server.

Start the server using PM2 (recommended for Hostinger):
```bash
pm2 start server.js --name sleekblue
pm2 save
```

Or run it normally (if testing):
```bash
npm start
```

## 5. File Permissions
The `runtime/` and `uploads/` directories must be writable by the Node.js process, as the site uses a file-based JSON storage system for content and settings.
