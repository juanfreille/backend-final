import MessageRepository from "../../repositories/messages.repository.js";

class MessageManager {
  constructor() {
    this.messageRepository = new MessageRepository();
  }

  async getMessages() {
    return await this.messageRepository.getMessages();
  }

  async addMessage(message) {
    return await this.messageRepository.addMessage(message);
  }
}

export default MessageManager;
