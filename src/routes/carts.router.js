import express from "express";
import CartManager from "../controller/CartManager.js";

const router = express.Router();
const cartManager = new CartManager("./data/carts.json");

router.get("/:cartId", getCart);
router.post("/", addCart);
router.post("/:cartId/product/:productId", addProductToCart);

async function getCart(req, res) {
  try {
    const cartId = parseInt(req.params.cartId);
    const cart = cartManager.getCart(cartId);
    if (!cart) {
      res.status(404).send("Carrito no encontrado");
    } else {
      res.json(cart);
    }
  } catch (error) {
    handleErrors(res, error);
  }
}

async function addCart(req, res) {
  try {
    const newCart = await cartManager.addCart();
    res.json(newCart);
  } catch (error) {
    handleErrors(res, error);
  }
}

async function addProductToCart(req, res) {
  try {
    const cartId = parseInt(req.params.cartId);
    const productId = parseInt(req.params.productId);
    const updatedCart = await cartManager.addProductToCart(cartId, productId);
    if (!updatedCart) {
      res.status(404).send("Carrito no encontrado");
    } else {
      res.json(updatedCart);
    }
  } catch (error) {
    handleErrors(res, error);
  }
}

function handleErrors(res, error) {
  console.error("Error:", error);
  res.status(500).json({ error: "Error interno del servidor" });
}

export default router;
