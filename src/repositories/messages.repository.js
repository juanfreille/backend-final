import { messageModel } from "../models/messageModel.js";

class MessageRepository {
  async getMessages() {
    try {
      const messages = await messageModel.find();
      return messages;
    } catch (error) {
      console.error("Error al obtener los mensajes:", error);
      throw new Error("Error al obtener los mensajes");
    }
  }

  async addMessage(message) {
    try {
      return await messageModel.create(message);
    } catch (error) {
      console.error("Error al guardar el mensaje en la base de datos:", error);
      throw new Error("Error al guardar el mensaje en la base de datos");
    }
  }

  async saveMessage(messageData) {
    try {
      const message = new messageModel(messageData);
      await message.save();
    } catch (error) {
      console.error("Error al guardar el mensaje en la base de datos:", error);
      throw error;
    }
  }
}

export default MessageRepository;
