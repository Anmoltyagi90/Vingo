import cookieParser from "cookie-parser";
import express from "express";
import connectedDB from "./utils/db.js";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import ShopRouter from "./routes/shop.route.js";
import itemRouter from "./routes/item.route.js";
import orderRouter from "./routes/order.route.js";
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5175",
  "https://vingo-1-ioo6.onrender.com",
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
const PORT = process.env.PORT || 3030;

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));

//Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/shop", ShopRouter);
app.use("/api/v1/item", itemRouter);
app.use("/api/v1/order", orderRouter);

socketHandler(io);

const StartServer = async () => {
  try {
    await connectedDB();
    server.listen(PORT, () => {
      console.log(`SERVER LSITEN PORT NO = http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Server start failed:", error.message);
  }
};

StartServer();
