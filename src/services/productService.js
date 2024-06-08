import ProductManagerDB from "../dao/MongoDB/ProductManagerDB.js";

const productManager = new ProductManagerDB();

const getAllProducts = async () => productManager.getAllProducts();

const getPaginateProducts = async (searchQuery, options) => productManager.getPaginateProducts(searchQuery, options);

const getProductByID = async (pid) => productManager.getProductByID(pid);

const createProduct = async (productData) => productManager.createProduct(productData);

const updateProduct = async (pid, productData) => productManager.updateProduct(pid, productData);

const deleteProduct = async (pid) => productManager.deleteProduct(pid);

const getDistinctCategories = async () => productManager.getDistinctCategories();

export default {
  getAllProducts,
  getPaginateProducts,
  getProductByID,
  createProduct,
  updateProduct,
  deleteProduct,
  getDistinctCategories,
};
