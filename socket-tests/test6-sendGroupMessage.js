import { createSocket } from './utils/socketClient.js';

const USER_ID_1 = '68d8bd965abf8dd1f454544c';
const socket = createSocket(USER_ID_1);
const groupChatRoomId = '68e34e72b478eb7809e260eb';

socket.on('connect', () => {
  socket.emit('sendMessage', {
    chatRoomId: groupChatRoomId,
    userId: USER_ID_1,
    content: 'Hello group! 🎉',
  });
  console.log(`➡️ Sent group message to ${groupChatRoomId}`);
});
