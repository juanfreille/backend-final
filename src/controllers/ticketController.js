import ticketService from "../services/ticketService.js";

export const getAllTickets = async (req, res) => {
  try {
    const { limit, page, query, sort } = req.query;
    const tickets = await ticketService.getAllTickets(limit, page, query, sort);
    req.logger.info("Tickets found successfully.");
    res.send({ status: "success", payload: tickets });
  } catch (error) {
    req.logger.error("Error fetching tickets:", error.message);
    res.status(500).send({ status: "error", message: "Error fetching tickets." });
  }
};

export const getTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await ticketService.getTicketById(id);
    req.logger.info("Ticket found successfully.");
    res.send({ status: "success", payload: ticket });
  } catch (error) {
    req.logger.error("Error fetching ticket:", error.message);
    res.status(500).send({ status: "error", message: "Error fetching ticket." });
  }
};

export const getTicketsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const tickets = await ticketService.getTicketsByUserId(userId);
    req.logger.info("Tickets found successfully.");
    res.send({ status: "success", payload: tickets });
  } catch (error) {
    req.logger.error("Error fetching tickets:", error.message);
    res.status(500).send({ status: "error", message: "Error fetching tickets." });
  }
};

export const createTicket = async (req, res) => {
  const { email, amount, products } = req.body;
  try {
    const newTicket = await ticketService.createTicket({ email, amount, products });
    req.logger.info("Ticket created successfully.");
    res.status(201).send({ status: "success", payload: newTicket });
  } catch (error) {
    req.logger.error("Error creating ticket:", error.message);
    res.status(500).send({ status: "error", message: "Error creating ticket." });
  }
};
