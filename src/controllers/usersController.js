import __dirname from "../utils/constantsUtil.js";
import { cartService } from "../services/index.js";
import { userService } from "../services/index.js";
import nodemailer from "nodemailer";
import config from "../config/config.js";
// import fs from "fs";
import path from "path";
import { promises as fs } from "fs";

//Funciones auxiliares
const updateUserDocumentRecords = async (uid, documents, avatar) => {
  try {
    const user = await userService.getUserById(uid);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    let update = {};

    if (documents) {
      const validDocumentTypes = ["dni", "domicilio", "cuenta"];
      for (const doc of documents) {
        if (validDocumentTypes.includes(doc.docType)) {
          const existingDocumentIndex = user.documents.findIndex((existingDoc) => existingDoc.docType === doc.docType);

          if (existingDocumentIndex !== -1) {
            user.documents[existingDocumentIndex] = doc;
          } else {
            user.documents.push(doc);
          }
        } else {
          throw new Error(`Tipo de documento inválido: ${doc.docType}`);
        }
      }
      update.documents = user.documents;
    }

    if (avatar) {
      update.avatar = avatar;
    }
    await userService.updateUser(uid, update);
    return { message: "Documentos actualizados correctamente" };
  } catch (error) {
    return { error: error.message };
  }
};

const getTransport = () => {
  return nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASSWORD,
    },
  });
};

const sendEmail = async (transport, email, message) => {
  try {
    await transport.sendMail({
      from: `JIF Style Store <${config.EMAIL_USER}>`,
      to: email,
      subject: "AVISO - Eliminación de cuenta",
      text: message,
    });
  } catch (error) {
    throw new Error(`Error al enviar correo a ${email}: ${error.message}`);
  }
};

const deleteUserCart = async (cartId) => {
  try {
    await cartService.deleteCart(cartId);
  } catch (error) {
    throw new Error(`Error al eliminar carrito con ID ${cartId}: ${error.message}`);
  }
};

const deleteDirectory = async (dirPath) => {
  try {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      const currentPath = path.join(dirPath, file);
      const stat = await fs.stat(currentPath);
      if (stat.isDirectory()) {
        // Recursivamente eliminar subcarpetas
        await deleteDirectory(currentPath);
      } else {
        // Eliminar archivos
        await fs.unlink(currentPath);
      }
    }
    // Finalmente eliminar la carpeta vacía
    await fs.rmdir(dirPath);
  } catch (err) {
    console.error(`Error al eliminar la carpeta: ${err.message}`);
  }
};

//Funciones de Controller
export const getUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  req.logger.info(`Usuarios obtenidos: ${users.length}`);
  res.status(200).send({ status: "success", users: users });
};

export const premiumController = async (req, res) => {
  const { uid } = req.params;
  req.logger.info(`Solicitud para cambiar el rol del usuario: ${uid}`);

  try {
    // Obtiene el usuario por su ID
    const user = await userService.getUserById(uid);

    // Verifica si el rol del usuario que hace la solicitud es 'admin'
    if (req.user.role === "admin") {
      switch (user.role) {
        case "user":
          user.role = "premium";
          break;
        case "premium":
          user.role = "user";
          break;
      }
      // Actualiza el usuario en la base de datos
      const updateUser = await userService.updateUser(uid, user);
      req.logger.info(`Usuario actualizado a rol: ${user.role}`);
      res.status(200).send({ status: "success", user: user });
      return;
    }

    const necessaryDocuments = ["dni", "domicilio", "cuenta"];
    const missingDocuments = necessaryDocuments.filter((doc) => !user.documents.some((document) => document.docType === doc));

    if (missingDocuments.length === 0) {
      // Cambia el rol del usuario entre 'user' y 'premium'
      switch (user.role) {
        case "user":
          user.role = "premium";
          break;
        case "premium":
          user.role = "user";
          break;
      }
      const updateUser = await userService.updateUser(uid, user);
      req.logger.info(`Usuario actualizado a rol: ${user.role}`);
      res.status(200).send({ status: "success", user: user });
    } else {
      req.logger.error("Faltan documentos requeridos: " + missingDocuments.join(", "));
      res.status(400).send({ status: "error", message: "Faltan documentos requeridos", missingDocuments });
    }
  } catch (error) {
    req.logger.error(`Error al cambiar el rol del usuario ${uid}: ${error.message}`);
    res.status(500).send({ status: "error", message: "Error al cambiar el rol del usuario" });
  }
};

export const uploadUserDocuments = async (req, res) => {
  try {
    req.logger.info(`Inicio del proceso de carga de documentos del usuario`);
    const { uid } = req.params;
    const { document_type } = req.query;
    const uploadedFiles = req.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).send({ status: "error", message: "No se recibieron archivos." });
    }

    const documentsToSave = [];
    let avatarToSave = null;
    uploadedFiles.forEach((file) => {
      let reference;
      if (file.fieldname === "file") {
        if (file.mimetype.startsWith("image")) {
          // Si es una imagen y no hay avatar aún, es el avatar
          if (!avatarToSave) {
            reference = `/public/img/profiles/${uid}/${file.filename}`;
            avatarToSave = {
              name: file.filename,
              reference: reference,
            };
          }
        } else {
          // Si es un documento
          reference = `/public/documents/${uid}/${file.filename}`;
          documentsToSave.push({
            name: file.filename,
            reference: reference,
            docType: document_type,
          });
        }
      }
    });

    const response = await updateUserDocumentRecords(uid, documentsToSave, avatarToSave);
    return res.status(200).send({ status: "success", ...response });
  } catch (error) {
    req.logger.error("Error en uploadUserDocuments:", error.message);
    return res.status(500).send({ status: "error", message: error.message });
  }
};

export const deleteUsers = async (req, res) => {
  const { logger } = req;
  try {
    const inactiveDateLimit = new Date();
    inactiveDateLimit.setDate(inactiveDateLimit.getDate() - 2);
    logger.info(`Fecha y hora de hace dos días: ${inactiveDateLimit}`);

    const usersToDelete = await userService.getAllUsers({ last_connection: { $lt: inactiveDateLimit } });
    logger.info(`Usuarios a eliminar: ${usersToDelete.length}`);

    const transport = getTransport();

    for (const user of usersToDelete) {
      const message = `Hola ${user.first_name}, tu cuenta ha sido eliminada debido a inactividad.`;

      if (user.email) {
        await sendEmail(transport, user.email, message);
        logger.info(`Correo enviado a: ${user.email}`);
      } else {
        logger.warning(`No se pudo enviar correo al usuario ya que no posee dirección de correo electrónico.`);
      }

      if (user.cart && user.cart[0]) {
        await deleteUserCart(user.cart[0]._id);
        logger.info(`Carrito eliminado para el usuario: ${user._id}`);
      }
    }

    await userService.deleteUsers({ _id: { $in: usersToDelete.map((user) => user._id) } });
    logger.info(`Usuarios eliminados correctamente. Total eliminados: ${usersToDelete.length}`);
    res.json({ message: "Usuarios eliminados correctamente" });
  } catch (error) {
    logger.error(`Error al eliminar usuarios: ${error.message}`);
    res.status(500).json({ message: "Hubo un error al eliminar los usuarios" });
  }
};

export const deleteUser = async (req, res) => {
  const { uid } = req.params;
  try {
    const userToDelete = await userService.getUserById(uid);

    if (!userToDelete) {
      req.logger.warning(`El usuario con ID ${uid} no existe.`);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const transporter = getTransport();
    const message = `Hola ${userToDelete.first_name}, tu cuenta ha sido eliminada por el administrador.`;

    if (userToDelete.email) {
      await sendEmail(transporter, userToDelete.email, message);
      req.logger.info(`Correo enviado a: ${userToDelete.email}`);
    } else {
      req.logger.warning(
        `No se pudo enviar correo a ${userToDelete.first_name} (${userToDelete._id}) porque no tiene una dirección de correo electrónico.`
      );
    }

    if (userToDelete.cart) {
      await deleteUserCart(userToDelete.cart._id);
      req.logger.info(`Carrito eliminado para el usuario: ${userToDelete._id}`);
    } else {
      req.logger.warning(`El usuario ${userToDelete._id} no tiene un carrito asociado.`);
    }

    // Eliminar la imagen de perfil si existe
    if (userToDelete.avatar) {
      const avatarDir = path.join(__dirname, `../../public/img/profiles/${uid}`);
      await deleteDirectory(avatarDir);
    } else {
      req.logger.info(`El usuario con ID ${uid} no tiene una imagen de perfil para eliminar.`);
    }

    await userService.deleteUserById(uid);
    req.logger.info(`Usuario con ID ${uid} eliminado correctamente.`);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    req.logger.error(`Error al eliminar usuario: ${error.message}`);
    res.status(500).json({ message: "Hubo un error al eliminar el usuario" });
  }
};
