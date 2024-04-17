import { defineConfig } from 'cypress'

export default defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1980,
  retries: {
    runMode: 2
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {},
  },
})