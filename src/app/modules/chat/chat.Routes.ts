import type { NextFunction, Request, Response } from 'express';
import express from 'express';

import { ChatControllers } from './chat.Controller';
import { ChatValidation } from './chat.Validation';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../middlewares/s3MulterMiddleware';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// Create or get a private chat room
router.post('/create-room', auth('OWNER', 'SITTER', 'TRAINER'), ChatControllers.createChatRoom);

// Create a group chat
router.post('/create-group', auth('OWNER', 'SITTER', 'TRAINER'), ChatControllers.createGroupChat);

// Add user to group chat
router.post(
  '/group/add-user',
  auth('OWNER', 'SITTER', 'TRAINER'),
  validateRequest(ChatValidation.addUserToGroupSchema),
  ChatControllers.addUserToGroup,
);

// Remove user from group chat
router.post(
  '/group/remove-user',
  auth('OWNER', 'SITTER', 'TRAINER'),
  ChatControllers.removeUserFromGroup,
);

// Get user's chat rooms
router.get('/rooms', auth('OWNER', 'SITTER', 'TRAINER'), ChatControllers.getUserChatRooms);

// Get messages for a chat room
router.get(
  '/messages/:chatRoomId',
  auth('OWNER', 'SITTER', 'TRAINER'),
  ChatControllers.getMessages,
);

// Send a message (text or image)
router.post(
  '/send-message',
  auth('OWNER', 'SITTER', 'TRAINER'),
  fileUploader.uploadFields,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (typeof req.body.data === 'string') {
        req.body.data = JSON.parse(req.body.data);
      }

      const parsedData = ChatValidation.sendMessageSchema.parse(req.body.data);
      req.body = parsedData;

      ChatControllers.sendMessage(req, res, next);
    } catch (error) {
      next(error);
    }
  },
);

// Mark messages as read
router.post(
  '/mark-read/:chatRoomId',
  auth('OWNER', 'SITTER', 'TRAINER'),
  ChatControllers.markMessagesAsRead,
);

export const ChatRoutes = router;
