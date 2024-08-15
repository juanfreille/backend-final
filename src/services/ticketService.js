import TicketDTO from "../dto/ticketDTO.js";
import { userModel } from "../models/userModel.js";

export default class TicketsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async getAllTickets(limit, page, query, sort) {
    const tickets = await this.dao.getAllTickets(limit, page, query, sort);
    return tickets;
  }

  async getTicketById(ticketId) {
    const ticket = await this.dao.getTicketById(ticketId);
    return ticket;
  }

  async getTicketsByUserId(userId) {
    const tickets = await this.dao.getTicketsByUserId(userId);
    return tickets.map((ticket) => new TicketDTO(ticket));
  }

  async createTicket(email, amount, products) {
    const result = await this.dao.createTicket(email, amount, products);
    return result;
  }
  generateTicketCode() {
    return Math.floor(Math.random() * 1000) + 1;
  }
}
