import { readFromFile, writeToFile } from "../utils/fileManager.js";
import { generateNewId } from "../utils/idGenerator.js";

class CartManagerFS {
  constructor(file, ProductService) {
    this.file = file;
    this.ProductService = ProductService;
  }

  async getAllCarts() {
    try {
      const carts = await readFromFile(this.file);
      return JSON.parse(carts);
    } catch (error) {
      console.error(error.message);
      return [];
    }
  }

  async getProductsFromCartByID(cid) {
    const carts = await this.getAllCarts();
    const cartFilter = carts.filter((cart) => cart.id == cid);
    if (cartFilter.length > 0) {
      return cartFilter[0].products;
    }
    throw new Error(`El carrito ${cid} no existe!`);
  }

  async createCart() {
    const carts = await this.getAllCarts();
    const newCart = {
      id: generateNewId(carts),
      products: [],
    };
    carts.push(newCart);
    try {
      await writeToFile(this.file, carts);
      return newCart;
    } catch (error) {
      throw new Error("Error al crear el carrito");
    }
  }

  async addProductByID(cid, pid) {
    try {
      const carts = await this.getAllCarts();
      const cart = carts.find((cart) => cart.id == cid);
      if (!cart) {
        throw new Error(`El carrito ${cid} no existe`);
      }

      const productIndex = cart.products.findIndex(
        (item) => item.product === pid
      );
      if (productIndex !== -1) {
        cart.products[productIndex].quantity++;
      } else {
        cart.products.push({ product: pid, quantity: 1 });
      }

      await writeToFile(this.file, carts);
      return cart;
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      throw error;
    }
  }
}

export { CartManagerFS };
