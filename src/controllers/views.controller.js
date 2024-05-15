import userModel from "../dao/models/userModel.js";
import { productManagerDB } from "../dao/ProductManagerDB.js";
import { productModel } from "../dao/models/productModel.js";

const ProductService = new productManagerDB();

export const goHome = async (req, res) => {
  try {
    res.status(200).redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: err.message });
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

    const products = await ProductService.getPaginateProducts(searchQuery, options);
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
