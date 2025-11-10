import { GROUP_CHAT_ROOM_ID, USER_ID_1, USER_ID_2 } from './utils/socket-constant.js';
import { createSocket } from './utils/socketClient.js';

const socket = createSocket(USER_ID_1);
const groupChatRoomId = GROUP_CHAT_ROOM_ID;

socket.on('connect', () => {
  socket.emit('userRemovedFromGroup', {
    chatRoomId: groupChatRoomId,
    userId: USER_ID_2,
  });
  console.log(`➡️ Emitted userRemovedFromGroup for USER_ID_2 in ${groupChatRoomId}`);
});

socket.on('removedFromGroup', (data) => {
  console.log('➖ Removed from group:', data);
});
