import { messageModel } from "../../models/messageModel.js";

export default class MessageManager {
  async getMessages() {
    try {
      const messages = await messageModel.find();
      return messages;
    } catch (error) {
      console.error("Error al obtener los mensajes:", error);
      throw new Error("Error al obtener los mensajes");
    }
  }

  async saveMessage(message) {
    try {
      return await messageModel.create(message);
    } catch (error) {
      console.error("Error al guardar el mensaje en la base de datos:", error);
      throw new Error("Error al guardar el mensaje en la base de datos");
    }
  }
}
