import { Router } from "express";
import { passportCall, authorization } from "../utils/authUtil.js";
import {
  renderLogin,
  redirectIfLoggedIn,
  isAdmin,
  populateCart,
  calculateTotalQuantityInCart,
  getProducts,
  goHome,
} from "../controllers/views.controller.js";
import { productModel } from "../dao/models/productModel.js";
import { cartModel } from "../dao/models/cartModel.js";
import { productManagerDB } from "../dao/ProductManagerDB.js";

const ProductService = new productManagerDB();
const router = Router();

router.get("/", goHome);

router.get("/home", passportCall("jwt"), isAdmin, populateCart, async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const limit = 5;
    const products = await productModel.find().limit(limit).lean();
    const totalQuantityInCart = calculateTotalQuantityInCart(req.user);

    res.render("home", {
      title: "Backend / Final - Home",
      style: "styles.css",
      products: products,
      user: req.user,
      userAdmin: req.isAdmin,
      totalQuantityInCart,
    });
  } catch (error) {
    res.redirect("/login");
    // res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/login", passportCall("jwt"), redirectIfLoggedIn, renderLogin);

router.get("/register", passportCall("jwt"), redirectIfLoggedIn, (req, res) => {
  res.render("register", {
    title: "Backend / Final - Registro",
    style: "styles.css",
    message: req.session.messages ?? "",
  });
  delete req.session.messages;
  req.session.save();
});

router.get("/products", passportCall("jwt"), isAdmin, populateCart, getProducts);

router.get("/realtimeproducts", passportCall("jwt"), authorization("admin"), isAdmin, populateCart, async (req, res) => {
  const totalQuantityInCart = calculateTotalQuantityInCart(req.user);

  res.render("realTimeProducts", {
    products: await ProductService.getAllProducts(),
    style: "styles.css",
    user: req.user,
    userAdmin: req.isAdmin,
    totalQuantityInCart,
  });
});

router.get("/chat", passportCall("jwt"), isAdmin, populateCart, async (req, res) => {
  const totalQuantityInCart = calculateTotalQuantityInCart(req.user);
  res.render("chat", {
    style: "styles.css",
    user: req.user,
    userAdmin: req.isAdmin,
    totalQuantityInCart,
  });
});

router.get("/cart/:cid", passportCall("jwt"), isAdmin, populateCart, async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartModel.findOne({ _id: cid }).lean();
    if (!cart) {
      return res.status(404).json({ error: "No se encontró el carrito" });
    }
    const products = await Promise.all(
      cart.products.map(async (product) => {
        const productData = await productModel.findOne({ _id: product._id }).lean();
        return { ...product, product: productData };
      })
    );
    const totalQuantityInCart = calculateTotalQuantityInCart(req.user);

    res.render("cart", {
      title: "Backend / Final - cart",
      style: "styles.css",
      payload: products,
      user: req.user,
      userAdmin: req.isAdmin,
      totalQuantityInCart,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products/item/:pid", passportCall("jwt"), isAdmin, populateCart, async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productModel.findOne({ _id: pid }).lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const totalQuantityInCart = calculateTotalQuantityInCart(req.user);

    res.render("product-details", {
      title: "Detalles del Producto",
      style: "styles.css",
      product: product,
      user: req.user,
      userAdmin: req.isAdmin,
      totalQuantityInCart,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
