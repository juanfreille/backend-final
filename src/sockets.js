import { messageModel } from "./dao/models/messageModel.js";
import { productManagerDB } from "./dao/ProductManagerDB.js";
import { messageService } from "./services/messageService.js";

const ProductService = new productManagerDB();
let users = [];
let usersDB = [];

export default (io) => {
  io.on("connection", handleConnection);

  async function handleConnection(socket) {
    console.log(`Nuevo cliente conectado ${socket.id}`);
    emitProducts(socket);

    socket.on("createProduct", async (product) => {
      await addProductAndEmit(product);
    });
    socket.on("deleteProduct", async (pid) => {
      await deleteProductAndEmit(pid);
    });
    socket.on("message", async (data) => {
      await messageService.saveMessage(data);
      const messages = await messageModel.find().lean();
      socket.emit("messagesLogs", messages);
    });

    const messages = await messageModel.find().lean();
    socket.on("userConnect", (data) => {
      users.push({ id: socket.id, name: data });
      console.log(users);
      io.emit("updateUserList", users);
      socket.emit("messagesLogs", messages);
      socket.emit("activ-user", users);
      socket.broadcast.emit("newUser", data);
    });
    socket.on("registerEmail", (email) => {
      if (usersDB.includes(email)) {
        socket.emit("registerResponse", {
          success: false,
          message: `El email ${email} ya se encuentra registrado`,
        });
      } else {
        usersDB.push(email);
        socket.emit("registerResponse", {
          success: true,
          email: email,
        });
      }
    });
  }

  async function emitProducts(socket) {
    const productsList = await ProductService.getAllProducts();
    socket.emit("products", productsList);
  }

  async function addProductAndEmit(product) {
    try {
      await ProductService.createProduct(product), emitProducts(io);
    } catch (error) {
      throw new Error("Error al crear el producto");
    }
  }

  async function deleteProductAndEmit(pid) {
    try {
      await ProductService.deleteProduct(pid), emitProducts(io);
    } catch (error) {
      throw new Error("Error al eliminar el producto");
    }
  }
};
