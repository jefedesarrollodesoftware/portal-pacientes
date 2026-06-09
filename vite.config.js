import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: ['portal-pacientes.local', 'admin-portal-pacientes.local']
  }
});