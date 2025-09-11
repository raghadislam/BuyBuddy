import { Server } from "socket.io";
import { socketAuth } from "../../middlewares/socketAuth.middleware";
import connectionGateway from "./connection.gateway";
import { EVENTS } from "./socket.event";

export default function setupSockets(io: Server) {
  // run authentication for every incoming connection
  io.use(socketAuth);

  // register connection handler
  io.on(EVENTS.CONNECTION, (socket) => connectionGateway(io, socket));
}
