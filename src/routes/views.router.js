import { Router } from "express";
import { productModel } from "../dao/models/productModel.js";
import { cartModel } from "../dao/models/cartModel.js";
import { productManagerDB } from "../dao/ProductManagerDB.js";

const ProductService = new productManagerDB();
const router = Router();

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
    let { page, limit, sort, query } = req.query;

    if (!page) page = 1;
    if (!limit) limit = 8;

    let sortOptions = {};
    if (sort) {
      if (sort === "asc") {
        sortOptions = { price: 1 };
      } else if (sort === "desc") {
        sortOptions = { price: -1 };
      }
    }

    let filter = {};
    if (query) {
      filter = { category: query };
    }

    const uniqueCategories = await productModel.distinct("category");

    const result = await productModel.paginate(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
      lean: true,
    });

    const count = await productModel.countDocuments(filter);
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = result.hasNextPage;
    const hasPrevPage = result.hasPrevPage;
    const nextPage = hasNextPage ? parseInt(page) + 1 : null;
    const prevPage = hasPrevPage ? parseInt(page) - 1 : null;
    const baseURL = req.baseUrl;
    const prevLink = hasPrevPage ? `${baseURL}?page=${prevPage}` : null;
    const nextLink = hasNextPage ? `${baseURL}?page=${nextPage}` : null;

    res.render("products", {
      title: "Backend / Final - Products",
      style: "styles.css",
      status: "success",
      payload: result.docs,
      totalPages,
      prevPage,
      nextPage,
      page: parseInt(page),
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
      uniqueCategories: uniqueCategories,
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

router.get("/cart/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartModel.findOne({ _id: cid }).lean();
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    const products = await Promise.all(
      cart.products.map(async (product) => {
        const productData = await productModel
          .findOne({ _id: product._id })
          .lean();
        return { ...product, product: productData };
      })
    );
    console.log(products);
    res.render("cart", {
      title: "Backend / Final - cart",
      style: "styles.css",
      payload: products,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products/item/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productModel.findOne({ _id: pid }).lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.render("product-details", {
      title: "Detalles del Producto",
      style: "styles.css",
      product: product,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
