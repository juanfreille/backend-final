import cartService from "../services/cartService.js";

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
