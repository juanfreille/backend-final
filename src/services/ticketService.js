import TicketManager from "../dao/MongoDB/TickerManagerDB.js";
import TicketDTO from "../dto/ticketDTO.js";

class TicketService {
  async getAllTickets(limit, page, query, sort) {
    const tickets = await TicketManager.getAllTickets(limit, page, query, sort);
    return tickets.map((ticket) => new TicketDTO(ticket));
  }

  async getTicketById(ticketId) {
    const ticket = await TicketManager.getTicketById(ticketId);
    if (!ticket) throw new Error(`Ticket with ID ${ticketId} not found`);
    return new TicketDTO(ticket);
  }

  async getTicketsByUserId(userId) {
    const tickets = await TicketManager.getTicketsByUserId(userId);
    return tickets.map((ticket) => new TicketDTO(ticket));
  }

  async createTicket(ticketData) {
    const newTicket = await TicketManager.createTicket(ticketData);
    return new TicketDTO(newTicket);
  }
}

export default new TicketService();
