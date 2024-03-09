import express from "express";
import ProductManager from "../controller/ProductManager.js";
import { uploader } from "../middleware/utils.js";
import { validateFields } from "../middleware/productValidator.js";

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
    const products = await productManager.getProducts();
    const limitedProducts = limit ? products.slice(0, limit) : products;
    res.json(limitedProducts);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function getProductById(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    const product = await productManager.getProductById(productId);
    if (!product) {
      res.status(404).send("Producto no encontrado");
    } else {
      res.json(product);
    }
  } catch (error) {
    handleErrors(res, error);
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

function processProductData(productData) {
  let thumbnails = [];

  if (productData.files && productData.files.length > 0) {
    thumbnails = productData.files.map((file) => file.path);
    console.log("Archivos subidos:", productData.files);
  }

  const product = productData.body;
  // Verificar si los campos están presentes antes de asignarlos
  if (product.price !== undefined) {
    product.price = parseFloat(product.price);
  }
  if (product.stock !== undefined) {
    product.stock = parseFloat(product.stock);
  }
  if (thumbnails.length > 0) {
    product.thumbnails = thumbnails;
  } else {
    product.thumbnails = [];
  }

  return product;
}

async function updateProduct(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    const updatedProductFields = req.body;

    // Procesar los datos del producto actualizado, incluidos los thumbnails si se proporcionan
    const productData = {
      body: updatedProductFields,
      files: req.files,
    };
    const updatedProduct = processProductData(productData);

    await productManager.updateProduct(productId, updatedProduct);

    res.json(updatedProduct);
  } catch (error) {
    handleErrors(res, error);
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = parseInt(req.params.productId);
    await productManager.deleteProduct(productId);
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    handleErrors(res, error);
  }
}

function handleErrors(res, error) {
  console.error("Error:", error);
  res.status(500).json({ error: "Error interno del servidor" });
}

export default router;
