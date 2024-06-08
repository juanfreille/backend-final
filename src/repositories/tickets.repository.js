import TicketService from "../services/ticketService.js";
import { userModel } from "../models/userModel.js";

class TicketRepository {
  async getAllTickets(limit, page, query, sort) {
    return await TicketService.getAllTickets(limit, page, query, sort);
  }

  async getTicketById(ticketId) {
    return await TicketService.getTicketById(ticketId);
  }

  async getTicketsByUserId(userId) {
    return await TicketService.getTicketsByUserId(userId);
  }

  async createTicket(email, amount, products) {
    const user = await userModel.findOne({ email });
    if (!user) throw new Error("Purchaser not found");

    const code = this.generateTicketCode();
    const ticketData = {
      code,
      purchaseDateTime: new Date(),
      amount,
      purchaser: email,
      products,
    };

    return await TicketService.createTicket(ticketData);
  }

  generateTicketCode() {
    return Math.floor(Math.random() * 1000) + 1;
  }
}

export default new TicketRepository();
