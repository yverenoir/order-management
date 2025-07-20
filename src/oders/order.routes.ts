import express from 'express';
import { verifyOrder } from './order.controller';

const router = express.Router();

router.post('/verify', verifyOrder);

export default router;