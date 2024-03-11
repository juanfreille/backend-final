import fs from "fs";
import { generateNewId } from "../middleware/idGenerator.js";
import { readFromFile, writeToFile } from "../middleware/fileManager.js";

export default class CartManager {
  constructor(path) {
    this.path = path;
    this.carts = [];
    this.init();
  }

  async init() {
    this.carts = await readFromFile(this.path);
  }

  async addCart() {
    try {
      const newCart = { id: generateNewId(this.carts), products: [] };
      this.carts.push(newCart);
      await this.saveCarts();
      return newCart;
    } catch (error) {
      console.error("Error al agregar un nuevo carrito:", error);
    }
  }

  async saveCarts() {
    await writeToFile(this.path, this.carts);
  }

  async getCarts() {
    return this.carts;
  }

  getCart(cartId) {
    return this.carts.find((cart) => cart.id === cartId);
  }

  async addProductToCart(cartId, productId) {
    try {
      const cart = this.getCart(cartId);
      if (!cart) return null;

      const productIndex = cart.products.findIndex(
        (item) => item.product === productId
      );
      if (productIndex !== -1) {
        cart.products[productIndex].quantity++;
      } else {
        cart.products.push({ product: productId, quantity: 1 });
      }

      await this.saveCarts();
      return cart;
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
    }
  }
}
