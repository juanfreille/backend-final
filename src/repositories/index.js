import Factory from "../dao/factory.js";
import ProductRepository from "./products.repository.js";
import CartRepository from "./carts.repository.js";
import UserRepository from "./users.repository.js";
import TicketRepository from "./tickets.repository.js";

const dao = await Factory();
export const productService = new ProductRepository(dao.productDAO);
export const cartService = new CartRepository(dao.cartDAO);
export const userService = new UserRepository(dao.userDAO);
export const ticketService = new TicketRepository(dao.ticketDAO);
