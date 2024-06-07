import { cartManager } from "../dao/MongoDB/CartManagerDB.js";
import ProductManager from "../dao/MongoDB/ProductManagerDB.js";

const ProductManger = new ProductManager();
const CartManager = new cartManager(ProductManger);

const getAllCarts = async () => {
  return await CartManager.getAllCarts();
};

const getCartById = async (cid) => {
  return await CartManager.getCartById(cid);
};

const createCart = async (products) => {
  return await CartManager.createCart(products);
};

const addProductByID = async (cid, pid) => {
  return await CartManager.addProductByID(cid, pid);
};

const deleteProductInCart = async (cid, pid) => {
  return await CartManager.deleteProductInCart(cid, pid);
};

const updateCart = async (cid, products) => {
  return await CartManager.updateCart(cid, products);
};

const updateProductQuantity = async (cid, pid, quantity) => {
  return await CartManager.updateProductQuantity(cid, pid, quantity);
};

const insertArray = async (cid, arrayOfProducts) => {
  return await CartManager.insertArray(cid, arrayOfProducts);
};

const clearCart = async (cid) => {
  return await CartManager.clearCart(cid);
};

export default {
  getAllCarts,
  getCartById,
  createCart,
  addProductByID,
  deleteProductInCart,
  updateCart,
  updateProductQuantity,
  clearCart,
  insertArray,
};
