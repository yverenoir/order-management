import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { OrderRequest } from './orderRequest';
import { OrderVerificationResponse } from './orderVerificationResponse';

// TODO: use DI
const orderService = new OrderService();

export function verifyOrder(req: Request<OrderRequest>, res: Response<OrderVerificationResponse>) {
  const order: OrderRequest = req.body;
  
  const response = orderService.verifyOrder(order);
  res.status(200).json(response);
}