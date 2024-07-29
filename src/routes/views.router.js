import { Router } from "express";
import { handlePolicies, passportCallHome, passportCallRedirect, handlePoliciesViews } from "../utils/authUtil.js";
import {
  renderLogin,
  redirectIfLoggedIn,
  isAdminOrPremium,
  getProducts,
  goHome,
  renderHome,
  renderRegister,
  renderRealTimeProducts,
  renderChat,
  renderCart,
  renderProductDetails,
  purchaseView,
  resetPasswordView,
  newPasswordView,
  profileView,
} from "../controllers/viewsController.js";

const router = Router();

const passportHome = passportCallHome("jwt"); //para rutas donde se permite el acceso a usuarios no autenticados, pero igual manejar el caso donde el usuario esté autenticado.
const passportRedirect = passportCallRedirect("jwt"); //es para rutas que requieren autenticación y redirige a /login si el usuario no está autenticado.

// Rutas de vistas, no se necesitan permisos especiales para verlas, aun asi verifican autenticación
router.get("/", passportHome, goHome);
router.get("/home", passportHome, isAdminOrPremium, renderHome);
router.get("/login", passportHome, redirectIfLoggedIn, renderLogin);
router.get("/register", passportHome, redirectIfLoggedIn, renderRegister);
router.get("/products", passportHome, isAdminOrPremium, getProducts);

// Rutas que redirigen al login si no están autenticadas
router.get("/realtimeproducts", passportRedirect, handlePoliciesViews(["ADMIN", "PREMIUM"]), isAdminOrPremium, renderRealTimeProducts);
router.get("/chat", passportRedirect, isAdminOrPremium, renderChat);
router.get("/cart/:cid", passportRedirect, isAdminOrPremium, renderCart);
router.get("/products/item/:pid", passportRedirect, isAdminOrPremium, renderProductDetails);
router.get("/cart/:cid/purchase", passportRedirect, isAdminOrPremium, purchaseView);
router.get("/profile", passportRedirect, handlePoliciesViews(["USER", "PREMIUM"]), isAdminOrPremium, profileView);

// Otras rutas
router.get("/resetpassword", resetPasswordView);
router.get("/newpassword/:pid", newPasswordView);

export default router;
