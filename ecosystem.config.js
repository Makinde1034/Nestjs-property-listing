module.exports = {
  apps: [
    {
      name: 'my-app',
      script: 'dist/main.js',
      node_args: '--max-old-space-size=8192', // Allocate 8GB memory to Node.js
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '6G', // Restart if memory exceeds 6GB
    },
  ],
};
