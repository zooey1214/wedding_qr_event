import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  assetsInclude: ["**/*.csv"],

  server: {
    // true로 설정하면 모든 호스트 체크를 우회합니다 (Vite 6 이상)
    allowedHosts: true,

    // 만약 true가 작동하지 않는 환경이라면 아래와 같이 패턴으로 넣을 수 있습니다.
    // allowedHosts: [".ngrok-free.dev", ".ngrok-free.app"],

    // 외부 기기(모바일 등)에서도 접속 가능하게 하려면 host 설정을 추가하는 것이 좋습니다.
    host: true,
  },
});
