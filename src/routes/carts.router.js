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

const router = express.Router();

router.use(addLogger);
router.get("/", getAllCarts);
router.get("/:cid", getCartById);
router.post("/", createCart);
router.post("/:cid/products/:pid", addProductToCart);
router.delete("/:cid/products/:pid", deleteProductInCart);
router.put("/:cid", updateCart);
router.put("/:cid/products/:pid", updateProductQuantity);
router.delete("/:cid", clearCart);
router.get("/:cid/purchase", purchaseCart);

export default router;
