// pm2 process supervisor config. Keeps the parser/academy/admin backend alive
// under real concurrent load: if it ever does crash (OOM, a fatal error that
// slips past the in-process handlers in server.js), pm2 restarts it within
// seconds instead of the site staying down until someone notices by hand.
//
// Usage:
//   npx pm2 start ecosystem.config.cjs   # start under supervision
//   npx pm2 restart aura-parser          # restart (picks up code changes)
//   npx pm2 logs aura-parser             # tail logs
//   npx pm2 status                       # check it's alive
//   npx pm2 stop aura-parser             # stop
module.exports = {
  apps: [
    {
      name: 'aura-parser',
      script: 'server.js',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      // A genuine crash loop (e.g. a bad deploy) should not spin forever -
      // back off after repeated failures instead of hammering the process.
      max_restarts: 20,
      min_uptime: '15s',
      restart_delay: 2000,
      exp_backoff_restart_delay: 2000,
      // Restart if the process leaks past this - better a 2s blip than a
      // slow OOM that eventually takes the whole machine down.
      max_memory_restart: '800M',
      // Give server.js's SIGTERM handler (httpServer.close(), draining
      // in-flight requests) enough time to finish before pm2 escalates to
      // SIGKILL. Must stay comfortably above the 9s hard-timeout fallback
      // in server.js's gracefulShutdown().
      kill_timeout: 10000,
      out_file: '.runtime/pm2-out.log',
      error_file: '.runtime/pm2-err.log',
      merge_logs: true,
      time: true
    },
    {
      // CLACK's Telegram bot (admin panel + subscriber announcements +
      // class reminders). Lives in a separate folder, needs no tunnel/port -
      // only outbound internet to the Telegram Bot API - so it's bundled
      // here purely for one-launcher convenience, not because it's related
      // to the parser.
      name: 'clack-bot',
      script: 'bot.js',
      cwd: 'C:\\Users\\Sasha\\Desktop\\clack',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_restarts: 20,
      min_uptime: '15s',
      restart_delay: 2000,
      exp_backoff_restart_delay: 2000,
      max_memory_restart: '300M',
      out_file: 'C:\\Users\\Sasha\\Desktop\\clack\\.runtime\\bot-out.log',
      error_file: 'C:\\Users\\Sasha\\Desktop\\clack\\.runtime\\bot-err.log',
      merge_logs: true,
      time: true
    }
  ]
};
