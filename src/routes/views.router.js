import { Router } from "express";
import { passportCall, authorization, handlePolicies } from "../utils/authUtil.js";
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
router.get("/", goHome);
router.get("/home", passportCall("jwt"), isAdminOrPremium, populateCart, renderHome);
router.get("/login", passportCall("jwt"), redirectIfLoggedIn, renderLogin);
router.get("/register", passportCall("jwt"), redirectIfLoggedIn, renderRegister);
router.get("/products", passportCall("jwt"), isAdminOrPremium, populateCart, getProducts);
router.get("/realtimeproducts", passportCall("jwt"), handlePolicies(["ADMIN", "PREMIUM"]), isAdminOrPremium, populateCart, renderRealTimeProducts);
router.get("/chat", passportCall("jwt"), isAdminOrPremium, populateCart, verifyUserSession, renderChat);
router.get("/cart/:cid", passportCall("jwt"), isAdminOrPremium, populateCart, verifyUserSession, renderCart);
router.get("/products/item/:pid", passportCall("jwt"), isAdminOrPremium, populateCart, verifyUserSession, renderProductDetails);
router.get("/cart/:cid/purchase", passportCall("jwt"), populateCart, purchaseView);
router.get("/resetpassword", resetPasswordView);
router.get("/newpassword/:pid", newPasswordView);

export default router;
