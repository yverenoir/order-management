import express, { Request, Response } from 'express';
import orderRoutes from './oders/order.routes';

const app = express();
app.use(express.json());

// Health check route with defined types
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'Order Management API is running successfully!' });
});

 // Register domain routes
 app.use('/orders', orderRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});