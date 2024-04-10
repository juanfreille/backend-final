import { messageModel } from "../dao/models/messageModel.js";

export const messageService = {
  async getAllMessages() {
    try {
      const messages = await messageModel.find();
      return messages;
    } catch (error) {
      console.error("Error al obtener los mensajes:", error);
      throw error;
    }
  },

  async saveMessage(messageData) {
    try {
      const message = new messageModel(messageData);
      await message.save();
    } catch (error) {
      console.error("Error al guardar el mensaje en la base de datos:", error);
      throw error;
    }
  },
};
