// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', ''); // ✅ ไม่ต้องใช้ process.cwd()

  console.log("✅ VITE_API_URL loaded:", env.VITE_API_URL); // ✅ SAFE

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      allowedHosts: ['localhost', 'airline.phitik.com'],
    },
  };
});
