import express from "express";
import {
  getCurrentUser,
  updateUserLocation,
} from "../controllers/user.controllers.js";
import isAuthenticated from "../middlewares/isAuthencation.js";

const userRouter = express.Router();

userRouter.get("/current", isAuthenticated, getCurrentUser);

userRouter.post("/update-location", isAuthenticated, updateUserLocation);

export default userRouter;
