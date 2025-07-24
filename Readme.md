# Order management API

The service is available at: https://order-management-d2eg.onrender.com

The service is a Node.js + express application that provides an API for managing orders, which has two main functions: verifying orders and submitting orders. It uses TypeScript for type safety and Jest for testing.

## How to run the project

Node version: v24.4.1

Install dependencies with:
`npm install`

Run the application with:
`npm run start`

Run the tests with:
`npm test`

Run DB types generation with:
`npm run db:types`

## Assumptions

- Total price from verifying order response is the total price after the discounts have been applied and shipping cost have been added, similar to a shopping cart overview
- Total price = Original price x order quantity - discount + shipping cost
- Volume discount are applied on the entire order, not on the possible shipping per warehouse
- Shipping cost = every started km _ every started kg _ 0.01, e.g. if distance between warehouse and customer's shipping address is > 0 and < 1, we count it as 1km, same as with weight of order, if the order weight is > 0, and < 1, we count it as 1kg. Similar to DHL weight to price brackets on: https://www.dhl.de/en/privatkunden/pakete-versenden/weltweit-versenden/preise-international.html#preise

## Distance service

- A more accurate way to gauge shopping cost is to use the calculator API from the shipping provider, given this can be used with no or very low cost for order verification. If the shipping provider's API is not available or feasible for verification purpose, then we should build the calculator as close as the observed behavior of the shipping provider's calculation.
- Caching can be considered for existing customers if the shipping provider's API is not available or feasible for verification purpose.

## Allocation service

- In the allocation service, we're retrieving all warehouses in an array and calculate the cost ad hoc. This works because we have a limited, small amount of warehouses and calculating the distance is not expensive either, if any of the conditions change, we need to change this mechanism
- One part of the business logic relies on the intermediate array where warehouses are sorted by distance, so we can use the first warehouse in the array as the one with the lowest distance to the customer. Another way of doing this is to use a database query with an order by distance or query iteratively for the next closest warehouse until we find one that has enough stock for the order

## Database and entity design

- The IDs of the entities are running numbers, this makes the ID easier to read when displayed on the frontend, but it is not a good practice in production to expose running IDs as they offer easier attack surface for hackers because they can be guessed easily. We can think of using UUIDs as the identifier for the entities, but use a user-friendly ID for the frontend display.
- The code currently doesn't use transactions when reducing the stock and creating the order. In a production environment, we should use transactions to ensure that either both operations succeed or fail together, to avoid inconsistencies in the database.
- We also currently don't re-check if the stock is still available because we retrieve the stock data and the order creation separately and not in a transaction. The trade off of introducing a transaction is that it can lead to longer response times and locking in the database. Since this is a back office tool with no real time customer interaction, locking the table could be an option. Another option could be we introduce a order confirmation step (confirmation by warehouse) after the order submission state.
- With the stock reduction, we pretend that the stock is gone immediately after the order is created, but in a production environment we would want to have a more sophisticated stock management system that can handle concurrent orders and stock updates, e.g. using locking. We can also consider reserving the stock in the database table instead of reducing it, so it's clear the stock is still in the warehouse, and only reduce the stock once the devices have been actually shipped and left the warehouse.
- The order entity doesn't have any information on the customer, shipping address, payment status, order items. In a production service, we need to map this into the entity design.
- The data access layer is currently realised with the data provider and the db client which cover all entities of the DB. In a production service, we would want to apply the repository pattern for each entity. We can also consider using an ORM like TypeORM or Sequelize to simplify the data access layer and provide a more structured way of interacting with the database.
- The current database is hosted on supabase.com. We use an anonymous user for data access. In production environment, we would want to use a dedicated DB role with username and password to access the database.
- The database.types.ts file is auto-generated types from the supabase database schema.

## Testing

- The test cases are not exhaustive and are not all strict unit tests, because for some only the dataProvider (access to the DB) is mocked, but not other dependencies. This was done due to convenience and time constraints, but in a production environment we would want to have more strict unit tests for each service and component.
- Ideal distribution of test cases would be as many unit tests as possible, with a few integration tests on the controller layer with live QA database or a database in docker container. The unit tests should be used to cover for all edge cases for methods while mocking the dependencies and verify how often the methods have been called with which values. Integration tests can also be used for testing the business logic from the service layer while only mocking the data provider layer.
- The test data are not easy to read and the calculation not straightforward to follow. A better way to do this is to encapsulate each test case data in a test data provider function (with immutable values) which can be reused in multiple test cases, so the test data is easier to read and follow. Example see below:

```typescript
testDataProvider.ts;

export const testDataWithMinimumOrderAmountFromCloseByWarehouseWithNoDiscount =
  {
    orderRequest: {
      deviceOrders: [{ deviceCount: 1, deviceIdentifier: 1 }],
      shippingAddress: {
        coordinate: { latitude: 49.009722, longitude: 2.547778 },
      },
    },
    devices: [
      {
        id: 1,
        name: "SCOS Station P1 Pro",
        weightInGram: 365,
        currency: "USD",
        price: 150,
      },
    ],
    stock: [
      { id: 1, deviceId: 1, unit: 355, warehouseId: 1 },
      { id: 2, deviceId: 1, unit: 578, warehouseId: 2 },
      { id: 3, deviceId: 1, unit: 265, warehouseId: 3 },
      { id: 4, deviceId: 1, unit: 694, warehouseId: 4 },
      { id: 5, deviceId: 1, unit: 245, warehouseId: 5 },
      { id: 6, deviceId: 1, unit: 419, warehouseId: 6 },
    ],
    warehouses: [
      { id: 1, name: "Los Angeles", latitude: 33.9425, longitude: -118.408056 },
      { id: 2, name: "New York", latitude: 40.639722, longitude: -73.778889 },
      { id: 3, name: "Sao Paulo", latitude: -23.435556, longitude: -46.473056 },
      { id: 4, name: "Paris", latitude: 49.009722, longitude: 2.547778 },
      { id: 5, name: "Warsaw", latitude: 52.165833, longitude: 20.967222 },
      { id: 6, name: "Hong Kong", latitude: 22.308889, longitude: 113.914444 },
    ],
    discounts: [
      { id: 1, deviceId: 1, type: 1, minimumQuantity: 25, discount: 5 },
      { id: 2, deviceId: 1, type: 1, minimumQuantity: 50, discount: 10 },
      { id: 3, deviceId: 1, type: 1, minimumQuantity: 100, discount: 15 },
      { id: 4, deviceId: 1, type: 1, minimumQuantity: 250, discount: 20 },
    ],
    expected: {
      totalPrice: 150 * 1 - 0 + 1 * 1 * 0.01, // Original price x order quantity - discount + shipping cost
      shippingCost: 0.01, // 1km * 1kg * 0.01
      orderItems: [
        {
          deviceId: 1,
          quantity: 1,
          price: 150,
          discount: 0,
          totalPrice: 150,
          warehouseId: 1, // Closest warehouse with enough stock
        },
      ],
      warehousesUsed: [1], // Only the closest warehouse is used
    },
  };
```

- Test parametrisation is not currently used, but should be used to avoid code duplication and improve maintainability.

## Error handling and validation

- Exception handling right now is not provided. We should catch all custom thrown exceptions within the application. This can happen with a middleware/controller advice to transform these exceptions into a mapped http response with a proper error code and message.
- Request validation is not currently implemented. We should validate the request body before entering the business logic stage to ensure we fail as early as possible. Types of validation (non-exhaustive): required fields are present, value validity (e.g. coordinates are valid).

## Logging and monitoring

- The service does not currently have any logging or monitoring implemented. In a production environment, we need to employ more logging for unhappy paths including useful tags, e.g. requestId, userId, orderId, request path etc., to enhance traceability.
- Monitoring need to be implemented for both tracking service's health and measuring performance metrics, e.g. response time, error rate, etc. We can further set up alerting for critical errors or performance issues so the team can react in time to unexpected behaviors of the service.

## Deployment
- The application is currently deployed via Render.com.
- For CI/CD pipeline set up, we can use GitHub Actions with these steps: 1. Install dependencies, 2. Run tests, 3. Build the application, 4. Deploy to a staging environment, 5. Have (manual) step to deploy to production under the condition all tests pass
- For deployment, we can write a Dockerfile to containerize the application and deploy it to a cloud provider.

## Access control and security
- The service does not currently have any authentication or authorization implemented. This can be done with a security/auth filter in the code with strict role based access control on each endpoint. The persistence of user and role data (e.g. sales rep, warehouse staff) and permissions can be built with self-maintained DB tables or an external service can be used e.g. Cognito (AWS), Auth0.
- The service does not have CORS enabled. This can be done with a middleware that allows only specific origins to access the service.

## API design
- The service is using REST API. This works for this case because the service is a back office tool with internal users, non-demanding UX requirements (for the FE), predictable low amount of client (FE), low complexity entities, low amount of endpoints, and expected lower change rate. If any of the conditions change, it's worth considering investing into changing to GraphQL, especially if the number of clients and change rate of features increase
- The REST endpoints are not versioned. Is is due to the fact that the service has low change rate and predictable low amount of clients. If sticking with REST API, and the the conditions change, we can think of versioning the API with a prefix in the URL, e.g. /v1/orders/verify