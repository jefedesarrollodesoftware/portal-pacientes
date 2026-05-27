import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: ['portal-pacientes.local']
  }
});