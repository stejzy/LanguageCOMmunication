import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:8081", // Twój frontend
    env: {
      apiUrl: "http://localhost:8080",
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
