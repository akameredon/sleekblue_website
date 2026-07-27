// PM2 Ecosystem Config — Sleekblue Media Houz
// Used by Hostinger Node.js hosting and for local production testing.
// Start with: pm2 start ecosystem.config.cjs
// Or via npm:  npx pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: 'sleekblue',
      script: 'server.js',
      // Hostinger assigns PORT automatically via env; fallback to 3000 locally
      env: {
        NODE_ENV: 'production',
      },
      // Restart on crash, with exponential back-off
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      // Log files (relative to project root)
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Keep last 10 rotated log files
      log_rotate: true,
    },
  ],
}
