import { cartModel } from "../models/cartModel.js";
import { productModel } from "../models/productModel.js";
import CartDTO from "../dto/cartDTO.js";
import CustomError from "../services/errors/CustomError.js";
import { ErrorCodes } from "../services/errors/enums.js";
import { generateDatabaseErrorInfo, generateNotFoundErrorInfo } from "../services/errors/info.js";

export class CartRepository {
  async getAllCarts() {
    try {
      return await cartModel.find().lean();
    } catch (error) {
      throw new CustomError(ErrorCodes.DATABASE_ERROR, "Error al buscar los carritos", generateDatabaseErrorInfo(error.message));
    }
  }

  async getCartById(cid) {
    try {
      const cart = await cartModel.findById(cid).populate("products._id").lean();
      const cartDTO = new CartDTO(cart);
      return cart;
    } catch (error) {
      throw new CustomError(ErrorCodes.DATABASE_ERROR, "Error al obtener el carrito", generateDatabaseErrorInfo(error.message));
    }
  }

  async createCart(products) {
    try {
      const newCart = new cartModel({ products });
      const savedCart = await newCart.save();
      return savedCart._id;
    } catch (error) {
      throw new CustomError(ErrorCodes.DATABASE_ERROR, "Error al crear el carrito", generateDatabaseErrorInfo(error.message));
    }
  }

  async addProductByID(cid, pid) {
    try {
      const cart = await cartModel.findOne({ _id: cid });
      if (!cart) {
        throw new CustomError(ErrorCodes.NOT_FOUND_ERROR, `El carrito ${cid} no existe`, generateNotFoundErrorInfo("Carrito", cid));
      }
      const existingProductIndex = cart.products.findIndex((product) => product._id.toString() === pid);
      if (existingProductIndex !== -1) {
        cart.products[existingProductIndex].quantity++;
      } else {
        cart.products.push({ _id: pid, quantity: 1 });
      }
      await cart.save();
      return new CartDTO(cart);
    } catch (error) {
      throw new CustomError(ErrorCodes.DATABASE_ERROR, "Error al agregar producto al carrito", generateDatabaseErrorInfo(error.message));
    }
  }

  async deleteProductInCart(cid, pid) {
    try {
      const cart = await cartModel.findOne({ _id: cid });
      if (!cart) {
        throw new CustomError(ErrorCodes.NOT_FOUND_ERROR, `El carrito ${cid} no existe`, generateNotFoundErrorInfo("Carrito", cid));
      }
      const product = await productModel.findOne({ _id: pid });
      if (!product) {
        throw new CustomError(ErrorCodes.NOT_FOUND_ERROR, `El producto ${pid} no existe`, generateNotFoundErrorInfo("Producto", pid));
      }
      const filter = cart.products.filter((item) => item._id.toString() !== product._id.toString());
      cart.products = filter;
      await cart.save();
      return new CartDTO(cart);
    } catch (error) {
      throw new CustomError(ErrorCodes.DATABASE_ERROR, "Error al eliminar un producto del carrito", generateDatabaseErrorInfo(error.message));
    }
  }

  async updateCart(cid, products) {
    try {
      const cart = await cartModel.findOneAndUpdate({ _id: cid }, { products }, { new: true }).populate("products._id");
      if (!cart) {
        throw new CustomError(ErrorCodes.NOT_FOUND_ERROR, `El carrito ${cid} no existe`, generateNotFoundErrorInfo("Carrito", cid));
      }
      return new CartDTO(cart);
    } catch (error) {
      throw new CustomError(ErrorCodes.DATABASE_ERROR, "Error al actualizar los productos del carrito", generateDatabaseErrorInfo(error.message));
    }
  }

  async updateProductQuantity(cid, pid, quantity) {
    try {
      const cart = await cartModel.findOneAndUpdate({ _id: cid, "products._id": pid }, { $set: { "products.$.quantity": quantity } }, { new: true });
      if (!cart) {
        throw new CustomError(
          ErrorCodes.NOT_FOUND_ERROR,
          "Carrito no encontrado o el producto no está en el carrito",
          generateNotFoundErrorInfo("Carrito o Producto", `${cid} o ${pid}`)
        );
      }
      return new CartDTO(cart);
    } catch (error) {
      throw new CustomError(ErrorCodes.DATABASE_ERROR, "Error al actualizar la cantidad del producto", generateDatabaseErrorInfo(error.message));
    }
  }

  async insertArray(cid, products) {
    try {
      const arr = [];
      for (const item of products) {
        const object = await productModel.findById(item._id);
        arr.push({
          _id: object._id,
          quantity: item.quantity,
        });
      }
      const filter = { _id: cid };
      const update = { $set: { products: arr } };
      const updateCart = await cartModel.findOneAndUpdate(filter, update, {
        new: true,
      });
      return updateCart;
    } catch (error) {
      throw new CustomError(ErrorCodes.DATABASE_ERROR, "Error al insertar productos en el carrito", generateDatabaseErrorInfo(error.message));
    }
  }

  async clearCart(cid) {
    try {
      const cart = await cartModel.findOne({ _id: cid });

      if (!cart) {
        throw new CustomError(ErrorCodes.NOT_FOUND_ERROR, `El carrito ${cid} no existe`, generateNotFoundErrorInfo("Carrito", cid));
      }

      cart.products = [];
      await cart.save();

      return new CartDTO(cart);
    } catch (error) {
      throw new CustomError(ErrorCodes.DATABASE_ERROR, "Error al vaciar carrito", generateDatabaseErrorInfo(error.message));
    }
  }

  async getTotalQuantityInCart(cid) {
    try {
      const cart = await cartModel.findOne({ _id: cid }).lean();
      if (!cart) {
        throw new CustomError(ErrorCodes.NOT_FOUND_ERROR, `El carrito ${cid} no existe`, generateNotFoundErrorInfo("Carrito", cid));
      }

      let totalQuantity = 0;
      for (const product of cart.products) {
        totalQuantity += product.quantity;
      }

      return totalQuantity;
    } catch (error) {
      throw new CustomError(
        ErrorCodes.DATABASE_ERROR,
        "Error al obtener la cantidad total de productos en el carrito",
        generateDatabaseErrorInfo(error.message)
      );
    }
  }
}
