import httpStatus from 'http-status';

import ApiError from '../../errors/ApiError';
import prisma from '../../libs/prisma';

const createChatRoom = async (userId: string, recipientId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, status: 'ACTIVE' },
  });
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId, status: 'ACTIVE' },
  });

  if (!user || !recipient) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User or recipient not found or blocked');
  }

  let chatRoom = await prisma.chatRoom.findFirst({
    where: {
      type: 'PRIVATE',
      AND: [{ userIds: { has: userId } }, { userIds: { has: recipientId } }],
    },
    include: {
      users: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  if (!chatRoom) {
    chatRoom = await prisma.chatRoom.create({
      data: {
        userIds: [userId, recipientId],
        users: { connect: [{ id: userId }, { id: recipientId }] },
        type: 'PRIVATE',
      },
      include: {
        users: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    // Update chatRoomIds in User model
    await prisma.user.update({
      where: { id: userId },
      data: { chatRoomIds: { push: chatRoom.id } },
    });
    await prisma.user.update({
      where: { id: recipientId },
      data: { chatRoomIds: { push: chatRoom.id } },
    });
  }

  return chatRoom;
};

const createGroupChat = async (userId: string, userIds: string[], name: string) => {
  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds, userId] }, status: 'ACTIVE' },
  });

  if (users.length !== userIds.length + 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'One or more users not found or blocked');
  }

  const chatRoom = await prisma.chatRoom.create({
    data: {
      userIds: [...userIds, userId],
      users: { connect: [...userIds, userId].map((id) => ({ id })) },
      type: 'GROUP',
      name,
      adminId: userId,
    },
    include: {
      users: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  // Update chatRoomIds for all users
  await prisma.user.updateMany({
    where: { id: { in: [...userIds, userId] } },
    data: { chatRoomIds: { push: chatRoom.id } },
  });

  return chatRoom;
};

const addUserToGroup = async (adminId: string, chatRoomId: string, newUserId: string) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
  });

  if (!chatRoom || chatRoom.type !== 'GROUP') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Group chat not found');
  }

  if (chatRoom.adminId !== adminId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only the admin can add users');
  }

  const user = await prisma.user.findUnique({
    where: { id: newUserId, status: 'ACTIVE' },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found or blocked');
  }

  if (chatRoom.userIds.includes(newUserId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already in group');
  }

  const updatedChatRoom = await prisma.chatRoom.update({
    where: { id: chatRoomId },
    data: {
      userIds: { push: newUserId },
      users: { connect: { id: newUserId } },
    },
    include: {
      users: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  // Update chatRoomIds for the new user
  await prisma.user.update({
    where: { id: newUserId },
    data: { chatRoomIds: { push: chatRoomId } },
  });

  return updatedChatRoom;
};

const removeUserFromGroup = async (adminId: string, chatRoomId: string, removeUserId: string) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
  });

  if (!chatRoom || chatRoom.type !== 'GROUP') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Group chat not found');
  }

  if (chatRoom.adminId !== adminId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only the admin can remove users');
  }

  if (!chatRoom.userIds.includes(removeUserId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not in group');
  }

  const updatedChatRoom = await prisma.chatRoom.update({
    where: { id: chatRoomId },
    data: {
      userIds: { set: chatRoom.userIds.filter((id) => id !== removeUserId) },
      users: { disconnect: { id: removeUserId } },
    },
    include: {
      users: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  // Remove chatRoomId from the user's chatRoomIds
  await prisma.user.update({
    where: { id: removeUserId },
    data: {
      chatRoomIds: {
        set: (await prisma.user.findUnique({ where: { id: removeUserId } }))?.chatRoomIds.filter(
          (id) => id !== chatRoomId,
        ),
      },
    },
  });

  return updatedChatRoom;
};

const getUserChatRooms = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, status: 'ACTIVE' },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found or blocked');
  }

  const chatRooms = await prisma.chatRoom.findMany({
    where: { userIds: { has: userId } },
    include: {
      users: { select: { id: true, name: true, email: true, image: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const formattedChatRooms = chatRooms.map((room) => ({
    ...room,
    unreadCount: room.messages.filter((msg) => !msg.readBy.includes(userId)).length,
    name: room.type === 'GROUP' ? room.name : room.users.find((u) => u.id !== userId)?.name,
  }));

  return formattedChatRooms;
};

const getMessages = async (userId: string, chatRoomId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, status: 'ACTIVE' },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found or blocked');
  }

  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
    include: {
      users: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  if (!chatRoom || !chatRoom.userIds.includes(userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access to chat room denied');
  }

  const messages = await prisma.message.findMany({
    where: { chatRoomId },
    include: {
      sender: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return messages;
};

const sendMessage = async (
  userId: string,
  chatRoomId: string,
  content: string | undefined,
  images: any | null, //eslint-disable-line
) => {
  if (!content && !images) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Message content or image is required');
  }

  let imagesUrls: string[] = [];
  if (images) {
    imagesUrls = images.map((img: any) => img.location); //eslint-disable-line
  }

  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
    include: { users: true },
  });

  if (!chatRoom || !chatRoom.userIds.includes(userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access to chat room denied');
  }

  const message = await prisma.message.create({
    data: {
      chatRoomId,
      senderId: userId,
      content,
      images: imagesUrls.length > 0 ? imagesUrls : undefined,
      readBy: [userId], // Sender has read their own message
    },
    include: {
      sender: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  // Update chat room's updatedAt timestamp
  await prisma.chatRoom.update({
    where: { id: chatRoomId },
    data: { updatedAt: new Date() },
  });

  return message;
};

const markMessagesAsRead = async (userId: string, chatRoomId: string) => {
  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: chatRoomId },
  });

  if (!chatRoom || !chatRoom.userIds.includes(userId)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access to chat room denied');
  }

  await prisma.message.updateMany({
    where: {
      chatRoomId,
      NOT: { readBy: { has: userId } },
    },
    data: {
      isRead: true,
      readBy: { push: userId },
    },
  });
};

export const ChatServices = {
  createChatRoom,
  createGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  getUserChatRooms,
  getMessages,
  sendMessage,
  markMessagesAsRead,
};
