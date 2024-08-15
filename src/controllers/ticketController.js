import { ticketService } from "../services/index.js";

export const getAllTickets = async (req, res) => {
  try {
    const { limit, page, query, sort } = req.query;
    const tickets = await ticketService.getAllTickets(limit, page, query, sort);
    req.logger.info("Tickets encontrados.");
    res.send({ status: "success", payload: tickets });
  } catch (error) {
    req.logger.error("Error obteniendo los tickets:", error.message);
    res.status(500).send({ status: "error", message: "Error obteniendo los tickets" });
  }
};

export const getTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await ticketService.getTicketById(id);
    req.logger.info("Ticket encontrado.");
    res.send({ status: "success", payload: ticket });
  } catch (error) {
    req.logger.error("Error obteniendo el ticket:", error.message);
    res.status(500).send({ status: "error", message: "Error obteniendo el ticket." });
  }
};

export const getTicketsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const tickets = await ticketService.getTicketsByUserId(userId);
    req.logger.info("Tickets encontrados.");
    res.send({ status: "success", payload: tickets });
  } catch (error) {
    req.logger.error("Error obteniendo los tickets:", error.message);
    res.status(500).send({ status: "error", message: "Error obteniendo los tickets." });
  }
};

export const createTicket = async (req, res) => {
  const { email, amount, products } = req.body;
  try {
    const newTicket = await ticketService.createTicket({ email, amount, products });
    req.logger.info("Ticket creado.");
    res.status(201).send({ status: "success", payload: newTicket });
  } catch (error) {
    req.logger.error("Error al crear el ticket:", error.message);
    res.status(500).send({ status: "error", message: "Error al crear el ticket." });
  }
};
