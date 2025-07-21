import express from 'express';
import { verifyOrder, submitOrder } from './order.controller';

const router = express.Router();

router.post('/verify', verifyOrder);
router.post('/submit', submitOrder);

export default router;