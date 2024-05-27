import { Router } from "express";
import { passportCall, authorization } from "../utils/authUtil.js";
import {
  renderLogin,
  redirectIfLoggedIn,
  isAdmin,
  populateCart,
  getProducts,
  goHome,
  renderHome,
  renderRegister,
  renderRealTimeProducts,
  renderChat,
  renderCart,
  renderProductDetails,
  verifyUserSession,
} from "../controllers/viewsController.js";

const router = Router();

router.get("/", goHome);
router.get("/home", passportCall("jwt"), isAdmin, populateCart, renderHome);
router.get("/login", passportCall("jwt"), redirectIfLoggedIn, renderLogin);
router.get("/register", passportCall("jwt"), redirectIfLoggedIn, renderRegister);
router.get("/products", passportCall("jwt"), isAdmin, populateCart, getProducts);
router.get("/realtimeproducts", passportCall("jwt"), authorization("admin"), isAdmin, populateCart, renderRealTimeProducts);
router.get("/chat", passportCall("jwt"), isAdmin, populateCart, verifyUserSession, renderChat);
router.get("/cart/:cid", passportCall("jwt"), isAdmin, populateCart, verifyUserSession, renderCart);
router.get("/products/item/:pid", passportCall("jwt"), isAdmin, populateCart, verifyUserSession, renderProductDetails);

export default router;
