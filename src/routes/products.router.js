import express from "express";
import { uploader } from "../middlewares/multer.js";
import ProductManager from "../services/ProductManager.js";
import { validateFields } from "../middlewares/productValidator.js";
import {
  handleInternalServerError,
  handleNotFoundError,
  handleBadRequestError,
} from "../middlewares/errorHandlers.js";

const router = express.Router();
const productManager = new ProductManager("./data/products.json");

router.get("/", getAllProducts);
router.get("/:productId", getProductById);
router.post("/", uploader.array("thumbnails"), validateFields, addProduct);
router.put("/:productId", uploader.array("thumbnails"), updateProduct);
router.delete("/:productId", deleteProduct);

async function getAllProducts(req, res) {
  try {
    const limit = req.query.limit;
    const products = await productManager.getProducts(limit);
    res.json(products);
  } catch (error) {
    handleInternalServerError(res, error);
  }
}

async function getProductById(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    const product = await productManager.getProductById(productId);
    if (!product) {
      handleNotFoundError(res, "Producto no encontrado");
    } else {
      res.json(product);
    }
  } catch (error) {
    handleInternalServerError(res, error);
  }
}

async function addProduct(req, res) {
  const productData = {
    body: req.body,
    files: req.files,
  };

  try {
    const product = processProductData(productData);
    await productManager.addProduct(product);
    res.json(product);
  } catch (error) {
    handleErrors(res, error);
  }
}

async function updateProduct(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    const updatedProductFields = req.body;
    const productData = {
      body: updatedProductFields,
      files: req.files,
    };
    const existingProduct = await productManager.getProductById(productId);
    if (!existingProduct) {
      return handleNotFoundError(res, "Producto no encontrado");
    }

    let thumbnails = [];

    if (productData.files && productData.files.length > 0) {
      thumbnails = productData.files.map((file) => file.path);
    }

    const updatedProduct = {
      ...existingProduct,
      ...productData.body,
      thumbnails:
        thumbnails.length > 0 ? thumbnails : existingProduct.thumbnails,
    };

    if (typeof updatedProduct.price === "string") {
      updatedProduct.price = parseFloat(updatedProduct.price);
    }
    if (typeof updatedProduct.stock === "string") {
      updatedProduct.stock = parseFloat(updatedProduct.stock);
    }

    await productManager.updateProduct(productId, updatedProduct);

    res.json(updatedProduct);
  } catch (error) {
    handleInternalServerError(res, error);
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    const deletedProduct = await productManager.deleteProduct(productId);
    if (!deletedProduct) {
      return handleBadRequestError(res, "No existe un producto con ese ID");
    } else {
      res.json(deletedProduct);
    }
  } catch (error) {
    handleInternalServerError(res, error);
  }
}

function processProductData(productData) {
  let thumbnails = [];

  if (productData.files && productData.files.length > 0) {
    thumbnails = productData.files.map((file) => file.path);
    console.log("Archivos subidos:", productData.files);
  }
  const product = productData.body;

  if (product && typeof product.price === "string") {
    product.price = parseFloat(product.price);
  }
  if (product && typeof product.stock === "string") {
    product.stock = parseFloat(product.stock);
  }

  if (thumbnails.length > 0) {
    product.thumbnails = thumbnails;
  } else {
    product.thumbnails = [];
  }
  return product;
}

export default router;
