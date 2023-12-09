import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    base: "/Webviewer/",
    plugins: [basicSsl(), react()],
    server: {
      https: true,
      host: true,
      port: 3000,
    },
  };
});
