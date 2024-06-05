import ticketDao from "../dao/MongoDB/TickerManagerDB.js";

class TicketService {
  async getAllTickets(limit, page, query, sort) {
    const options = { page: page ?? 1, limit: limit ?? 100, sort, lean: true };
    return await ticketDao.getAllTickets(query ?? {}, options);
  }

  async getTicketById(tid) {
    return await ticketDao.getTicketById(tid);
  }

  async getTicketsByUserId(userId) {
    return await ticketDao.getTicketsByUserId(userId);
  }

  async createTicket(ticket) {
    return await ticketDao.createTicket(ticket);
  }
}

const ticketService = new TicketService();
export default ticketService;
