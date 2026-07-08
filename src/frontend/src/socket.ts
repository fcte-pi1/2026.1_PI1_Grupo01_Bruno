import { io } from 'socket.io-client';

// Isso garante que o sistema inteiro use um único canal de comunicação
export const socket = io('http://localhost:3000', { query: { role: 'frontend' } });