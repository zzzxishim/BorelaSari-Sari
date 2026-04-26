import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { db } from './db.js';
import productsRouter from './routes/products.js';
import salesRouter from './routes/sales.js';
import expensesRouter from './routes/expenses.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
const httpServer = createServer(app);
const corsOrigin = process.env.CORS_ORIGIN || '*';

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Attach io to requests so routes can emit events
app.use((req, _res, next) => {
  (req as any).io = io;
  next();
});

app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/dashboard', dashboardRouter);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { io };

