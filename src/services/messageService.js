import MessageManager from "../dao/MongoDB/MessageManagerDB.js";

class MessageService {
  constructor() {
    this.messageManager = new MessageManager();
  }

  async getMessages() {
    try {
      return await this.messageManager.getMessages();
    } catch (error) {
      console.error("Error al obtener los mensajes:", error);
      throw new Error("Error al obtener los mensajes");
    }
  }

  async addMessage(message) {
    try {
      return await this.messageManager.addMessage(message);
    } catch (error) {
      console.error("Error al agregar el mensaje:", error);
      throw new Error("Error al agregar el mensaje");
    }
  }
}

export default MessageService;
