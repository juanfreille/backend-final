import { productManagerDB } from "../dao/MongoDB/ProductManagerDB.js";

const ProductManger = new productManagerDB();

const getAllProducts = async () => {
  return await ProductManger.getAllProducts();
};

const getPaginateProducts = async (searchQuery, options) => {
  return await ProductManger.getPaginateProducts(searchQuery, options);
};

const getProductByID = async (pid) => {
  return await ProductManger.getProductByID(pid);
};

const createProduct = async (productData) => {
  return await ProductManger.createProduct(productData);
};

const updateProduct = async (pid, productData) => {
  return await ProductManger.updateProduct(pid, productData);
};

const deleteProduct = async (pid) => {
  return await ProductManger.deleteProduct(pid);
};

export default {
  getAllProducts,
  getPaginateProducts,
  getProductByID,
  createProduct,
  updateProduct,
  deleteProduct,
};
