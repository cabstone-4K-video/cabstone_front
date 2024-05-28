import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // 프로젝트의 기본 경로 설정
  plugins: [react()]
});
