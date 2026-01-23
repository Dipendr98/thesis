import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  // Automatically expose environment variables prefixed with VITE_ to the client
  envPrefix: ['VITE_'],
});
