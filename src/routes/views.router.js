import { Router } from "express";
import { handlePolicies, passportCallHome, passportCallRedirect, handlePoliciesViews } from "../utils/authUtil.js";
import {
  renderLogin,
  redirectIfLoggedIn,
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
  adminPanel,
} from "../controllers/viewsController.js";
import { logOutJwt } from "../controllers/sessionController.js";

const router = Router();

const passportHome = passportCallHome("jwt"); //para rutas donde se permite el acceso a usuarios no autenticados, pero igual manejar el caso donde el usuario esté autenticado.
const passportRedirect = passportCallRedirect("jwt"); //es para rutas que requieren autenticación y redirige a /login si el usuario no está autenticado.

// Rutas de vistas, no se necesitan permisos especiales para verlas, aun asi verifican autenticación
router.get("/", passportHome, goHome);
router.get("/home", passportHome, renderHome);
router.get("/login", passportHome, redirectIfLoggedIn, renderLogin);
router.get("/register", passportHome, redirectIfLoggedIn, renderRegister);
router.get("/products", passportHome, getProducts);

// Rutas que redirigen al login si no están autenticadas
router.post("/logout", passportRedirect, logOutJwt);
router.get("/realtimeproducts", passportRedirect, handlePoliciesViews(["ADMIN", "PREMIUM"]), renderRealTimeProducts);
router.get("/chat", passportRedirect, renderChat);
router.get("/cart/:cid", passportRedirect, renderCart);
router.get("/products/item/:pid", passportRedirect, renderProductDetails);
router.get("/cart/:cid/purchase", passportRedirect, purchaseView);
router.get("/profile", passportRedirect, handlePoliciesViews(["USER", "PREMIUM"]), profileView);
router.get("/adminpanel", passportRedirect, handlePoliciesViews(["ADMIN"]), adminPanel);

// Otras rutas
router.get("/resetpassword", resetPasswordView);
router.get("/newpassword/:pid", newPasswordView);

export default router;
