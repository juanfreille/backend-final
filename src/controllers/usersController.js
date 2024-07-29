import userService from "../services/userService.js";
import __dirname from "../utils/constantsUtil.js";
import { userModel } from "../models/userModel.js";

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
    console.log("Archivos recibidos:", uploadedFiles);

    const documentsToSave = uploadedFiles.map((file) => {
      let reference;
      if (file.fieldname === "file" && !file.mimetype.startsWith("image")) {
        // Si es un documento
        reference = `/public/documents/${uid}/${file.filename}`;
      } else if (file.fieldname === "file" && file.mimetype.startsWith("image")) {
        // Si es una imagen
        reference = `/public/img/profiles/${uid}/${file.filename}`;
      }

      return {
        name: file.originalname,
        reference: reference,
        docType: document_type,
      };
    });
    console.log("Documentos generados:", documentsToSave);

    const response = await updateUserDocumentRecords(uid, documentsToSave);
    console.log("Respuesta del servicio de actualización de documentos:", response);

    return res.status(200).send({ status: "success", ...response });
  } catch (error) {
    console.error("Error en uploadUserDocuments:", error);
    return res.status(500).send({ status: "error", message: error.message });
  }
};

const updateUserDocumentRecords = async (uid, documents) => {
  try {
    const user = await userModel.findById(uid);
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    const validDocumentTypes = ["dni", "domicilio", "cuenta", "avatar"];

    //Aca lo que me interesa es reemplazar los documentos o imagenes de perfil ya subidos, si lo hubiere, por los nuevos.
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
    await user.save();
    return { message: "Documentos actualizados correctamente" };
  } catch (error) {
    return { error: error.message };
  }
};
