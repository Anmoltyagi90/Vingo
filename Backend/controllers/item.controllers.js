import Item from "../models/item.model.js";
import Shop from "../models/shop. model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
  try {
    const { name, category, price, foodType } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "shop not foun" });
    }

    const item = await Item.create({
      name,
      category,
      foodType,
      price,
      image,
      shop: shop._id,
    });

    shop.items.push(item._id);
    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    await shop.populate("owner");
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `add item error ${error}` });
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    const { name, category, price, foodType } = req.body;

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        category,
        foodType,
        price,
        image,
      },
      { new: true },
    );
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `update item error ${error}` });
  }
};

export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const foundItem = await Item.findById(itemId);
    if (!foundItem) {
      return res.status(404).json({ message: "item not found" });
    }
    return res.status(200).json(foundItem);
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error}` });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId });
    shop.items = shop.items.filter(
      (i) => i._id.toString() !== item._id.toString(),
    );
    await shop.save();
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `delete item error ${error}` });
  }
};

export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }

    // Find shops in that city (case insensitive)
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    });

    // If no shops found → return empty array
    if (shops.length === 0) {
      return res.status(200).json([]);
    }

    const shopIds = shops.map((shop) => shop._id);

    // Find items of those shops
    const items = await Item.find({
      shop: { $in: shopIds },
    });

    return res.status(200).json(items);
  } catch (error) {
    console.log("getItemByCity error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId).populate("items");
    if (!shop) {
      return res.status(400).json("shop not found");
    }

    return res.status(200).json({
      shop,
      items: shop.items,
    });
  } catch (error) {
    return res.status(500).json({ message: `get item by shop ${error}` });
  }
};
export const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;

    // ✅ Proper validation
    if (!query || !city) {
      return res.status(400).json({
        message: "Query and city are required",
      });
    }

    // ✅ Find shops in city (case insensitive)
    const shops = await Shop.find({
      city: { $regex: `^${city}$`, $options: "i" },
    }).select("_id");

    if (shops.length === 0) {
      return res.status(404).json({
        message: "No shops found in this city",
      });
    }

    const shopIds = shops.map((s) => s._id);

    // ✅ Escape regex (important for safety)
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // ✅ Search items
    const items = await Item.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: safeQuery, $options: "i" } },
        { category: { $regex: safeQuery, $options: "i" } },
      ],
    }).populate("shop", "name image");

    return res.status(200).json({
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Search Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const rating = async (req, res) => {
  try {
    const { itemId, rating } = req.body;

    if (!itemId || !rating) {
      return res.status(400).json({ message: "ItemId and rating is required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 to 5" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    const newCount = item.rating.count + 1;

    const newAverage =
      (item.rating.average * item.rating.count + rating) / newCount;

    item.rating.count = newCount;
    item.rating.average = newAverage;
    await item.save();

    return res.status(200).json({ rating: item.rating });
  } catch (error) {
      return res.status(500).json({
      message: "Rating error",
    });
  }
};
