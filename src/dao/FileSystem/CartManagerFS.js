import path from "path";
import __dirname from "../../utils/constantsUtil.js";
import { readFromFile, writeToFile } from "../../utils/fileManager.js";
import { ObjectId } from "mongodb";
import ProductManager from "./ProductManagerFS.js";

const productManager = new ProductManager();

export default class CartManager {
  constructor() {
    this.file = path.join(__dirname, "../../data/carts.json");
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

  async getCartById(cid) {
    try {
      // Obtener todos los carritos
      const carts = await this.getAllCarts();
      // Encontrar el carrito por ID
      const cart = carts.find((cart) => cart._id === cid);
      if (!cart) {
        throw new error();
      }

      const products = await productManager.getAllProducts();

      const populatedCart = {
        ...cart,
        products: cart.products.map((item) => {
          const product = products.find((p) => p._id === item._id);
          if (product) {
            return {
              ...item,
              ...product,
            };
          } else {
            return item;
          }
        }),
      };
      return populatedCart;
    } catch (error) {
      throw new error();
    }
  }

  async createCart() {
    const carts = await this.getAllCarts();
    const newCart = {
      _id: new ObjectId(),
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
      const cart = carts.find((cart) => cart._id == cid);
      if (!cart) {
        throw new Error(`El carrito ${cid} no existe`);
      }

      const productIndex = cart.products.findIndex((item) => item._id === pid);
      if (productIndex !== -1) {
        cart.products[productIndex].quantity++;
      } else {
        cart.products.push({ _id: pid, quantity: 1 });
      }

      await writeToFile(this.file, carts);
      return cart;
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      throw error;
    }
  }

  async getTotalQuantityInCart(cid) {
    try {
      const carts = await this.getAllCarts();
      const cart = carts.find((cart) => cart._id === cid);
      if (!cart) {
        throw error;
      }

      let totalQuantity = 0;
      for (const product of cart.products) {
        totalQuantity += product.quantity;
      }

      return totalQuantity;
    } catch (error) {
      throw error;
    }
  }

  async insertArray(cid, arrayOfProducts) {
    try {
      // Obtener el carrito por ID
      const cart = await this.getCartById(cid);

      // Verificar si el carrito existe y tiene un formato válido
      if (!cart || !Array.isArray(cart.products)) {
        throw new Error("El carrito no existe o no tiene un formato válido.");
      }

      // Obtener todos los productos desde ProductManager
      const allProducts = await productManager.getAllProducts();

      // Verificar que se obtuvieron productos
      if (!allProducts) {
        throw new Error("No se pudieron obtener los productos.");
      }

      // Map para facilitar la búsqueda de productos por ID
      const productMap = new Map(allProducts.map((product) => [product._id.toString(), product]));

      // Borra todos los productos existentes en el carrito
      cart.products = [];

      // Agrega los productos del array
      arrayOfProducts.forEach((item) => {
        const product = productMap.get(item._id.toString());
        if (product) {
          cart.products.push({
            _id: item._id,
            quantity: item.quantity,
            ...product, // Agrega los datos del producto
          });
        } else {
          console.warn(`Producto con ID ${item._id} no encontrado en ProductManager.`);
        }
      });

      // Escribir los cambios en el archivo
      const carts = await this.getAllCarts();
      const updatedCarts = carts.map((c) => (c._id.toString() === cid.toString() ? cart : c));
      await writeToFile(this.file, updatedCarts);

      return cart;
    } catch (error) {
      console.error("Error al agregar un array de productos al carrito:", error.message);
      throw error;
    }
  }
}
