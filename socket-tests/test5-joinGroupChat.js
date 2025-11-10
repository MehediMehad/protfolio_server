import { USER_ID_1 } from './utils/socket-constant.js';
import { createSocket } from './utils/socketClient.js';

const socket = createSocket(USER_ID_1); // USER_ID_1
const groupChatRoomId = '68e34e72b478eb7809e260eb'; // GROUP_CHAT_ROOM_ID_456

socket.on('connect', () => {
  socket.emit('joinChatRoom', groupChatRoomId);
  console.log(`➡️ Joined group chat ${groupChatRoomId}`);
});
