import { carts, products, users, tickets, resetPasswordCodes, messages } from "../dao/factory.js";

import CartsRepository from "./cartService.js";
import ProductsRepository from "./productService.js";
import UsersRepository from "./userService.js";
import TicketsRepository from "./ticketService.js";
import ResetPasswordRepository from "./resetPasswordService.js";
import MessagesRepository from "./messageService.js";

export const cartService = new CartsRepository(new carts());
export const productService = new ProductsRepository(new products());
export const userService = new UsersRepository(new users());
export const ticketService = new TicketsRepository(new tickets());
export const resetPasswordService = new ResetPasswordRepository(new resetPasswordCodes());
export const messageService = new MessagesRepository(new messages());
