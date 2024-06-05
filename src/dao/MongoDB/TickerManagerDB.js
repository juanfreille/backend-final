import ticketModel from "../../models/ticketModel.js";

class TicketManager {
  async getAllTickets() {
    try {
      const tickets = await ticketModel.find().populate("purchaser").populate("products.product").lean();
      return tickets;
    } catch (error) {
      throw error;
    }
  }

  async getTicketById(ticketId) {
    return await ticketModel.findOne({ _id: ticketId });
  }

  async getTicketsByUserId(userId) {
    try {
      const tickets = await ticketModel.find({ userId: userId });
      return tickets;
    } catch (error) {
      throw error;
    }
  }

  async createTicket(ticket) {
    try {
      const newTicket = await ticketModel.create(ticket);
      return newTicket;
    } catch (error) {
      throw error;
    }
  }
}

const ticketDao = new TicketManager();
export default ticketDao;
