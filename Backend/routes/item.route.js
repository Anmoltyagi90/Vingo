import express from "express";

import isAuthenticated from "../middlewares/isAuthencation.js";
import {
  addItem,
  deleteItem,
  editItem,
  getItemByCity,
  getItemById,
  getItemsByShop,
  rating,
  searchItems,
} from "../controllers/item.controllers.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

itemRouter.post("/add-item", isAuthenticated, upload.single("image"), addItem);

itemRouter.post(
  "/edit-item/:itemId",
  isAuthenticated,
  upload.single("image"),
  editItem,
);

itemRouter.get("/get-by-id/:itemId", isAuthenticated, getItemById);

itemRouter.get("/delete/:itemId", isAuthenticated, deleteItem);
itemRouter.get("/get-by-city/:city", isAuthenticated, getItemByCity);
itemRouter.get("/get-by-shop/:shopId", isAuthenticated, getItemsByShop);
itemRouter.get("/search-items", isAuthenticated, searchItems);

itemRouter.post("/rating", isAuthenticated, rating);

export default itemRouter;
