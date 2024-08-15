export default class MessagesRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getMessages() {
    try {
      return await this.dao.getMessages();
    } catch (error) {
      console.error("Error al obtener los mensajes:", error);
      throw new Error("Error al obtener los mensajes");
    }
  }

  async saveMessage(messageData) {
    try {
      return await this.dao.saveMessage(messageData);
    } catch (error) {
      console.error("Error al guardar el mensaje en la base de datos:", error);
      throw new Error("Error al agregar el mensaje");
    }
  }
}
