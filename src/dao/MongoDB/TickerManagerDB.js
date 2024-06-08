import ticketModel from "../../models/ticketModel.js";

class TicketManager {
  async getAllTickets() {
    return await ticketModel.find().populate("purchaser").populate("products.product").lean();
  }

  async getTicketById(ticketId) {
    return await ticketModel.findById(ticketId).lean();
  }

  async getTicketsByUserId(userId) {
    return await ticketModel.find({ userId: userId }).lean();
  }

  async createTicket(ticket) {
    return await ticketModel.create(ticket);
  }
}

export default new TicketManager();
