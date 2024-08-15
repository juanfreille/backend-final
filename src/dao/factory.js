import mongoose from "mongoose";
import config from "../config/config.js";

export let carts;
export let products;
export let users;
export let tickets;
export let resetPasswordCodes;
export let messages;

const { default: ResetPasswordCodesMongoDB } = await import("./MongoDB/ResetPasswordDB.js");
resetPasswordCodes = ResetPasswordCodesMongoDB;

switch (config.PERSISTENCE) {
  case "MONGO":
    mongoose.connect(config.MONGO_URL);
    const { default: CartsMongoDB } = await import("./MongoDB/CartManagerDB.js");
    const { default: ProductsMongoDB } = await import("./MongoDB/ProductManagerDB.js");
    const { default: UsersMongoDB } = await import("./MongoDB/UserManagerDB.js");
    const { default: TicketsMongoDB } = await import("./MongoDB/TicketManagerDB.js");
    const { default: MessagesMongoDB } = await import("./MongoDB/MessageManagerDB.js");

    carts = CartsMongoDB;
    products = ProductsMongoDB;
    users = UsersMongoDB;
    tickets = TicketsMongoDB;
    messages = MessagesMongoDB;
    break;
  case "FS":
    const { default: CartsFS } = await import("./FileSystem/CartManagerFS.js");
    const { default: ProductsFS } = await import("./FileSystem/ProductManagerFS.js");
    const { default: UsersFS } = await import("./FileSystem/UserManagerFS.js");
    const { default: TicketsFS } = await import("./FileSystem/TicketManagerFS.js");
    const { default: MessagesFS } = await import("./FileSystem/MessageManagerFS.js");

    carts = CartsFS;
    products = ProductsFS;
    users = UsersFS;
    tickets = TicketsFS;
    messages = MessagesFS;
    break;
}
