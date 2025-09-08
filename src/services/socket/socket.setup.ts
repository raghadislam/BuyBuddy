import { Server } from "socket.io";
import { socketAuth } from "../../middlewares/socketAuth.middleware";
import connectionHandler from "./connection.handler";

export default function setupSockets(io: Server) {
  // run authentication for every incoming connection
  io.use(socketAuth);

  // register connection handler
  io.on("connection", (socket) => connectionHandler(io, socket));
}
