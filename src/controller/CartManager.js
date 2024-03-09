import fs from "fs";
import { generateNewId } from "../middleware/idGenerator.js";

export default class CartManager {
  constructor(path) {
    this.path = path;
    this.carts = [];
    this.init();
  }

  async init() {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      this.carts = JSON.parse(data);
    } catch (error) {
      console.error("Error al cargar los carritos:", error);
    }
  }

  async addCart() {
    try {
      const newCart = { id: this.generateNewId(), products: [] };
      this.carts.push(newCart);
      await this.saveCarts();
      return newCart;
    } catch (error) {
      console.error("Error al agregar un nuevo carrito:", error);
    }
  }

  generateNewId() {
    return generateNewId(this.carts);
  }

  async saveCarts() {
    try {
      const data = JSON.stringify(this.carts, null, 2);
      await fs.promises.writeFile(this.path, data);
    } catch (error) {
      console.error("Error al guardar los carritos:", error);
    }
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
