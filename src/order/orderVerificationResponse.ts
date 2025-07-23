export interface OrderVerificationResponse {
  totalPrice: number;
  discount: number;
  shippingCost: number;
  currency: string;
  isValid: boolean;
}
