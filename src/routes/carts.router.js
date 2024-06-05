import express from "express";
import {
  getAllCarts,
  getCartById,
  createCart,
  addProductByID,
  deleteProductInCart,
  updateCart,
  updateProductQuantity,
  clearCart,
  purchase,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", getAllCarts);
router.get("/:cid", getCartById);
router.post("/", createCart);
router.post("/:cid/product/:pid", addProductByID);
router.delete("/:cid/product/:pid", deleteProductInCart);
router.put("/:cid", updateCart);
router.put("/:cid/product/:pid", updateProductQuantity);
router.delete("/:cid", clearCart);
router.get("/:cid/purchase", purchase);

export default router;
