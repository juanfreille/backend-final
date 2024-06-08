import TicketRepository from "../repositories/ticketRepository.js";

class TicketController {
  async getAllTickets(req, res) {
    try {
      const { limit, page, query, sort } = req.query;
      const tickets = await TicketRepository.getAllTickets(limit, page, query, sort);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const ticket = await TicketRepository.getTicketById(id);
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTicketsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const tickets = await TicketRepository.getTicketsByUserId(userId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createTicket(req, res) {
    try {
      const { email, amount, products } = req.body;
      const newTicket = await TicketRepository.createTicket(email, amount, products);
      res.status(201).json(newTicket);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new TicketController();
