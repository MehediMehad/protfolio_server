import { CHAT_ROOM_ID, USER_ID_2 } from './utils/socket-constant.js';
import { createSocket } from './utils/socketClient.js';

const socket = createSocket(USER_ID_2);
const chatRoomId = CHAT_ROOM_ID;

socket.on('connect', () => {
  socket.emit('markMessagesAsRead', {
    chatRoomId,
    reserverId: USER_ID_2, // Replace with the actual user ID
  });
  console.log(`➡️ Emitted markMessagesAsRead for ${chatRoomId}`);
});

socket.on('messagesRead', (data) => {
  console.log('✅ Messages read:', data);
});
