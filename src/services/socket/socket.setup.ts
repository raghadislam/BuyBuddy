import { Server } from "socket.io";
import { socketAuth } from "../../middlewares/socketAuth.middleware";
import connectionGateway from "./connection.gateway";

export default function setupSockets(io: Server) {
  // run authentication for every incoming connection
  io.use(socketAuth);

  // register connection handler
  io.on("connection", (socket) => connectionGateway(io, socket));
}
