import jwt from "jsonwebtoken";
import config from "../config/config.js";

const generateJWT = (user) => {
  const jwtPayload = {
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    age: user.age,
    role: user.role,
    email: user.email,
    cart: user.cart,
  };
  return jwt.sign(jwtPayload, config.JWT_SECRET, { expiresIn: "1h" });
};

const setTokenCookie = (res, token) => {
  res.cookie("coderCookieToken", token, {
    maxAge: 3600000,
    httpOnly: true,
    secure: true,
  });
};

export default {
  generateJWT,
  setTokenCookie,
};
