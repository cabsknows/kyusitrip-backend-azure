import express from "express";
import cors from "cors";

import mongoose from "mongoose";
import http from 'http';
import { Server } from 'socket.io';


// ------------------------------------------------------------ //
// Modules
// ------------------------------------------------------------ //
import routesRoute from "./controllers/routesController.js";
import reportsRoute from "./controllers/reportsController.js";
import usersRoute from "./controllers/usersController.js";
import loginRoute from "./controllers/loginController.js";
import passwordResetRoute from "./controllers/passwordReset.js";
import middleware from "./utils/middleware.js";
import config from "./utils/config.js";
// ************************************************************ //

// Server Initialization
const app = express();
app.use(cors({origin: '*', credentials: true}));
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Mongodb Initialization
mongoose.set("strictQuery", false);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB database");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB: ", error);
  });

// ------------------------------------------------------------ //
// Middlewares
// ------------------------------------------------------------ //
app.use(express.json());
app.use(middleware.requestLogger);

app.use("/api/users", usersRoute);
app.use("/api/routes", routesRoute);
app.use("/api/reports", reportsRoute);
app.use("/api/login", loginRoute);
app.use("/api/password-reset", passwordResetRoute);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);
// ************************************************************ //

// Socket Setup
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`)

  socket.on("send_report", (data) => {
    console.log(data)
    socket.broadcast.emit("receive_message", data.message)
  })
})

export {app, httpServer, io};
