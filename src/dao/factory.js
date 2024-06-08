import mongoose from "mongoose";
import config from "../config/config.js";
import ProductMongoDAO from "../dao/MongoDB/ProductManagerDB.js";
import CartMongoDAO from "../dao/MongoDB/CartManagerDB.js";
import UserMongoDAO from "../dao/MongoDB/UserManagerDB.js";
import TicketMongoDAO from "../dao/MongoDB/TickerManagerDB.js";
import ProductFsDAO from "../dao/FileSystem/ProductManagerFS.js";
import CartFsDAO from "../dao/FileSystem/CartManagerFS.js";
import UserFsDAO from "../dao/FileSystem/userMemoryDAO.js";
import TicketFsDAO from "../dao/FileSystem/ticketMemoryDAO.js";

const Factory = async () => {
  switch (config.PERSISTENCE) {
    case "MONGO":
      mongoose.connect(process.env.DB_CONNECTION);
      return { productDAO: new ProductMongoDAO(), cartDAO: new CartMongoDAO(), userDAO: new UserMongoDAO(), ticketDAO: new TicketMongoDAO() };
    case "FILESYSTEM":
      return { productDAO: new ProductFsDAO(), cartDAO: new CartFsDAO(), userDAO: new UserFsDAO(), ticketDAO: new TicketFsDAO() };
  }
};

export default Factory;
