import { productService } from "./services/index.js";
import { messageService } from "./services/index.js";
import { cartService } from "./services/index.js";
import { userService } from "./services/index.js";
import config from "./config/config.js";

let users = [];
const getDocumentsByUserId = async (uid) => {
  try {
    const user = await userService.getUserById(uid);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return user.documents || [];
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    throw error;
  }
};

const getMessagesWithAvatars = async (messages) => {
  try {
    const usersDB = await userService.getAllUsers({});
    const userMap = usersDB.reduce((map, user) => {
      map[user.email] = user;
      return map;
    }, {});

    const adminAvatar = "../../img/coder.avif";
    const defaultAvatar = "../../img/profiles/defaultProfilePic.jpg";

    return messages.map((message) => {
      const doc = message._doc || message;
      const userEmail = doc.user;

      // Seleccionar el avatar basado en el usuario
      const avatar =
        userEmail === "adminCoder@coder.com"
          ? adminAvatar
          : userMap[userEmail]?.avatar
          ? `../../img/profiles/${userMap[userEmail]._id}/ProfilePic`
          : defaultAvatar;

      return { ...doc, avatar };
    });
  } catch (error) {
    console.error("Error al obtener avatares de mensajes:", error);
    throw error;
  }
};

export default (io) => {
  io.on("connection", async (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);

    const emitUsers = async () => {
      try {
        const users = await userService.getAllUsers({});
        socket.emit("users", users);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    // Manejo de productos
    const emitProducts = async () => {
      try {
        const products = await productService.getAllProducts();
        const productsWithOwnerNames = await Promise.all(
          products.map(async (product) => {
            // Verifica si el producto tiene el método `toObject`
            const isMongoDBProduct = typeof product.toObject === "function";
            if (isMongoDBProduct) {
              product = product.toObject();
            }

            if (product.owner === "admin") {
              return {
                ...product,
                ownerName: "admin",
              };
            } else {
              const user = await userService.getUserById(product.owner);
              return {
                ...product,
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

    // Manejar eventos del socket relacionados con productos
    socket.on("createProduct", addProduct);
    // socket.on("deleteProduct", deleteProduct);
    socket.on("addToCart", async ({ productId, userEmail, userCartID }) => {
      try {
        if (userEmail === config.ADMIN_EMAIL) {
          const errorMessage = "No se pueden agregar productos al carrito del administrador";
          socket.emit("cartNotUpdated", errorMessage);
        } else {
          await cartService.addProductByID(userCartID, productId);
          const totalQuantityInCart = await cartService.getTotalQuantityInCart(userCartID);
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
      try {
        await messageService.saveMessage(data);
        const messages = await messageService.getMessages();
        const messagesWithAvatars = await getMessagesWithAvatars(messages);
        io.emit("messagesLogs", messagesWithAvatars);
      } catch (error) {
        console.error("Error al manejar el mensaje:", error);
      }
    });
    socket.on("userConnect", async (data) => {
      users.push({ id: socket.id, name: data });
      socket.emit(`newUser`, `Bienvenido ${data}`);
      io.emit("updateUserList", users);

      try {
        const messages = await messageService.getMessages();
        const messagesWithAvatars = await getMessagesWithAvatars(messages);
        io.emit("messagesLogs", messagesWithAvatars);
        socket.broadcast.emit("newUser", `${data} se ha unido al chat`);
      } catch (error) {
        console.error("Error al manejar la conexión del usuario:", error);
      }

      socket.broadcast.emit("newUser", `${data} se ha unido al chat`);
    });

    socket.on("joinChat", () => {
      io.emit("updateUserList", users);
    });

    socket.on("documentUploadSuccess", async ({ userId, documentType }) => {
      const documents = await getDocumentsByUserId(userId);
      io.emit("documentsUpdated", { userId, documents });
    });

    socket.on("getUsers", (callback) => {
      userService
        .getAllUsers({})
        .then((users) => callback(users))
        .catch((error) => console.error(error));
    });

    socket.on("updateUserRole", async (userId) => {
      try {
        const user = await userService.getUserById(userId);
        if (user) {
          const newRole = user.role === "premium" ? "user" : "premium";
          const result = await userService.updateUser(userId, { role: newRole });
          if (result.nModified === 0) {
            console.log("No se realizaron cambios en el rol del usuario.");
          } else {
            console.log("Rol del usuario actualizado exitosamente.");
            io.emit("userRoleUpdated", user);
            await emitUsers();
          }
        }
      } catch (error) {
        console.error("Error al actualizar rol de usuario:", error);
      }
    });

    socket.on("disconnect", () => {
      users = users.filter((user) => user.id !== socket.id);
      io.emit("updateUserList", users);
    });

    await emitUsers();

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
