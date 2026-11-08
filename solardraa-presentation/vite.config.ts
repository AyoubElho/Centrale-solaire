import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: './',
  // The scientific figures are versioned once, next to the notebooks.  Serving
  // that directory directly guarantees that the React deck and the notebooks
  // display the exact same PNG bytes, including in an offline production build.
  publicDir: '../docs',
});
