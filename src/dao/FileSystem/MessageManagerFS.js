import path from "path";
import __dirname from "../../utils/constantsUtil.js";
import { readFromFile, writeToFile } from "../../utils/fileManager.js";
import { ObjectId } from "mongodb";

export default class messageManager {
  constructor() {
    this.file = path.join(__dirname, "../../data/messages.json");
  }

  getMessages = async () => {
    try {
      const messages = await readFromFile(this.file);
      return JSON.parse(messages);
    } catch (error) {
      console.error("No hay mensajes para leer", error.message);
      return [];
    }
  };

  saveMessage = async (message) => {
    try {
      const messages = await this.getMessages();
      message._id = new ObjectId();
      messages.push(message);
      await writeToFile(this.file, messages);
    } catch (error) {
      console.error("No se pudo entregar el mensaje", error.message);
      return error;
    }
  };
}
