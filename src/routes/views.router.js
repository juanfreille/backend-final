import { Router } from "express";
import ProductManager from "../services/ProductManager.js";

const productManager = new ProductManager("./data/products.json");
const router = Router();

//En las dos primeras rutas enviamos el objeto de productos cargado, en la tercera enviamos el objeto vacio y lo llenamos con el socket
router.get("/", async (req, res) => {
  try {
    const limit = 5; //Vamos a enviar los primer 3 productos como productos destacados, despues vemos si le metemos mas funcionalidad
    const products = await productManager.getProducts(limit);
    const limitedProducts = limit ? products.slice(0, limit) : products;
    limitedProducts.forEach((product) => {
      //pequeño mod hasta que vea si se puede mejorar, por ahora lo manejo por aca enviandolo al front asi
      if (!product.thumbnails || product.thumbnails.length === 0) {
        product.thumbnails = ["img/noThumbnails.webp"];
      }
    });
    res.render("home", {
      title: "Backend / Final - Home",
      style: "styles.css",
      products: limitedProducts,
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    products.forEach((product) => {
      //pequeño mod hasta que vea si se puede mejorar, por ahora lo manejo por aca enviandolo al front asi
      if (!product.thumbnails || product.thumbnails.length === 0) {
        product.thumbnails = ["img/noThumbnails.webp"];
      }
    });

    res.render("products", {
      title: "Backend / Final - Products",
      style: "styles.css",
      products: products,
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/realtimeproducts", (req, res) =>
  res.render("realTimeProducts", {
    products: [],
    style: "styles.css",
  })
);

export default router;
