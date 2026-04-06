import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.cookies?.__session ||
      (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: "JWT secret not configured",
        success: false,
      });
    }

    // ✅ FIX: specify algorithm
    const decode = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    console.log("Decoded Token:", decode);

    req.userId = decode.userId;

    next();
  } catch (error) {
    console.log("Auth Error:", error.message);

    return res.status(401).json({
      message: "Invalid or Expired Token",
      success: false,
    });
  }
};

export default isAuthenticated;