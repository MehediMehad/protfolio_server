import type { Server, Socket } from 'socket.io';

import { ChatServices } from './chat.service';
import prisma from '../../libs/prisma';

export function initializeSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinUser', (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('joinChatRoom', (chatRoomId: string) => {
      socket.join(chatRoomId);
      console.log(`User joined chat room: ${chatRoomId}`);
    });

    socket.on(
      'sendMessage',
      async (data: { chatRoomId: string; userId: string; content?: string; image?: string }) => {
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          const { chatRoomId, userId, content, image } = parsed;
          const message = await ChatServices.sendMessage(userId, chatRoomId, content, image);

          io.to(chatRoomId).emit('receiveMessage', message);

          const chatRoom = await prisma.chatRoom.findUnique({
            where: { id: chatRoomId },
            select: { userIds: true, type: true, name: true },
          });

          if (chatRoom) {
            chatRoom.userIds
              .filter((id) => id !== userId)
              .forEach((recipientId) => {
                io.to(recipientId).emit('newMessageNotification', {
                  chatRoomId,
                  message,
                  groupName: chatRoom.type === 'GROUP' ? chatRoom.name : null,
                });
              });
          }
        } catch (error) {
          console.error(error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      },
    );

    socket.on('getMessages', async (data: { chatRoomId: string; userId: string }) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const { chatRoomId, userId } = parsed;

        const messages = await ChatServices.getMessages(userId, chatRoomId);

        // send messages back only to this user (not broadcast)
        socket.emit('chatMessages', messages);
      } catch (error) {
        console.error(error);
        socket.emit('error', { message: 'Failed to fetch messages' });
      }
    });

    socket.on('markMessagesAsRead', async (data: { chatRoomId: string; reserverId: string }) => {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const { chatRoomId, reserverId } = parsed;

        await ChatServices.markMessagesAsRead(reserverId, chatRoomId);

        io.to(chatRoomId).emit('messagesRead', { chatRoomId, reserverId });
      } catch (error) {
        console.error(error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    socket.on('userAddedToGroup', async (data: { chatRoomId: string; userId: string }) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const { chatRoomId, userId } = parsed;
      socket.to(userId).emit('addedToGroup', { chatRoomId });
      socket.join(chatRoomId);
    });

    socket.on('userRemovedFromGroup', async (data: { chatRoomId: string; userId: string }) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const { chatRoomId, userId } = parsed;
      socket.to(userId).emit('removedFromGroup', { chatRoomId });
      socket.leave(chatRoomId);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
