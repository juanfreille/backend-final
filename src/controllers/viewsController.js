import { userModel } from "../models/userModel.js";
import { productModel } from "../models/productModel.js";
import productService from "../services/productService.js";
import { cartModel } from "../models/cartModel.js";
import cartService from "../services/cartService.js";
import ticketRepository from "../repositories/tickets.repository.js";

export const goHome = async (req, res) => {
  try {
    res.status(200).redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: err.message });
  }
};

export const renderHome = async (req, res) => {
  try {
    const limit = 5;
    const products = await productModel.find().limit(limit).lean();
    const totalQuantityInCart = calculateTotalQuantityInCart(req.user);

    res.render("home", {
      title: "Backend / Final - Home",
      style: "styles.css",
      products: products,
      user: req.user,
      userAdmin: req.isAdmin,
      totalQuantityInCart,
    });
  } catch (error) {
    res.redirect("/login");
  }
};

export const renderLogin = (req, res) => {
  res.render("login", {
    title: "Backend / Final - Login",
    style: "styles.css",
    message: req.session.messages ?? "",
  });
  delete req.session.errorMessage;
  delete req.session.messages;
  req.session.save();
  return;
};

export const renderRegister = (req, res) => {
  res.render("register", {
    title: "Backend / Final - Registro",
    style: "styles.css",
    message: req.session.messages ?? "",
  });
  delete req.session.messages;
  req.session.save();
};

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 8, sort } = req.query;
    //uso limit 8 solo por cuestiones esteticas para que funcione bien con mi frontEnd
    const options = {
      page: Number(page),
      limit: Number(limit),
      lean: true,
    };

    const searchQuery = {};

    if (req.query.category) {
      searchQuery.category = req.query.category;
    }

    if (req.query.title) {
      searchQuery.title = { $regex: req.query.title, $options: "i" };
    }

    if (req.query.stock) {
      const stockNumber = parseInt(req.query.stock);
      if (!isNaN(stockNumber)) {
        searchQuery.stock = stockNumber;
      }
    }

    if (sort === "asc" || sort === "desc") {
      options.sort = { price: sort === "asc" ? 1 : -1 };
    }

    const products = await productService.getPaginateProducts(searchQuery, options);
    const paginationLinks = buildPaginationLinks(req, products);
    const categories = await productModel.distinct("category");
    const totalQuantityInCart = calculateTotalQuantityInCart(req.user);

    let requestedPage = parseInt(page);
    if (isNaN(requestedPage) || requestedPage < 1) {
      requestedPage = 1;
    }

    if (requestedPage > products.totalPages) {
      return res.render("error", {
        title: "Backend / Final - Products",
        style: "styles.css",
        message: "La página solicitada no existe",
        redirect: "/products",
      });
    }

    const response = {
      title: "Backend / Final - Products",
      style: "styles.css",
      payload: products.docs,
      totalPages: products.totalPages,
      page: parseInt(page),
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      ...paginationLinks,
      categories: categories,
      user: req.user,
      userAdmin: req.isAdmin,
      totalQuantityInCart,
    };

    return res.render("products", response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const renderRealTimeProducts = async (req, res) => {
  const totalQuantityInCart = calculateTotalQuantityInCart(req.user);

  res.render("realTimeProducts", {
    products: productService.getAllProducts,
    style: "styles.css",
    user: req.user,
    userAdmin: req.isAdmin,
    totalQuantityInCart,
  });
};

export const renderChat = async (req, res) => {
  const totalQuantityInCart = calculateTotalQuantityInCart(req.user);
  res.render("chat", {
    style: "styles.css",
    user: req.user,
    userAdmin: req.isAdmin,
    totalQuantityInCart,
  });
};

export const renderCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartModel.findOne({ _id: cid }).lean();
    if (!cart) {
      return res.status(404).json({ error: "No se encontró el carrito" });
    }
    const products = await Promise.all(
      cart.products.map(async (product) => {
        const productData = await productModel.findOne({ _id: product._id }).lean();
        return { ...product, product: productData };
      })
    );
    const totalQuantityInCart = calculateTotalQuantityInCart(req.user);

    res.render("cart", {
      title: "Backend / Final - cart",
      style: "styles.css",
      payload: products,
      user: req.user,
      userAdmin: req.isAdmin,
      totalQuantityInCart,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const renderProductDetails = async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productModel.findOne({ _id: pid }).lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const totalQuantityInCart = calculateTotalQuantityInCart(req.user);

    res.render("product-details", {
      title: "Detalles del Producto",
      style: "styles.css",
      product: product,
      user: req.user,
      userAdmin: req.isAdmin,
      totalQuantityInCart,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const redirectIfLoggedIn = (req, res, next) => {
  if (req.user) {
    return res.redirect("/home");
  }
  next();
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("coderCookieToken");
    res.redirect("/login");
    return;
  } catch (error) {
    return res.status(500).json({ status: "error", error: "Internal Server Error" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    req.isAdmin = true;
  } else {
    req.isAdmin = false;
  }
  next();
};

export const populateCart = async (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.role !== "admin" && user.cart) {
      req.user = await userModel.findOne({ _id: user._id }).populate("cart").lean();
    }
    next();
  } catch (error) {
    console.error("Error populating user cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const calculateTotalQuantityInCart = (user) => {
  let totalQuantityInCart = 0;
  if (user.cart) {
    totalQuantityInCart = user.cart.products.reduce((total, productInCart) => {
      return total + productInCart.quantity;
    }, 0);
  }
  return totalQuantityInCart;
};

export const buildPaginationLinks = (req, products) => {
  const { prevPage, nextPage } = products;
  const baseUrl = req.originalUrl.split("?")[0];
  const sortParam = req.query.sort ? `&sort=${req.query.sort}` : "";

  const prevLink = prevPage ? `${baseUrl}?page=${prevPage}${sortParam}` : null;
  const nextLink = nextPage ? `${baseUrl}?page=${nextPage}${sortParam}` : null;

  return {
    prevPage: prevPage ? parseInt(prevPage) : null,
    nextPage: nextPage ? parseInt(nextPage) : null,
    prevLink,
    nextLink,
  };
};

export const verifyUserSession = (req, res, next) => {
  if (!req.user) {
    res.clearCookie("connect.sid");
    return res.redirect("/login");
  }
  next();
};

// Vista para purchase:
export const purchaseView = async (req, res) => {
  try {
    // Verificar si el carrito existe
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
      // Crear el ticket
      const ticket = await ticketRepository.createTicket(req.user.email, amount, cart);

      const purchaseData = {
        ticketId: ticket._id,
        amount: ticket.amount,
        purchaser: ticket.purchaser,
        productosProcesados: processed,
        productosNoProcesados: notProcessed,
        cartId: cart._id,
      };

      // Renderizar la vista del ticket
      res.render("purchase", {
        status: "success",
        title: "Detalles del Producto",
        style: "styles.css",
        payload: purchaseData,
        processedAmount,
        notProcessedAmount,
      });
    } else {
      res.status(200).send("errorPurchase", {
        status: "success",
        message: "No se procesaron productos, por falta de stock.",
        productosNoProcesados: notProcessed,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      status: "error",
      message: "Error interno del servidor",
    });
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
