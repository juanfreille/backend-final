import express from "express";
import {
  getAllCarts,
  getCartById,
  createCart,
  addProductToCart,
  deleteProductInCart,
  updateCart,
  updateProductQuantity,
  clearCart,
  purchaseCart,
} from "../controllers/cartController.js";
import { addLogger } from "../utils/logger.js";
import { passportCall } from "../utils/authUtil.js";

const router = express.Router();

router.use(addLogger);
router.get("/", getAllCarts);
router.get("/:cid", getCartById);
router.post("/", createCart);
router.post("/:cid/products/:pid", passportCall("jwt"), addProductToCart);
router.delete("/:cid/products/:pid", passportCall("jwt"), deleteProductInCart);
router.put("/:cid", passportCall("jwt"), updateCart);
router.put("/:cid/products/:pid", passportCall("jwt"), updateProductQuantity);
router.delete("/:cid", passportCall("jwt"), clearCart);
router.get("/:cid/purchase", passportCall("jwt"), purchaseCart);

export default router;
