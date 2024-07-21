import { Router } from "express";
import { passportCall, handlePolicies, passportCallHome, passportCallRedirect } from "../utils/authUtil.js";
import {
  renderLogin,
  redirectIfLoggedIn,
  isAdminOrPremium,
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
  purchaseView,
  resetPasswordView,
  newPasswordView,
} from "../controllers/viewsController.js";
import { addLogger } from "../utils/logger.js";

const router = Router();

router.use(addLogger);
router.get("/", passportCallHome("jwt"), goHome);
router.get("/home", passportCallHome("jwt"), isAdminOrPremium, populateCart, renderHome);
router.get("/login", passportCallHome("jwt"), redirectIfLoggedIn, renderLogin);
router.get("/register", passportCallHome("jwt"), redirectIfLoggedIn, renderRegister);
router.get("/products", passportCall("jwt"), isAdminOrPremium, populateCart, getProducts);
router.get("/realtimeproducts", passportCall("jwt"), handlePolicies(["ADMIN", "PREMIUM"]), isAdminOrPremium, populateCart, renderRealTimeProducts);
router.get("/chat", passportCallRedirect("jwt"), isAdminOrPremium, populateCart, verifyUserSession, renderChat);
router.get("/cart/:cid", passportCall("jwt"), isAdminOrPremium, populateCart, verifyUserSession, renderCart);
router.get("/products/item/:pid", passportCall("jwt"), isAdminOrPremium, populateCart, verifyUserSession, renderProductDetails);
router.get("/cart/:cid/purchase", passportCall("jwt"), populateCart, purchaseView);
router.get("/resetpassword", resetPasswordView);
router.get("/newpassword/:pid", newPasswordView);

export default router;
