import Shop from "../models/shop. model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    if (!name || !city || !state || !address) {
      return res
        .status(400)
        .json({ message: "Something is missing", success: false });
    }
    let shop = await Shop.findOne({ owner: req.userId });

    let image = shop?.image;
    if (req.file) {
      const uploadedUrl = await uploadOnCloudinary(req.file.path);
      if (!uploadedUrl) {
        return res.status(400).json({
          message:
            "Image upload failed. Check CLOUD_NAME, API_KEY, SECRET_API in .env",
          success: false,
        });
      }
      image = uploadedUrl;
    }

    if (!shop) {
      // Creating new shop requires an image (schema requires it)
      if (!image) {
        return res.status(400).json({
          message: "Shop image is required",
          success: false,
        });
      }
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userId,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          image,
          owner: req.userId,
        },
        { new: true },
      );
    }

    await shop.populate("owner items");
    return res.status(201).json(shop);
  } catch (error) {
    console.error("createEditShop error:", error);
    return res.status(500).json({
      message: "Server error while saving shop",
      success: false,
    });
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "owner items",
      options: { sort: { updatedAt: -1 } },
    });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `get my Shop error ${error}` });
  }
};

export const getShopByCity = async (req, res) => {
  try {
    const city = (req.params.city || "").trim();
    if (!city) {
      return res.status(400).json({ message: "city is required" });
    }

    const safeCity = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const shop = await Shop.find({
      // Flexible match for values like "Muzaffarnagar District", extra spaces, etc.
      city: { $regex: new RegExp(safeCity, "i") },
    }).populate("items");

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `get my shop error ${error}` });
  }
};
