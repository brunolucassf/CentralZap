import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Configuração do Vite para o frontend Central Zap
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // Encaminha chamadas /api e /socket para o backend em :3001
            '/api': 'http://localhost:3001',
            '/socket.io': {
                target: 'http://localhost:3001',
                ws: true,
            },
        },
    },
});
