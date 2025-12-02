import express from "express";
import productRoutes from "./api/products.js";
import { initWebSocket } from "./websocket.js";
import http from "http";

const app = express();
app.use(express.json());
app.use("/api/products", productRoutes);

const server = http.createServer(app);

initWebSocket(server);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
