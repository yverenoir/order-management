import { Request, Response } from 'express';
import * as orderService from './order.service';
import { OrderRequest } from './orderRequest';
import { OrderVerificationResponse } from './orderVerificationResponse';
import {OrderSubmissionResponse} from "./orderSubmissionResponse";

export async function verifyOrder(req: Request<OrderRequest>, res: Response<OrderVerificationResponse>) {
  const order: OrderRequest = req.body;
  
  const response = await orderService.verifyOrder(order);
  res.status(200).json(response);
}

export async function submitOrder(req: Request<OrderRequest>, res: Response<OrderSubmissionResponse>) {
  const order: OrderRequest = req.body;

  const response = await orderService.submitOrder(order);
  res.status(200).json(response);
}