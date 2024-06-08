import { messageModel } from "./models/messageModel.js";
import ProductManager from "./dao/MongoDB/ProductManagerDB.js";
import MessageManager from "./dao/MongoDB/MessageManagerDB.js";
import CartManager from "./dao/MongoDB/CartManagerDB.js";
import config from "./config/config.js";

const ProductService = new ProductManager();
const CartService = new CartManager();
const messageService = new MessageManager();

let users = [];

export default (io) => {
  io.on("connection", async (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);

    // Manejo de productos
    const emitProducts = async () => {
      const products = await ProductService.getAllProducts();
      socket.emit("products", products);
    };

    const addProduct = async (product) => {
      try {
        await ProductService.createProduct(product);
        await emitProducts();
      } catch (error) {
        console.error("Error al crear producto:", error);
      }
    };

    const deleteProduct = async (pid) => {
      try {
        await ProductService.deleteProduct(pid);
        await emitProducts();
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    };

    // Manejar eventos del socket relacionados con productos
    socket.on("createProduct", addProduct);
    socket.on("deleteProduct", deleteProduct);
    socket.on("addToCart", async ({ productId, userEmail, userCartID }) => {
      try {
        if (userEmail === config.ADMIN_EMAIL) {
          const errorMessage = "No se pueden agregar productos al carrito del administrador";
          socket.emit("cartNotUpdated", errorMessage);
        } else {
          await CartService.addProductByID(userCartID, productId);
          const totalQuantityInCart = await CartService.getTotalQuantityInCart(userCartID);
          socket.emit("cartUpdated", { cartId: userCartID, totalQuantityInCart });
          socket.emit("cartId", userCartID);
        }
      } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
      }
    });
    await emitProducts();

    // Manejo de chat
    socket.on("message", async (data) => {
      await messageService.saveMessage(data);
      const messages = await messageModel.find().lean();
      io.emit("messagesLogs", messages);
    });

    socket.on("userConnect", async (data) => {
      users.push({ id: socket.id, name: data });
      socket.emit(`newUser`, `Bienvenido ${data}`);
      io.emit("updateUserList", users);
      const messages = await messageModel.find().lean();
      socket.emit("messagesLogs", messages);
      socket.broadcast.emit("newUser", `${data} se ha unido al chat`);
    });

    socket.on("joinChat", () => {
      io.emit("updateUserList", users);
    });

    socket.on("disconnect", () => {
      const user = users.find((user) => user.id === socket.id);
      if (user) {
        users = users.filter((user) => user.id !== socket.id);
        io.emit("updateUserList", users);
        socket.broadcast.emit(`newUser`, `${user.name} se ha ido del chat`);
      }
    });

    await emitProducts(); // Emitir productos al conectar el socket
  });
};
