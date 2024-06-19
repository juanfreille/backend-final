import { TicketRepository } from "../../repositories/tickets.repository.js";

class TicketManager {
  constructor() {
    this.ticketRepository = new TicketRepository();
  }

  async getAllTickets(limit, page, query, sort) {
    return await this.ticketRepository.getAllTickets(limit, page, query, sort);
  }

  async getTicketById(ticketId) {
    return await this.ticketRepository.getTicketById(ticketId);
  }

  async getTicketsByUserId(userId) {
    return await this.ticketRepository.getTicketsByUserId(userId);
  }

  async createTicket(ticketData) {
    return await this.ticketRepository.createTicket(ticketData);
  }
}

export default TicketManager;
