import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  workers: 1,
  use: {
    baseURL: 'http://localhost:5174',
  },
  webServer: [
    {
      command: "./gradlew bootRun --args='--spring.profiles.active=e2e'",
      cwd: '../backend',
      url: 'http://localhost:8081/api/assignments',
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev -- --port 5174',
      cwd: '../frontend',
      url: 'http://localhost:5174',
      timeout: 30_000,
      reuseExistingServer: false,
      env: {
        API_PROXY_TARGET: 'http://localhost:8081',
      },
    },
  ],
})
