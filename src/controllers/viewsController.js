import productService from "../services/productService.js";
import cartService from "../services/cartService.js";
import userService from "../services/userService.js";
import ticketService from "../services/ticketService.js";

//Funciones de ayuda
export const calculateTotalQuantityInCart = (user) => {
  if (!user.cart) return 0;
  return user.cart.products.reduce((total, { quantity }) => total + quantity, 0);
};

const formatProducts = (products) =>
  products.map(({ _id, quantity }) => ({
    _id: _id._id,
    quantity,
    name: _id.title,
  }));

const buildPaginationLinks = (req, products) => {
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

export const getAvatarPath = async (userId) => {
  try {
    if (!userId) {
      return `/img/profiles/defaultProfilePic.jpg`;
    }

    const user = await userService.getUserById(userId);
    if (!user || !user.documents) {
      return `/img/profiles/defaultProfilePic.jpg`;
    }

    const avatarDoc = user.documents.find((doc) => doc.docType === "avatar");
    return avatarDoc ? `/img/profiles/${userId}/ProfilePic` : `/img/profiles/defaultProfilePic.jpg`;
  } catch (error) {
    console.error(error);
    throw new Error("Error al obtener la ruta del avatar");
  }
};

//Controllers
export const goHome = async (req, res) => {
  req.logger.info("Redireccionar al home: Solicitud recibida.");
  try {
    res.status(200).redirect("/home");
  } catch (err) {
    req.logger.error(`goHome: ${err.message}`);
    res.status(400).send({ error: err.message });
  }
};

export const renderHome = async (req, res) => {
  try {
    const products = await productService.getPaginateProducts({}, { limit: 5, lean: true });
    const totalQuantityInCart = req.user ? calculateTotalQuantityInCart(req.user) : 0;
    const avatar = await getAvatarPath(req.user ? req.user._id : null);

    res.render("home", {
      title: "JIF STYLE STORE - Home",
      style: "styles.css",
      products: products.docs,
      user: req.user,
      avatar,
      userAdminOrPremium: req.isAdminOrPremium,
      totalQuantityInCart,
    });
  } catch (error) {
    req.logger.error(`renderHome: ${error.message}`);
    res.redirect("/login");
  }
};

export const renderLogin = (req, res) => {
  req.logger.info("renderLogin: Solicitud recibida.");
  res.render("login", {
    title: "JIF STYLE STORE - Login",
    style: "styles.css",
    message: "",
  });
  return;
};

export const renderRegister = (req, res) => {
  req.logger.info("renderRegister: Solicitud recibida.");
  res.render("register", {
    title: "JIF STYLE STORE - Registro",
    style: "styles.css",
    message: "",
  });
};

export const getProducts = async (req, res) => {
  req.logger.info("getProducts: Solicitud recibida.");
  const avatar = await getAvatarPath(req.user ? req.user._id : null);
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
    const categories = await productService.getDistinctCategories();
    const totalQuantityInCart = req.user ? calculateTotalQuantityInCart(req.user) : 0;
    const avatar = await getAvatarPath(req.user ? req.user._id : null);

    const response = {
      title: "JIF STYLE STORE - Productos",
      style: "styles.css",
      payload: products.docs,
      totalPages: products.totalPages,
      page: parseInt(page),
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      ...paginationLinks,
      categories: categories,
      avatar,
      user: req.user,
      userAdminOrPremium: req.isAdminOrPremium,
      totalQuantityInCart,
    };

    return res.render("products", response);
  } catch (error) {
    req.logger.error(`getProducts: ${error.message}`);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const renderRealTimeProducts = async (req, res) => {
  req.logger.info("renderRealTimeProducts: Solicitud recibida.");
  const totalQuantityInCart = calculateTotalQuantityInCart(req.user);
  const avatar = await getAvatarPath(req.user ? req.user._id : null);

  res.render("realTimeProducts", {
    title: "JIF STYLE STORE - Gestión de productos",
    products: productService.getAllProducts,
    style: "styles.css",
    user: req.user,
    avatar,
    userAdminOrPremium: req.isAdminOrPremium,
    totalQuantityInCart,
  });
};

export const renderChat = async (req, res) => {
  const totalQuantityInCart = calculateTotalQuantityInCart(req.user);
  const avatar = await getAvatarPath(req.user ? req.user._id : null);
  res.render("chat", {
    title: "JIF STYLE STORE - Chat",
    style: "styles.css",
    user: req.user,
    avatar,
    userAdminOrPremium: req.isAdminOrPremium,
    totalQuantityInCart,
  });
};

export const renderCart = async (req, res) => {
  req.logger.info("renderCart: Solicitud recibida.");
  try {
    const cart = await cartService.getCartById(req.params.cid);

    if (!cart) {
      req.logger.warn(`renderCart: Carrito con ID ${req.params.cid} no encontrado.`);
      return res.status(404).json({ error: "No se encontró el carrito" });
    }
    const products = await Promise.all(
      cart.products.map(async (item) => {
        const productData = await productService.getProductByID(item._id._id);
        return { ...item, product: productData };
      })
    );
    const totalQuantityInCart = calculateTotalQuantityInCart(req.user);
    const avatar = await getAvatarPath(req.user ? req.user._id : null);
    res.render("cart", {
      title: "JIF STYLE STORE - Carrito",
      style: "styles.css",
      payload: products,
      user: req.user,
      avatar,
      userAdminOrPremium: req.isAdminOrPremium,
      totalQuantityInCart,
    });
  } catch (error) {
    req.logger.error(`renderCart: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const renderProductDetails = async (req, res) => {
  req.logger.info("renderProductDetails: Solicitud recibida.");
  try {
    const { pid } = req.params;
    const product = await productService.getProductByID(pid);
    if (!product) {
      req.logger.warn(`renderProductDetails: Producto con ID ${pid} no encontrado.`);
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    const totalQuantityInCart = calculateTotalQuantityInCart(req.user);
    const avatar = await getAvatarPath(req.user ? req.user._id : null);
    res.render("product-details", {
      title: "JIF STYLE STORE - Detalles del Producto",
      style: "styles.css",
      product: product,
      avatar,
      user: req.user,
      userAdminOrPremium: req.isAdminOrPremium,
      totalQuantityInCart,
    });
  } catch (error) {
    req.logger.error(`renderProductDetails: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const redirectIfLoggedIn = (req, res, next) => {
  req.logger.info("redirectIfLoggedIn: Solicitud recibida.");
  if (req.user) {
    req.logger.info("redirectIfLoggedIn: El usuario está conectado, redirigiendo a /home.");
    return res.redirect("/home");
  }
  next();
};

export const isAdminOrPremium = (req, res, next) => {
  if (req.user) {
    req.isAdmin = req.user.role === "admin";
    req.isPremium = req.user.role === "premium";
    req.isAdminOrPremium = req.isAdmin || req.isPremium;
  } else {
    req.isAdmin = false;
    req.isPremium = false;
    req.isAdminOrPremium = false;
  }
  next();
};

export const purchaseView = async (req, res) => {
  req.logger.info("purchaseView: Solicitud recibida.");
  const avatar = await getAvatarPath(req.user ? req.user._id : null);
  try {
    const cart = await cartService.getCartById(req.params.cid);
    if (!cart) {
      req.logger.warn(`purchaseView: Carrito con ID ${req.params.cid} no encontrado.`);
      return res.status(404).json({ error: "El carrito no fue encontrado" });
    }
    const productsInCart = cart.products;
    let purchaseSuccess = [],
      purchaseError = [];
    let processedAmount = 0,
      notProcessedAmount = 0;

    for (let product of productsInCart) {
      const { _id: idproduct, quantity } = product;
      const productInDB = await productService.getProductByID(idproduct);
      if (!productInDB) {
        req.logger.warn(`purchaseView: Producto con ID ${idproduct} no encontrado.`);
        return res.status(404).json({ error: `Producto con ID ${idproduct} no encontrado` });
      }
      const monto = productInDB.price * quantity;

      if (quantity > productInDB.stock) {
        notProcessedAmount += monto;
        purchaseError.push(product);
      } else {
        const updatedStock = productInDB.stock - quantity;
        await productService.updateProduct(idproduct, { stock: updatedStock });

        processedAmount += monto;
        purchaseSuccess.push(product);
      }
    }

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

      return res.render("purchase", {
        status: "success",
        title: "JIF STYLE STORE - Comprar",
        style: "styles.css",
        payload: purchaseData,
        processedAmount,
        avatar,
        notProcessedAmount,
        user: req.user,
        userAdminOrPremium: req.isAdminOrPremium,
        totalQuantityInCart: calculateTotalQuantityInCart(req.user),
      });
    }

    return res.render("purchase", {
      status: "error",
      title: "JIF STYLE STORE - Comprar",
      style: "styles.css",
      processedAmount,
      notProcessedAmount,
      avatar,
      notProcessed,
      user: req.user,
      userAdminOrPremium: req.isAdminOrPremium,
      totalQuantityInCart: calculateTotalQuantityInCart(req.user),
    });
  } catch (error) {
    req.logger.error(`purchaseView: ${error.message}`);
    res.status(500).send({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};

export const resetPasswordView = (req, res) => {
  res.render("resetPassword", { style: "styles.css", title: "JIF STYLE STORE - Restablecer contraseña" });
};

export const newPasswordView = (req, res) => {
  res.render("newPassword", { style: "styles.css", title: "JIF STYLE STORE - Nueva contraseña" });
};

export const profileView = async (req, res) => {
  try {
    const avatar = await getAvatarPath(req.user ? req.user._id : null);
    const userId = req.user._id;
    const user = await userService.getUserById(userId);
    const documentsJson = JSON.stringify(user);
    const cartId = user.cart._id;
    res.render("profile", {
      user,
      cartId,
      title: "JIF STYLE STORE - Mi Perfil",
      style: "styles.css",
      user: req.user,
      avatar,
      documentsJson,
      userAdminOrPremium: req.isAdminOrPremium,
      totalQuantityInCart: calculateTotalQuantityInCart(req.user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};
