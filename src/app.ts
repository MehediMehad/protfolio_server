import path from 'path';

import cors from 'cors';
import type { Application, NextFunction, Request, Response } from 'express';
import express from 'express';
import httpStatus from 'http-status';
import morgan from 'morgan';

import globalErrorHandler from './app/errors/globalErrorHandler';
import router from './app/routes';

// 🔑 Environment Variables
const NODE_ENV = 'development';

// 🚀 Express App
const app: Application = express();

// 📊 HTTP Logging (Morgan)
if (NODE_ENV === 'development') {
  app.use(morgan('dev')); // 🛠️ Development-friendly logging
} else {
  app.use(morgan('combined')); // 📁 Production-style logs
}

// 📁 Static Files For CSS
app.use(express.static(path.join(process.cwd(), 'public')));

// 🌐 CORS Configuration (support multiple origins)
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  }),
);

// 📦 Body parser – apply only when NOT multipart/form-data
app.use((req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    express.json({ limit: '10mb' })(req, res, () => {
      express.urlencoded({ extended: true })(req, res, next);
    });
  } else {
    next(); // skip body parser for file upload
  }
});

// 📡 API Health Check Search Browser ex: http://10.0.10.62:7090/
app.get('/', (_req: Request, res: Response) => {
  res.status(httpStatus.OK).send(`
  <h1 style="color: green">Aayaam Service is running</h1>
  `);
});

// 📡 API Routes
app.use('/api/v1', router);

// Force Error
app.get('/force-error', () => {
  throw new Error('Force Error');
});

// Get Data from Database with authentication
// app.get(
//   "/user",
//   auth(UserRoleEnum.SUPERADMIN),
//   async (_req: Request, res: Response) => {
//     const result = await prisma.user.findMany({ select: { name: true } });
//     res.send({
//       success: true,
//       data: result,
//       message: "Only ADMIN can access this data",
//     });
//   }
// );

// 🧯 Global Error Handler

app.use(globalErrorHandler);

// 🚫 404 Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API NOT FOUND!',
    error: {
      path: req.originalUrl,
      message: 'The requested endpoint does not exist.',
    },
  });
});

export default app;
