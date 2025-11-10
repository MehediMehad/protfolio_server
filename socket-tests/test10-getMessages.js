import { CHAT_ROOM_ID, USER_ID_1 } from './utils/socket-constant.js';
import { createSocket } from './utils/socketClient.js';

const socket = createSocket(USER_ID_1);
const chatRoomId = CHAT_ROOM_ID;

socket.on('connect', () => {
  // Emit the getMessages event
  socket.emit('getMessages', {
    chatRoomId,
    userId: USER_ID_1,
  });
  console.log(`➡️ Emitted getMessages for ${chatRoomId} by ${USER_ID_1}`);
});

// Receive messages from the server
socket.on('chatMessages', (messages) => {
  console.log('📨 Received chatMessages:', messages);
  messages.forEach((msg, index) => {
    const time = new Date(msg.createdAt).toLocaleTimeString();
    console.log(`${index + 1}. ${msg.sender.name}: ${msg.content} (${time})`);
  });

  // Optional: socket disconnect after test
  socket.disconnect();
});

// Error handle
socket.on('error', (err) => {
  console.error('❌ Socket Error:', err);
});
