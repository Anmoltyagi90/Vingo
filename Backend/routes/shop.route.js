import express from "express";
import {
  createEditShop,
  getMyShop,
  getShopByCity,
} from "../controllers/shop.controllers.js";
import isAuthenticated from "../middlewares/isAuthencation.js";
import { upload } from "../middlewares/multer.js";

const ShopRouter = express.Router();

ShopRouter.post(
  "/create-edit",
  isAuthenticated,
  upload.single("image"),
  createEditShop,
);
ShopRouter.get("/get-my", isAuthenticated, getMyShop);
ShopRouter.get("/get-by-city/:city", isAuthenticated, getShopByCity);

export default ShopRouter;
