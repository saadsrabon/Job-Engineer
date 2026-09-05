/** PM2 process file — paths assume repo at /backend/Job-Engineer */
module.exports = {
  apps: [
    {
      name: 'jobos-api',
      cwd: '/backend/Job-Engineer',
      script: 'apps/api/dist/main.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'jobos-worker',
      cwd: '/backend/Job-Engineer',
      script: 'apps/worker/dist/main.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
