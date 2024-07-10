import cartService from "../services/cartService.js";
import productService from "../services/productService.js";
import ticketService from "../services/ticketService.js";

export const getAllCarts = async (req, res) => {
  req.logger.info("Solicitud para obtener todos los carritos recibida.");
  try {
    const carts = await cartService.getAllCarts();
    req.logger.info(`Carritos encontrados (${carts.length})`);
    res.send({ status: "success", payload: carts });
  } catch (error) {
    req.logger.error(`Error al obtener carritos: ${error.message}`);
    res.status(500).send({ status: "error", message: "Error al obtener carritos." });
  }
};

export const getCartById = async (req, res) => {
  const cid = req.params.cid;
  req.logger.info(`Solicitud para obtener el carrito con ID: ${cid}`);
  try {
    const cart = await cartService.getCartById(cid);
    req.logger.info(`Carrito encontrado (${cart._id})`);
    res.status(200).send({ status: "success", payload: cart });
  } catch (error) {
    req.logger.error(`Carrito con ID: ${cid} no encontrado.`);
    res.status(400).send({ status: "error", message: `Carrito con ID: ${cid} no encontrado.` });
  }
};

export const createCart = async (req, res) => {
  req.logger.info("Solicitud para crear un nuevo carrito recibida.");
  const products = req.body.products;
  try {
    const newCart = await cartService.createCart(products);
    req.logger.info(`Carrito creado. ID del Carrito: ${newCart._id}`);
    res.status(201).send({ status: "success", payload: newCart });
  } catch (error) {
    req.logger.error(`Error al crear un nuevo carrito`);
    res.status(500).send({ status: "error", message: "Error al crear un nuevo carrito." });
  }
};

export const addProductToCart = async (req, res) => {
  const { cid, pid } = req.params;
  const userId = req.user._id;
  req.logger.info(`Solicitud para agregar producto (ID: ${pid}) al carrito (ID: ${cid}) recibida.`);
  try {
    const product = await productService.getProductByID(pid);
    if (product.owner == userId && req.user.role == "premium") {
      req.logger.info(`El usuario premium ${userId} intentó agregar su propio producto ${pid} al carrito ${cid}`);
      res.status(400).json({ status: "error: un usuario premium no puede agregar su propio producto al carrito" });
    } else {
      const updatedCart = await cartService.addProductByID(cid, pid);
      req.logger.info(`Producto (ID: ${pid}) agregado al carrito (ID: ${cid}) exitosamente.`);
      res.send({ status: "success", payload: updatedCart });
    }
  } catch (error) {
    req.logger.error(`Error al agregar producto (ID: ${pid}) al carrito (ID: ${cid})`);
    res.status(500).send({ status: "error", message: `Error al agregar producto (ID: ${pid}) al carrito (ID: ${cid})` });
  }
};

export const deleteProductInCart = async (req, res) => {
  const { cid, pid } = req.params;
  req.logger.info(`Solicitud para eliminar producto (ID: ${pid}) del carrito (ID: ${cid}) recibida.`);
  try {
    const updatedCart = await cartService.deleteProductInCart(cid, pid);
    req.logger.info(`Producto (ID: ${pid}) eliminado del carrito (ID: ${cid}) exitosamente.`);
    res.send({ status: "success", payload: updatedCart });
  } catch (error) {
    req.logger.error(`Error al eliminar producto (ID: ${pid}) del carrito (ID: ${cid})`);
    res.status(500).send({ status: "error", message: `Error al eliminar producto (ID: ${pid}) del carrito (ID: ${cid})` });
  }
};

export const updateCart = async (req, res) => {
  const cid = req.params.cid;
  const products = req.body.products;
  req.logger.info(`Solicitud para actualizar el carrito (ID: ${cid}) recibida.`);
  try {
    const updatedCart = await cartService.updateCart(cid, products);
    req.logger.info(`Carrito (ID: ${cid}) actualizado exitosamente.`);
    res.send({ status: "success", payload: updatedCart });
  } catch (error) {
    req.logger.error(`Error al actualizar el carrito (ID: ${cid})`);
    res.status(500).send({ status: "error", message: `Error al actualizar el carrito (ID: ${cid})` });
  }
};

export const updateProductQuantity = async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  req.logger.info(`Solicitud para actualizar la cantidad del producto (ID: ${pid}) en el carrito (ID: ${cid}) recibida.`);
  try {
    const updatedCart = await cartService.updateProductQuantity(cid, pid, quantity);
    req.logger.info(`Cantidad del producto (ID: ${pid}) en el carrito (ID: ${cid}) actualizada exitosamente.`);
    res.status(200).send({ status: "success", payload: updatedCart });
  } catch (error) {
    req.logger.error(`Error al actualizar la cantidad del producto (ID: ${pid}) en el carrito (ID: ${cid})`);
    res.status(500).send({ status: "error", message: `Error al actualizar la cantidad del producto (ID: ${pid}) en el carrito (ID: ${cid})` });
  }
};

export const clearCart = async (req, res) => {
  const cid = req.params.cid;
  req.logger.info(`Solicitud para vaciar el carrito (ID: ${cid}) recibida.`);
  try {
    const clearedCart = await cartService.clearCart(cid);
    req.logger.info(`Carrito (ID: ${cid}) vaciado exitosamente.`);
    res.send({ status: "success", payload: clearedCart });
  } catch (error) {
    req.logger.error(`Error al vaciar el carrito (ID: ${cid})`);
    res.status(500).send({ status: "error", message: `Error al vaciar el carrito (ID: ${cid})` });
  }
};

export const getTotalQuantityInCart = async (req, res) => {
  const cid = req.params.cid;
  req.logger.info(`Solicitud para obtener la cantidad total del carrito (ID: ${cid}) recibida.`);
  try {
    const totalQuantity = await cartService.getTotalQuantityInCart(cid);
    req.logger.info(`Cantidad total del carrito (ID: ${cid}) obtenida exitosamente.`);
    res.send({ status: "success", payload: totalQuantity });
  } catch (error) {
    req.logger.error(`Error al obtener la cantidad total del carrito (ID: ${cid})`);
    res.status(500).send({ status: "error", message: `Error al obtener la cantidad total del carrito (ID: ${cid})` });
  }
};

export const purchaseCart = async (req, res) => {
  req.logger.info(`Solicitud para comprar el carrito con ID: ${req.params.cid} recibida.`);
  try {
    const cart = await cartService.getCartById(req.params.cid);
    if (!cart) {
      req.logger.warn(`Carrito con ID: ${req.params.cid} no encontrado.`);
      return res.status(404).json({ error: "El carrito no fue encontrado" });
    }
    const productsInCart = cart.products;
    let purchaseSuccess = [],
      purchaseError = [];
    let processedAmount = 0,
      notProcessedAmount = 0;

    req.logger.info(`Procesando productos del carrito (ID: ${req.params.cid}).`);
    for (let product of productsInCart) {
      const { _id: idproduct, quantity } = product;
      const productInDB = await productService.getProductByID(idproduct);
      if (!productInDB) {
        req.logger.warn(`Producto con ID ${idproduct} no encontrado en la base de datos.`);
        return res.status(404).json({ error: `Producto con ID ${idproduct} no encontrado` });
      }
      const monto = productInDB.price * quantity;

      if (quantity > productInDB.stock) {
        notProcessedAmount += monto;
        purchaseError.push(product);
        req.logger.warn(`Stock insuficiente para el producto (ID: ${idproduct}).`);
      } else {
        const updatedStock = productInDB.stock - quantity;
        await productService.updateProduct(idproduct, { stock: updatedStock });

        processedAmount += monto;
        purchaseSuccess.push(product);
        req.logger.info(`Producto (ID: ${idproduct}) procesado exitosamente.`);
      }
    }

    const formatProducts = (products) =>
      products.map(({ _id, quantity }) => ({
        _id: _id._id,
        quantity,
        name: _id.title,
      }));

    const notProcessed = formatProducts(purchaseError);
    const processed = formatProducts(purchaseSuccess);
    await cartService.insertArray(cart._id, purchaseError);
    const updatedCart = await cartService.getCartById(cart._id);
    req.user.cart = updatedCart;

    if (purchaseSuccess.length > 0) {
      const ticket = await ticketService.createTicket(req.user.email, processedAmount, processed);
      const purchaseData = {
        ticketId: ticket._id,
        amount: ticket.amount,
        purchaser: ticket.purchaser,
        productosProcesados: processed,
        productosNoProcesados: notProcessed,
        cartId: cart._id,
      };

      req.logger.info(`Compra procesada exitosamente. Ticket ID: ${ticket._id}`);
      return res.status(200).send({ status: "success", payload: purchaseData });
    }

    req.logger.info(`No se procesaron productos debido a la falta de stock.`);
    return res.status(200).send({
      status: "error",
      message: "No se procesaron productos, por falta de stock.",
      notProcessedProducts: notProcessed,
    });
  } catch (error) {
    req.logger.error(`Error al procesar la compra del carrito con ID: ${req.params.cid}. Error: ${error.message}`);
    res.status(400).send({ status: "error", message: error.message });
  }
};
