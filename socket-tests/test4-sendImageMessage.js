import { CHAT_ROOM_ID, USER_ID_1 } from './utils/socket-constant.js';
import { createSocket } from './utils/socketClient.js';

const socket = createSocket(USER_ID_1);
const chatRoomId = CHAT_ROOM_ID;

socket.on('connect', () => {
  socket.emit('sendMessage', {
    chatRoomId,
    userId: USER_ID_1,
    content: 'Here’s an image 📸',
    image: 'https://example.com/test-image.jpg',
  });
  console.log(`➡️ Sent image message to ${chatRoomId}`);
});
