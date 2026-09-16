module.exports = {
  apps: [
    {
      name: "bharatbizmart",
      script: ".next/standalone/server.js",
      cwd: "/home/cybertricksmedia/public_html/bharatbizmart.cybertricksmedia.in/bharatbizmart",

      exec_mode: "fork",
      instances: 1,

      env: {
        NODE_ENV: "production",
        PORT: 3005,
        HOSTNAME: "127.0.0.1"
      },

      autorestart: true,
      watch: false,
      max_memory_restart: "1G"
    }
  ]
};
