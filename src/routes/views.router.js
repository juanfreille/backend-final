import { Router } from "express";
// import ProductManager from "../dao/ProductManager.js";
import { productModel } from "../dao/models/productModel.js";
import { productManagerDB } from "../dao/ProductManagerDB.js";

const ProductService = new productManagerDB("./data/products.json");
const router = Router();

//En las dos primeras rutas enviamos el objeto de productos cargado, en la tercera enviamos el objeto vacio y lo llenamos con el socket
router.get("/", async (req, res) => {
  try {
    const limit = 5;
    const products = await productModel.find().limit(limit).lean();
    res.render("home", {
      title: "Backend / Final - Home",
      style: "styles.css",
      products: products,
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/products", async (req, res) => {
  try {
    res.render("products", {
      title: "Backend / Final - Products",
      style: "styles.css",
      products: await ProductService.getAllProducts(),
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/realtimeproducts", async (req, res) =>
  res.render("realTimeProducts", {
    products: await ProductService.getAllProducts(),
    style: "styles.css",
  })
);

router.get("/chat", async (req, res) =>
  res.render("chat", {
    style: "styles.css",
  })
);

export default router;
