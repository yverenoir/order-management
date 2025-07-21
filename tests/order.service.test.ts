import { OrderService } from "../src/oders/order.service";

const orderService = new OrderService();

// TODO: extract test data into test data provider file with immutables
describe('Order Service', () => {
  describe('verifyOrder', () => {
    it('should return unit price when only order single item', () => {
      // location is same as Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 1, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009722, longitude: 2.547778}}};
      
      // when
      const res = orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(150.01);
      expect(res.discount).toBe(0);
      expect(res.shippingCost).toBe(0.01);
    });

    // TODO: parametrise tests
    it('should return apply discount when order amount is 25', () => {
      // location is same as Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 25, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009722, longitude: 2.547778}}};
      
      // when
      const res = orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(3562.6);
      expect(res.discount).toBe(187.5);
      expect(res.shippingCost).toBe(0.1);
    });

    // TODO: add more tests

  //   const discounts: Discount[] = [
  //     {id: 1, deviceId: 1, type: 1, minimumQuantity: 25, discount: 5},
  //     {id: 2, deviceId: 1, type: 1, minimumQuantity: 50, discount: 10},
  //     {id: 3, deviceId: 1, type: 1, minimumQuantity: 100, discount: 15},
  //     {id: 4, deviceId: 1, type: 1, minimumQuantity: 250, discount: 20}
  // ]
    it('should return apply discount when order amount is 50', () => {
      // location is same as Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 50, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009722, longitude: 2.547778}}};
      
      // when
      const res = orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(6750.19);
      expect(res.discount).toBe(750);
      expect(res.shippingCost).toBe(0.19);
    });

    it('should return apply discount when order amount is bigger than first discountable volume', () => {
      // location is same as Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 26, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009722, longitude: 2.547778}}};
      
      // when
      const res = orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(3705.1);
      expect(res.discount).toBe(195);
      expect(res.shippingCost).toBe(0.1);
    });

    it('should return shipping cost for distance less than 1km and weight less than 1kg', () => {
      // 0.0001km distance to Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 1, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009723, longitude: 2.547778}}};
      
      // when
      const res = orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(150.01);
      expect(res.discount).toBe(0);
      expect(res.shippingCost).toBe(0.01);
    });

    it('should return shipping cost when distance bigger than 1km and weight less than 1kg', () => {
      // 11.12km distance to Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 1, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.109723, longitude: 2.547778}}};
      
      // when
      const res = orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(150.12);
      expect(res.discount).toBe(0);
      expect(res.shippingCost).toBe(0.12);
    });

    it('should return shipping cost when distance less than 1km and weight more than 1kg', () => {
      // 0.0001km distance to Paris warehouse
      // weight: 4x365g = 1460g = 1.46kg -> rounding up to 2
      const orderRequest = {deviceOrders: [{deviceCount: 4, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009723, longitude: 2.547778}}};
      
      // when
      const res = orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(600.02);
      expect(res.discount).toBe(0);
      expect(res.shippingCost).toBe(0.02);
    });

    it('should validate order as invalid if shipping cost threshold reached and should return price information', () => {
      // Coordinate is Wellington (New Zealand), closest warehouse is HK, being 9,458km away
      const orderRequest = {deviceOrders: [{deviceCount: 1, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: -41.2923814, longitude: 174.7787463}}};
      
      // when
      const res = orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(false);
      expect(res.totalPrice).toBe(244.58);
      expect(res.discount).toBe(0);
      expect(res.shippingCost).toBe(94.58);
    });

    it('should calculate shipping cost from more than one warehouse', () => {
      // 0.0001km distance to Paris warehouse
      // takes 245 from paris warehouse
      // takes 1 from warsaw warehouse
      // 695 * 150 * 0.8 + 694 * 0.365 * 1 * 0.01 + 1 * 0.365 * 1,344.2 * 0.01
      // 83400 + 2.54 + 13.46 = 
      const orderRequest = {deviceOrders: [{deviceCount: 695, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009723, longitude: 2.547778}}};
      
      // when
      const res = orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(83416);
      expect(res.discount).toBe(20850);
      expect(res.shippingCost).toBe(16);
    });

    // should return all stock from one location before going to the next location
    // should go to the next closest warehouse
    // should calcuate shipping cost for one warehouse
    // should calcuate shipping cost for more than one warehouse
    // should validate order as invalid if shipping cost threshold reached and with discount applied to order

  });
});