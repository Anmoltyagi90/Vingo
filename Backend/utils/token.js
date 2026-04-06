import jwt from "jsonwebtoken";

const getToken = async (userId) => {
  try {
    const token = jwt.sign(
      { userId },                 // payload
      process.env.JWT_SECRET,     // secret key
      { expiresIn: "5d" }         
    );

    return token;
  } catch (error) {
    console.log("JWT Error:", error.message);
    return null;
  }
};

export default getToken;