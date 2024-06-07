import ticketRepository from "../repositories/tickets.repository.js";

class TicketController {
  async getAllTickets(req, res) {
    const { limit, page, query, sort } = req.query;
    try {
      const result = await ticketRepository.getAllTickets(limit, page, query, sort);
      res.status(200).send({ status: "success", payload: result });
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ status: "error", message: "Error fetching tickets" });
    }
  }

  async getTicketById(req, res) {
    const { tid } = req.params;
    try {
      const result = await ticketRepository.getTicketById(tid);
      if (!result) throw new Error(`Ticket with ID ${tid} does not exist!`);
      res.status(200).send({ status: "success", payload: result });
    } catch (error) {
      console.error(error.message);
      res.status(400).send({ status: "error", message: error.message });
    }
  }

  async createTicket(req, res) {
    try {
      const { cart, amount, purchaser } = req.body;
      const ticketData = { cart, amount, purchaser };
      const newTicket = await ticketRepository.createTicket(ticketData);
      res.status(201).send({ status: "success", payload: newTicket });
    } catch (error) {
      console.error(error.message);
      res.status(400).send({ status: "error", message: error.message });
    }
  }
}

export default TicketController;
