import cartService from "../services/cartService.js";
import ticketRepository from "../repositories/tickets.repository.js";

export const getAllCarts = async (req, res) => {
  try {
    const result = await cartService.getAllCarts();
    return res.status(200).send(result);
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
};

export const getCartById = async (req, res) => {
  try {
    const result = await cartService.getCartById(req.params.cid);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
};

export const createCart = async (req, res) => {
  try {
    const { products } = req.body;
    const result = await cartService.createCart(products);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
};

export const addProductByID = async (req, res) => {
  try {
    const result = await cartService.addProductByID(req.params.cid, req.params.pid);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
};

export const deleteProductInCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartService.deleteProductInCart(cid, pid);
    if (!cart) {
      return res.status(400).send({
        status: "error",
        message: error.message,
      });
    }
    return res.send({
      status: "success",
      message: `ID del producto eliminado: ${pid}`,
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
};

export const updateCart = async (req, res) => {
  try {
    const result = await cartService.updateCart(req.params.cid, req.body.products);
    res.send({
      status: "success",
      message: "Carrito actualizado correctamente",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
};

export const updateProductQuantity = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    let { quantity } = req.body;
    quantity = parseInt(quantity);
    const result = await cartService.updateProductQuantity(cid, pid, quantity);
    res.send({
      status: "success",
      cart: result,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const result = await cartService.clearCart(req.params.cid);
    res.send({
      status: "success",
      message: "Carrito vaciado",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
};

export const purchase = async (req, res) => {
  try {
    const cart = await cartService.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: "El carrito no fue encontrado" });
    }

    const productsInCart = cart.products;
    let purchaseSuccess = [];
    let purchaseError = [];
    let amount = 0;
    let processedAmount = 0;
    let notProcessedAmount = 0;

    try {
      amount = await calculateTotalAmount(productsInCart);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }

    for (let product of productsInCart) {
      const idproduct = product._id;
      const quantity = product.quantity;
      const productInDB = await productService.getProductByID(idproduct);
      if (!productInDB) {
        return res.status(404).json({ error: `Producto con ID ${idproduct} no encontrado` });
      }

      const monto = productInDB.price * quantity;

      if (quantity > productInDB.stock) {
        notProcessedAmount += monto;
        purchaseError.push({ ...product, productData: productInDB });
      } else {
        processedAmount += monto;
        purchaseSuccess.push({ ...product, productData: productInDB });
      }
    }

    const notProcessed = purchaseError.map((product) => ({
      _id: product._id,
      quantity: product.quantity,
      name: product.productData.title,
    }));

    const processed = purchaseSuccess.map((product) => ({
      _id: product._id,
      quantity: product.quantity,
      name: product.productData.title,
    }));

    if (purchaseSuccess.length > 0) {
      const ticket = await ticketRepository.createTicket(req.user.email, amount, cart);

      const purchaseData = {
        ticketId: ticket._id,
        amount: ticket.amount,
        purchaser: ticket.purchaser,
        productosProcesados: processed,
        productosNoProcesados: notProcessed,
        cartId: cart._id,
      };
      res.status(200).send({ status: "success", payload: purchaseData });
    } else {
      res.status(200).send({
        status: "success",
        message: "No se procesaron productos, por falta de stock.",
        productosNoProcesados: notProcessed,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
};

const calculateTotalAmount = async (productsInCart) => {
  let amount = 0;

  for (let product of productsInCart) {
    const idproduct = product._id;
    const quantity = product.quantity;
    const productInDB = await productService.getProductByID(idproduct);

    if (!productInDB) {
      throw new Error(`Producto con ID ${idproduct} no encontrado`);
    }

    const monto = productInDB.price * quantity;
    amount += monto;
  }

  return amount;
};
