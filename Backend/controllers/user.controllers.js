import { User } from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "get current user error",
    });
  }
};

export const updateUserLocation = async (req, res) => {
  try {
    const { lat, lon } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: "Point",
          coordinates: [lon, lat], // correct order
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: "user is not found" });
    }

    return res.status(200).json({
      message: "location updated",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `update location user error ${error.message}`,
    });
  }
};


