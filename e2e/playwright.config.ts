import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: [
    {
      command: "./gradlew bootRun --args='--spring.profiles.active=e2e'",
      cwd: '../backend',
      url: 'http://localhost:8080/api/assignments',
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:5173',
      timeout: 30_000,
      reuseExistingServer: false,
    },
  ],
})
