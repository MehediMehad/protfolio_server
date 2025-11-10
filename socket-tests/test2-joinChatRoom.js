import { CHAT_ROOM_ID, USER_ID_1 } from './utils/socket-constant.js';
import { createSocket } from './utils/socketClient.js';

const socket = createSocket(USER_ID_1);
const chatRoomId = CHAT_ROOM_ID; // CHAT_ROOM_ID_123

socket.on('connect', () => {
  socket.emit('joinChatRoom', chatRoomId);
  console.log(`➡️ Joined chat room ${chatRoomId}`);
});
