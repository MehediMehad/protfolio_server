import { USER_ID_1 } from './utils/socket-constant.js';
import { createSocket } from './utils/socketClient.js';

const userId = USER_ID_1;

const socket = createSocket(userId);

socket.on('connect', () => {
  socket.emit('joinUser', userId);
  console.log('➡️ Emitted joinUser for USER_ID_1');
});

/*
🧭 How to Run Each Test

Run any test file individually:

node socket-tests/test1-joinUser.js


Or all sequentially (for quick full test):

for f in socket-tests/test*.js; do node $f; done
*/
