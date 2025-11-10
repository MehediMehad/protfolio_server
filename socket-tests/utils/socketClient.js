// socket-tests/utils/socketClient.js
import { io } from 'socket.io-client';
import { USER_ID_1 } from './socket-constant.js';
import { SOCKETURL } from './socket-constant.js';
export function createSocket(userId = USER_ID_1) {
  const socket = io(SOCKETURL, {
    transports: ['websocket'],
    query: { userId },
  });

  socket.on('connect', () => {
    console.log(`✅ Connected as ${userId}:`, socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from server');
  });

  socket.on('error', (err) => {
    console.error('❌ Socket error:', JSON.stringify(err, null, 2));
  });

  return socket;
}
