import express from "express";
import {
  acceptOrder,
  getCurrentOrder,
  getDeliveryBoyAssignment,
  getMyOrders,
  getOrderById,
  getTodayDeliveries,
  placeOrder,
  sendDeliveryOtp,
  updateOrderStatus,
  verifyDeliveryotp,
  verifyPayment,
} from "../controllers/order.controllers.js";
import isAuthenticated from "../middlewares/isAuthencation.js";

const orderRouter = express.Router();

orderRouter.post("/place-order", isAuthenticated, placeOrder);

orderRouter.post("/verify-payment", isAuthenticated, verifyPayment);

orderRouter.get("/my-orders", isAuthenticated, getMyOrders);

orderRouter.post("/send-delivery-otp", isAuthenticated, sendDeliveryOtp);

orderRouter.post("/verify-delivery-otp", isAuthenticated, verifyDeliveryotp);

orderRouter.post(
  "/update-status/:orderId/:shopId",
  isAuthenticated,
  updateOrderStatus,
);

orderRouter.get("/get-assignment", isAuthenticated, getDeliveryBoyAssignment);

orderRouter.get("/get-today-deliveries", isAuthenticated, getTodayDeliveries);

orderRouter.post("/accept-order/:assignmentId", isAuthenticated, acceptOrder);
orderRouter.get("/get-current-order", isAuthenticated, getCurrentOrder);

orderRouter.get("/get-order-by-id/:orderId", isAuthenticated, getOrderById);

export default orderRouter;
