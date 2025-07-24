import express, { Request, Response } from "express";
import orderRoutes from "./order/order.routes";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(express.json());

// Health check route with defined types
app.get("/health", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "Order Management API is running successfully!" });
});

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Order Management API",
      version: "1.0.0",
      description: "API documentation for Order Management API",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/*/*.ts"],
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Register domain routes
app.use("/orders", orderRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Order Management API");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
