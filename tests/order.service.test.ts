import * as orderService from "../src/oder/order.service";
import * as dataProvider from '../src/db/data.provider';
import * as allocationService from "../src/allocation/allocation.service";

describe('Order Service', () => {
  beforeEach(() => {
    jest.spyOn(dataProvider, 'getDeviceById').mockReturnValue(Promise.resolve({ id: 1, name: 'SCOS Station P1 Pro', weightInGram: 365, currency: "USD", price: 150 }));

    jest.spyOn(dataProvider, 'getStocksByDeviceId').mockReturnValue(Promise.resolve([
        {id: 1, deviceId: 1, unit: 355, warehouseId: 1},
        {id: 2, deviceId: 1, unit: 578, warehouseId: 2},
        {id: 3, deviceId: 1, unit: 265, warehouseId: 3},
        {id: 4, deviceId: 1, unit: 694, warehouseId: 4},
        {id: 5, deviceId: 1, unit: 245, warehouseId: 5},
        {id: 6, deviceId: 1, unit: 419, warehouseId: 6},
      ]));

    const warehouses = [
      {id: 1, name: "Los Angeles", latitude: 33.9425, longitude: -118.408056},
      {id: 2, name: "New York", latitude: 40.639722, longitude: -73.778889},
      {id: 3, name: "Sao Paulo", latitude: -23.435556, longitude: -46.473056},
      {id: 4, name: "Paris", latitude: 49.009722, longitude: 2.547778},
      {id: 5, name: "Warsaw", latitude: 52.165833, longitude: 20.967222},
      {id: 6, name: "Hong Kong", latitude: 22.308889, longitude: 113.914444},
    ];

    jest.spyOn(dataProvider, 'getWarehouseById').mockImplementation((id) => {
      const warehouse = warehouses.find((warehouse) => warehouse.id === id);
      if (!warehouse) {
        return Promise.reject(new Error('Warehouse not found'));
      }
      return Promise.resolve(warehouse);
    });

    jest.spyOn(dataProvider, 'getDiscountsByDeviceId').mockReturnValue(Promise.resolve([
        {id: 1, deviceId: 1, type: 1, minimumQuantity: 25, discount: 5},
        {id: 2, deviceId: 1, type: 1, minimumQuantity: 50, discount: 10},
        {id: 3, deviceId: 1, type: 1, minimumQuantity: 100, discount: 15},
        {id: 4, deviceId: 1, type: 1, minimumQuantity: 250, discount: 20}
      ]));

    jest.spyOn(dataProvider, 'addOrder').mockReturnValue(Promise.resolve(1));

    jest.spyOn(dataProvider, 'reduceStock').mockReturnValue(Promise.resolve());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('verifyOrder', () => {
    // Test cases not covered:
    // should return all stock from one location before going to the next location
    // should go to the next closest warehouse
    // should calculate shipping cost for one warehouse
    // should calculate shipping cost for more than one warehouse
    // should validate order as invalid if shipping cost threshold reached and with discount applied to order

    it('should return unit price when only order single item', async () => {
      // location is same as Paris warehouse
      const orderRequest = {
        deviceOrders: [{deviceCount: 1, deviceIdentifier: 1}],
        shippingAddress: {coordinate: {latitude: 49.009722, longitude: 2.547778}}
      };

      // when
      const res = await orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(150.01);
      expect(res.discount).toBe(0);
      expect(res.shippingCost).toBe(0.01);
    });

    it('should call data provider to get device info', async () => {
      // location is same as Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 1, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009722, longitude: 2.547778}}};

      // when
      await orderService.verifyOrder(orderRequest);

      // then
      expect(dataProvider.getDeviceById).toHaveBeenCalledWith(1);
    });

    it('should call allocation service', async () => {
      // location is same as Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 1, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009722, longitude: 2.547778}}};
      jest.spyOn(allocationService, 'allocate').mockReturnValue(Promise.resolve([{warehouseId: 4, unitsTakenFromWarehouse: 1, distanceToCustomer: 0.0001, stockUnits: 10, deviceId: 1}]));

      // when
      await orderService.verifyOrder(orderRequest);

      // then
      expect(allocationService.allocate).toHaveBeenCalledTimes(1);
    });

    it('should return apply discount when order amount is 25', async () => {
      // location is same as Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 25, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009722, longitude: 2.547778}}};
      
      // when
      const res = await orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(3562.6);
      expect(res.discount).toBe(187.5);
      expect(res.shippingCost).toBe(0.1);
    });

    it('should return apply discount when order amount is 50', async () => {
      // location is same as Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 50, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009722, longitude: 2.547778}}};
      
      // when
      const res = await orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(6750.19);
      expect(res.discount).toBe(750);
      expect(res.shippingCost).toBe(0.19);
    });

    it('should return apply discount when order amount is bigger than first discountable volume', async () => {
      // location is same as Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 26, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009722, longitude: 2.547778}}};
      
      // when
      const res = await orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(3705.1);
      expect(res.discount).toBe(195);
      expect(res.shippingCost).toBe(0.1);
    });

    it('should return shipping cost for distance less than 1km and weight less than 1kg', async () => {
      // 0.0001km distance to Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 1, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009723, longitude: 2.547778}}};
      
      // when
      const res = await orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(150.01);
      expect(res.discount).toBe(0);
      expect(res.shippingCost).toBe(0.01);
    });

    it('should return shipping cost when distance bigger than 1km and weight less than 1kg', async () => {
      // 11.12km distance to Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 1, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.109723, longitude: 2.547778}}};
      
      // when
      const res = await orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(150.12);
      expect(res.discount).toBe(0);
      expect(res.shippingCost).toBe(0.12);
    });

    it('should return shipping cost when distance less than 1km and weight more than 1kg', async () => {
      // 0.0001km distance to Paris warehouse
      // weight: 4x365g = 1460g = 1.46kg -> rounding up to 2
      const orderRequest = {deviceOrders: [{deviceCount: 4, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009723, longitude: 2.547778}}};
      
      // when
      const res = await orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(600.02);
      expect(res.discount).toBe(0);
      expect(res.shippingCost).toBe(0.02);
    });

    it('should validate order as invalid if shipping cost threshold reached and should return price information', async () => {
      // Coordinate is Wellington (New Zealand), closest warehouse is HK, being 9,458km away
      const orderRequest = {deviceOrders: [{deviceCount: 1, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: -41.2923814, longitude: 174.7787463}}};
      
      // when
      const res = await orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(false);
      expect(res.totalPrice).toBe(244.58);
      expect(res.discount).toBe(0);
      expect(res.shippingCost).toBe(94.58);
    });

    it('should calculate shipping cost from more than one warehouse', async () => {
      // 0.0001km distance to Paris warehouse
      // takes 245 from paris warehouse
      // takes 1 from warsaw warehouse
      // 695 * 150 * 0.8 + 694 * 0.365 * 1 * 0.01 + 1 * 0.365 * 1,344.2 * 0.01
      // 83400 + 2.54 + 13.46 = 
      const orderRequest = {deviceOrders: [{deviceCount: 695, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009723, longitude: 2.547778}}};
      
      // when
      const res = await orderService.verifyOrder(orderRequest);

      // then
      expect(res.isValid).toBe(true);
      expect(res.totalPrice).toBe(83416);
      expect(res.discount).toBe(20850);
      expect(res.shippingCost).toBe(16);
    });
  });

  describe('submitOrder', () => {
    // Test cases not covered:
    // should verify order before submitting
    // should verify order before submitting, not submit if order is invalid

    it('should submit order and reduce stock in the warehouse', async () => {
      // location is same as Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 1, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009722, longitude: 2.547778}}};

      // when
      const res = await orderService.submitOrder(orderRequest);

      // then
      expect(res.orderId).toBe(1);
        expect(dataProvider.reduceStock).toHaveBeenCalledWith(4, 1);
        expect(dataProvider.addOrder).toHaveBeenLastCalledWith(150.01, 0, 0.01);
    });

    it('should reduce stock in multiple warehouses', async () => {
      // location is same as Paris warehouse
      const orderRequest = {deviceOrders: [{deviceCount: 695, deviceIdentifier: 1}], shippingAddress: {coordinate: {latitude: 49.009723, longitude: 2.547778}}};

      // when
      await orderService.submitOrder(orderRequest);

      // then
      expect(dataProvider.reduceStock).toHaveBeenCalledTimes(2);
      // first warehouse
      expect(dataProvider.reduceStock).toHaveBeenNthCalledWith(1, 4, 694);
      // second warehouse
      expect(dataProvider.reduceStock).toHaveBeenNthCalledWith(2, 5, 1);
    });
  });
});