import { cartModel } from "../../models/cartModel.js";

class cartManagerDB {
  async getAllCarts() {
    try {
      return await cartModel.find().lean();
    } catch (error) {
      console.error(error.message);
      throw new Error("Error al buscar los carritos");
    }
  }

  async getCartById(cid) {
    try {
      return await cartModel
        .findOne({ _id: cid })
        .populate({
          path: "products.product",
          model: "products",
        })
        .lean();
    } catch (error) {
      console.error(error.message);
      throw new Error("Error al obtener el carrito");
    }
  }

  async createCart(products) {
    try {
      const cartCreated = await cartModel.create({ products });
      return cartCreated;
    } catch (error) {
      console.error(error.message);
      throw new Error("Error al crear el carrito");
    }
  }

  async addProductByID(cid, pid) {
    try {
      const cart = await cartModel.findOne({ _id: cid });
      if (!cart) {
        throw new Error(`El carrito ${cid} no existe`);
      }
      const existingProductIndex = cart.products.findIndex((product) => product._id._id.toString() === pid);
      if (existingProductIndex !== -1) {
        cart.products[existingProductIndex].quantity++;
      } else {
        cart.products.push({ _id: pid, quantity: 1 });
      }
      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
      throw error;
    }
  }

  async deleteProductInCart(cid, pid) {
    try {
      const cart = await cartModel.findOneAndUpdate({ _id: cid }, { $pull: { products: { _id: pid } } }, { new: true });
      return cart;
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      throw error;
    }
  }

  async updateCart(cid, products) {
    try {
      const cart = await cartModel.findOneAndUpdate({ _id: cid }, { products });
      return cart;
    } catch (error) {
      console.error(error.message);
      throw new Error("Error al actualizar los productos del carrito");
    }
  }

  async updateProductQuantity(cid, productId, quantity) {
    try {
      const cart = await cartModel.findOneAndUpdate(
        { _id: cid, "products._id": productId },
        { $set: { "products.$.quantity": quantity } },
        { new: true }
      );
      if (!cart) {
        throw new Error("Carrito no encontrado o el producto no está en el carrito");
      }
      return cart;
    } catch (error) {
      console.error(error.message);
      throw new Error("Error al actualizar la cantidad del producto");
    }
  }

  async clearCart(cid) {
    try {
      const cart = await cartModel.findOne({ _id: cid });

      if (!cart) {
        throw new Error("Carrito no encontrado");
      }

      cart.products = [];
      await cart.save();

      return cart;
    } catch (error) {
      console.error(error.message);
      throw new Error("Error al vaciar carrito");
    }
  }

  async getTotalQuantityInCart(cid) {
    try {
      const cart = await cartModel.findOne({ _id: cid }).lean();
      if (!cart) {
        throw new Error(`El carrito ${cid} no existe`);
      }

      let totalQuantity = 0;
      for (const product of cart.products) {
        totalQuantity += product.quantity;
      }

      return totalQuantity;
    } catch (error) {
      console.error("Error al obtener la cantidad total de productos en el carrito:", error);
      throw error;
    }
  }
}

export { cartManagerDB };
