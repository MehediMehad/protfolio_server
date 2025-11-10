import type { Request, Response } from 'express';
import httpStatus from 'http-status';

import { ChatServices } from './chat.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createChatRoom = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { recipientId } = req.body;

  const chatRoom = await ChatServices.createChatRoom(userId, recipientId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Private chat room created or retrieved successfully',
    data: chatRoom,
  });
});

const createGroupChat = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { userIds, name } = req.body;

  const chatRoom = await ChatServices.createGroupChat(userId, userIds, name);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Group chat created successfully',
    data: chatRoom,
  });
});

const addUserToGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { chatRoomId, userId: newUserId } = req.body;

  const chatRoom = await ChatServices.addUserToGroup(userId, chatRoomId, newUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User added to group chat successfully',
    data: chatRoom,
  });
});

const removeUserFromGroup = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { chatRoomId, userId: removeUserId } = req.body;

  const chatRoom = await ChatServices.removeUserFromGroup(userId, chatRoomId, removeUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User removed from group chat successfully',
    data: chatRoom,
  });
});

const getUserChatRooms = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const chatRooms = await ChatServices.getUserChatRooms(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chat rooms fetched successfully',
    data: chatRooms,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { chatRoomId } = req.params;

  const messages = await ChatServices.getMessages(userId, chatRoomId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages fetched successfully',
    data: messages,
  });
});

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const images = (files && files?.['images']) || null;
  const { chatRoomId, content } = req.body;

  const message = await ChatServices.sendMessage(userId, chatRoomId, content, images);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message sent successfully',
    data: message,
  });
});

const markMessagesAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { chatRoomId } = req.params;

  await ChatServices.markMessagesAsRead(userId, chatRoomId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages marked as read',
  });
});

export const ChatControllers = {
  createChatRoom,
  createGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  getUserChatRooms,
  getMessages,
  sendMessage,
  markMessagesAsRead,
};
