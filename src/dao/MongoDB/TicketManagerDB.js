import { ticketModel } from "../../models/ticketModel.js";
import TicketDTO from "../../dto/ticketDTO.js";
import { userModel } from "../../models/userModel.js";

export default class TicketRepository {
  async getAllTickets(limit, page, query, sort) {
    return await ticketModel
      .find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sort)
      .populate("purchaser")
      .populate("products._id")
      .lean();
  }

  async getTicketById(ticketId) {
    return await ticketModel.findById(ticketId).populate("purchaser").populate("products._id").lean();
  }

  async getTicketsByUserId(userId) {
    return await ticketModel.find({ purchaser: userId }).populate("purchaser").populate("products._id").lean();
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
    const newTicket = await ticketModel.create(ticketData);
    return new TicketDTO(newTicket);
  }
  generateTicketCode() {
    return Math.floor(Math.random() * 1000) + 1;
  }
}
