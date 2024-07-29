import multer from "multer";
import path from "path";
import fs from "fs";
import __dirname from "../utils/constantsUtil.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!req.user) {
      return cb(new Error("El usuario no está autenticado"), false);
    }

    let uploadPath = path.join(__dirname, "../../public");

    if ((file.fieldname === "file") & !file.mimetype.startsWith("image")) {
      uploadPath = path.join(uploadPath, "documents", req.user._id.toString());
    }
    if ((file.fieldname === "file") & file.mimetype.startsWith("image")) {
      uploadPath = path.join(uploadPath, "img/profiles", req.user._id.toString());
    }
    if (file.fieldname === "thumbnails") {
      uploadPath = path.join(uploadPath, "img/products");
    }

    // Crear la carpeta si no existe
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const docType = req.query.document_type;
    let fileName = file.originalname.replace(/\s/g, "");
    const fileExtension = path.extname(file.originalname);

    switch (docType) {
      case "dni":
        fileName = `Comprobante-Identificacion${fileExtension}`;
        break;
      case "domicilio":
        fileName = `Comprobante-Domicilio${fileExtension}`;
        break;
      case "cuenta":
        fileName = `Comprobante-Cuenta${fileExtension}`;
        break;
      case "avatar":
        fileName = `ProfilePic`;
        break;
      default:
        fileName = `${fileName}`;
    }

    cb(null, `${fileName}`);
  },
});

const upload = multer({ storage });

export default upload;
