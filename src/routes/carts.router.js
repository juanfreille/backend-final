import express from "express";
import CartManager from "../controller/CartManager.js";
import {
  handleInternalServerError,
  handleNotFoundError,
} from "../middleware/errorHandlers.js";

const router = express.Router();
const cartManager = new CartManager("./data/carts.json");

router.get("/", getAllCarts);
router.get("/:cartId", getCart);
router.post("/", addCart);
router.post("/:cartId/product/:productId", addProductToCart);

async function getAllCarts(req, res) {
  try {
    const carts = await cartManager.getCarts();
    res.json(carts);
  } catch (error) {
    console.error("Error", error);
    handleInternalServerError(res, error);
  }
}
async function getCart(req, res) {
  try {
    const cartId = parseInt(req.params.cartId);
    const cart = cartManager.getCart(cartId);
    if (!cart) {
      handleNotFoundError(res, "Carrito no encontrado");
    } else {
      res.json(cart);
    }
  } catch (error) {
    handleInternalServerError(res, error);
  }
}

async function addCart(req, res) {
  try {
    const newCart = await cartManager.addCart();
    res.json(newCart);
  } catch (error) {
    handleInternalServerError(res, error);
  }
}

async function addProductToCart(req, res) {
  try {
    const cartId = parseInt(req.params.cartId);
    const productId = parseInt(req.params.productId);
    const updatedCart = await cartManager.addProductToCart(cartId, productId);
    if (!updatedCart) {
      handleNotFoundError(res, "Carrito no encontrado");
    } else {
      res.json(updatedCart);
    }
  } catch (error) {
    handleInternalServerError(res, error);
  }
}

export default router;
