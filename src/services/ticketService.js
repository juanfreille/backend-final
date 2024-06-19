import TicketManager from "../dao/MongoDB/TickerManagerDB.js";
import TicketDTO from "../dto/ticketDTO.js";
import { userModel } from "../models/userModel.js";

class TicketService {
  constructor() {
    this.ticketManager = new TicketManager();
  }

  async getAllTickets(limit, page, query, sort) {
    const tickets = await this.ticketManager.getAllTickets(limit, page, query, sort);
    return tickets.map((ticket) => new TicketDTO(ticket));
  }

  async getTicketById(ticketId) {
    const ticket = await this.ticketManager.getTicketById(ticketId);
    if (!ticket) throw new Error(`Ticket with ID ${ticketId} not found`);
    return new TicketDTO(ticket);
  }

  async getTicketsByUserId(userId) {
    const tickets = await this.ticketManager.getTicketsByUserId(userId);
    return tickets.map((ticket) => new TicketDTO(ticket));
  }

  async createTicket(email, amount, products) {
    const user = await userModel.findOne({ email });
    if (!user) throw new Error("Comprador no encontrado");

    const code = this.generateTicketCode();
    const ticketData = {
      code,
      purchaseDateTime: new Date(),
      amount,
      purchaser: email,
      products,
    };
    const newTicket = await this.ticketManager.createTicket(ticketData);
    return new TicketDTO(newTicket);
  }
  generateTicketCode() {
    return Math.floor(Math.random() * 1000) + 1;
  }
}

export default new TicketService();
