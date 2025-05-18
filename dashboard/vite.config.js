import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import postcssNesting from 'postcss-nesting';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig(() => {
  const endPoint = process.env.VITE_END_POINT || '';
  return {
    plugins: [react()],
    base: endPoint + '/',
    css: {
      postcss: {
        plugins: [
          postcssNesting(),
          tailwindcss(),
          autoprefixer(),
        ],
      },
    },
    server: {
      allowedHosts: ['widm.csie.ncu.edu.tw'],
      host: '0.0.0.0',
    },
  };
});
