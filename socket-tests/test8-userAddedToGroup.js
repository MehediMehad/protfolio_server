import { GROUP_CHAT_ROOM_ID, USER_ID_1, USER_ID_2 } from './utils/socket-constant.js';
import { createSocket } from './utils/socketClient.js';

const socket = createSocket(USER_ID_1);
const groupChatRoomId = GROUP_CHAT_ROOM_ID;

socket.on('connect', () => {
  socket.emit('userAddedToGroup', {
    chatRoomId: groupChatRoomId,
    userId: USER_ID_2,
  });
  console.log(`➡️ Emitted userAddedToGroup for USER_ID_2 in ${groupChatRoomId}`);
});

socket.on('addedToGroup', (data) => {
  console.log('➕ Added to group:', data);
});
