import { Server } from "socket.io";
import setupSockets from "./socket.setup";

export default function initSockets(io: Server) {
  setupSockets(io);
}
