import path from "path";
import __dirname from "../../utils/constantsUtil.js";
import { readFromFile, writeToFile } from "../../utils/fileManager.js";
import { ObjectId } from "mongodb";

export default class TicketManager {
  constructor() {
    this.file = path.join(__dirname, "../../data/tickets.json");
  }

  getAllTickets = async () => {
    try {
      const fileContent = await readFromFile(this.file);
      const tickets = JSON.parse(fileContent);
      return tickets;
    } catch (error) {
      if (error.code === "ENOENT") {
        await writeToFile(this.file, []);
        return [];
      } else {
        console.error("Error al obtener los tickets:", error.message);
        throw error;
      }
    }
  };

  getTicketById = async (ticketId) => {
    try {
      const tickets = await this.getAllTickets();
      return tickets.find((ticket) => ticket._id.toString() === ticketId) || null;
    } catch (error) {
      console.error("Ticket inexistente", error.message);
      throw error;
    }
  };

  createTicket = async (email, amount, products) => {
    try {
      const tickets = await this.getAllTickets();
      const code = this.generateTicketCode();

      const newTicket = {
        _id: new ObjectId(),
        code,
        purchaseDateTime: new Date(),
        amount,
        purchaser: email,
        products,
      };
      tickets.push(newTicket);
      await writeToFile(this.file, tickets);
      return newTicket;
    } catch (error) {
      console.error("Error al generar el ticket", error.message);
      throw error;
    }
  };

  generateTicketCode() {
    return Math.floor(Math.random() * 1000) + 1;
  }
}
