import ticketDTO from "../dto/ticketDTO.js";
import ticketService from "../services/ticketService.js";
import { userModel } from "../models/userModel.js";

class TicketRepository {
  async getAllTickets(limit, page, query, sort) {
    try {
      return await ticketService.getAllTickets(limit, page, query, sort);
    } catch (error) {
      console.error(error.message);
      throw new Error("Error fetching tickets from repository");
    }
  }

  async getTicketById(tid) {
    try {
      const result = await ticketService.getTicketById(tid);
      if (!result) throw new Error(`Ticket with ID ${tid} does not exist!`);
      return result;
    } catch (error) {
      console.error(error.message);
      throw new Error("Error fetching ticket from repository");
    }
  }

  async createTicket(email, amount) {
    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        throw new Error("Purchaser not found");
      }

      const code = await this.generateTicketCode();
      const newTicketDTO = new ticketDTO({
        code,
        purchaseDateTime: new Date(),
        amount,
        purchaser: user._id,
      });

      return await ticketService.createTicket(newTicketDTO);
    } catch (error) {
      console.error(error.message);
      throw new Error("Error creating ticket in repository");
    }
  }

  async generateTicketCode() {
    try {
      const randomCode = Math.floor(Math.random() * 1000) + 1;
      return randomCode;
    } catch (error) {
      console.error(error.message);
      throw new Error("Error generating random code");
    }
  }
}

export default new TicketRepository();
