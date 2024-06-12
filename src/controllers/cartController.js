import cartService from "../services/cartService.js";
import productService from "../services/productService.js";
import ticketService from "../services/ticketService.js";
import ticketRepository from "../repositories/tickets.repository.js";

export const getAllCarts = async (req, res) => {
  try {
    const carts = await cartService.getAllCarts();
    res.status(200).send(carts);
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
};

export const getCartById = async (req, res) => {
  try {
    const cart = await cartService.getCartById(req.params.cid);
    res.status(200).send({ status: "success", payload: cart });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

export const createCart = async (req, res) => {
  try {
    const { products } = req.body;
    const cart = await cartService.createCart(products);
    res.status(200).send({ status: "success", payload: cart });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

export const addProductByID = async (req, res) => {
  try {
    const cart = await cartService.addProductByID(req.params.cid, req.params.pid);
    res.status(200).send({ status: "success", payload: cart });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

export const deleteProductInCart = async (req, res) => {
  try {
    const cart = await cartService.deleteProductInCart(req.params.cid, req.params.pid);
    res.status(200).send({ status: "success", payload: cart });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const cart = await cartService.updateCart(req.params.cid, req.body.products);
    res.status(200).send({ status: "success", payload: cart });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

export const updateProductQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateProductQuantity(req.params.cid, req.params.pid, parseInt(quantity));
    res.status(200).send({ status: "success", payload: cart });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.params.cid);
    res.status(200).send({ status: "success", payload: cart });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

export const getTotalQuantityInCart = async (req, res) => {
  try {
    const totalQuantity = await cartService.getTotalQuantityInCart(req.params.cid);
    res.status(200).send({ status: "success", payload: totalQuantity });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};

export const purchase = async (req, res) => {
  try {
    const cart = await cartService.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ status: "error", message: "El carrito no fue encontrado" });

    const productsInCart = cart.products;
    let purchaseSuccess = [],
      purchaseError = [];
    let processedAmount = 0,
      notProcessedAmount = 0;

    for (let product of productsInCart) {
      const { _id: idproduct, quantity } = product;
      const productInDB = await productService.getProductByID(idproduct);
      if (!productInDB) return res.status(404).json({ status: "error", message: `Producto con ID ${idproduct} no encontrado` });

      const monto = productInDB.price * quantity;

      if (quantity > productInDB.stock) {
        notProcessedAmount += monto;
        purchaseError.push({ ...product, productData: productInDB });
      } else {
        const updatedStock = productInDB.stock - quantity;
        await productService.updateProduct(idproduct, { stock: updatedStock });

        processedAmount += monto;
        purchaseSuccess.push({ ...product, productData: productInDB });
      }
    }

    const formatProducts = (products) =>
      products.map(({ _id, quantity, productData }) => ({
        _id,
        quantity,
        name: productData.title,
      }));

    const notProcessed = formatProducts(purchaseError);
    const processed = formatProducts(purchaseSuccess);

    await cartService.insertArray(cart._id, purchaseError);
    const updatedCart = await cartService.getCartById(cart._id);
    req.user.cart = updatedCart;

    if (purchaseSuccess.length > 0) {
      // Crear un ticket para la compra
      const ticket = await ticketRepository.createTicket(req.user.email, processedAmount, processed);
      const purchaseData = {
        amount: ticket.amount,
        purchaser: ticket.purchaser,
        productosProcesados: processed,
        productosNoProcesados: notProcessed,
        cartId: cart._id,
      };
      return res.status(200).send({ status: "success", payload: purchaseData });
    }

    return res.status(200).send({
      status: "error",
      message: "No se procesaron productos, por falta de stock.",
      notProcessedProducts: notProcessed,
    });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
};
