import { messageModel } from "./models/messageModel.js";
import ProductManager from "./dao/MongoDB/ProductManagerDB.js";
import MessageManager from "./dao/MongoDB/MessageManagerDB.js";
import CartManager from "./dao/MongoDB/CartManagerDB.js";
import config from "./config/config.js";
import { userModel } from "./models/userModel.js";
import fs from "fs";
import path from "path";
import __dirname from "./utils/constantsUtil.js";

const ProductService = new ProductManager();
const CartService = new CartManager();
const messageService = new MessageManager();

let users = [];
const getDocumentsByUserId = async (uid) => {
  try {
    const user = await userModel.findById(uid).lean();
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return user.documents || [];
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    throw error;
  }
};

export default (io) => {
  io.on("connection", async (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);

    // Manejo de productos
    const emitProducts = async () => {
      try {
        const products = await ProductService.getAllProducts();

        const productsWithOwnerNames = await Promise.all(
          products.map(async (product) => {
            if (product.owner === "admin") {
              return {
                ...product.toObject(),
                ownerName: "admin",
              };
            } else {
              const user = await userModel.findById(product.owner).lean();
              return {
                ...product.toObject(),
                ownerName: user ? user.email : "Usuario no encontrado",
              };
            }
          })
        );

        socket.emit("products", productsWithOwnerNames);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    const addProduct = async (product) => {
      try {
        await emitProducts();
      } catch (error) {
        console.error("Error al crear producto:", error);
      }
    };

    const deleteProduct = async (pid, userRole, userId) => {
      try {
        const product = await ProductService.getProductByID(pid);
        if (userRole === "admin" || product.owner === userId) {
          await ProductService.deleteProduct(pid);
          if (product.thumbnails && product.thumbnails.length > 0) {
            const imagePath = path.join(__dirname, "../../public/img/products", product.thumbnails[0]);
            deleteImage(imagePath);
          } else {
            console.log("No se encontraron imágenes para eliminar.");
          }

          await emitProducts();
        } else {
          console.log("error", "No tienes permiso para eliminar este producto");
        }
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    };

    function deleteImage(imagePath) {
      if (imagePath) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Error al eliminar la imagen: ${err.message}`);
          } else {
            console.log(`Imagen eliminada correctamente: ${imagePath}`);
          }
        });
      } else {
        console.log("Ruta de imagen no proporcionada.");
      }
    }

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

    socket.on("documentUploadSuccess", async ({ userId, documentType }) => {
      const documents = await getDocumentsByUserId(userId);
      io.emit("documentsUpdated", { userId, documents });
    });

    socket.on("disconnect", () => {
      const user = users.find((user) => user.id === socket.id);
      if (user) {
        users = users.filter((user) => user.id !== socket.id);
        io.emit("updateUserList", users);
        socket.broadcast.emit(`newUser`, `${user.name} se ha ido del chat`);
      }
    });

    await emitProducts();
  });
};
