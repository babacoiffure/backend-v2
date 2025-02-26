import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./database";
import { serverConfigs, serverENV } from "./env-config";

import morgan from "morgan";
import path from "path";
import { errorMiddleware, handleNotFound } from "./middleware/error";
import rootRouter from "./router/http-router";
import { wsManager } from "./router/socket-manager";

export const server = express();
const httpServer = createServer(server);
export const socketServer = new Server(httpServer, serverConfigs.socket);

// middleware
server.use(
    cors(serverConfigs.cors),
    express.json(),
    express.urlencoded({ extended: true }),
    cookieParser(),
    morgan("dev")
);

// initializing router
server.use(rootRouter);
// Serve static files from the Vite build output
server.use(express.static(path.join(__dirname, "..", "public")));

// For all other routes, serve index.html (to support client-side routing)
server.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});
server.use(handleNotFound, errorMiddleware);

// initializing socket events
wsManager.initialize(socketServer);

async function startServer() {
    try {
        await connectDB();
        httpServer.listen(serverENV.PORT, () => {
            console.log(
                `⚡ Server ::  running on PORT:${serverENV.PORT} in ${serverENV.NODE_ENV} mode`
            );
        });
    } catch (error) {}
}
startServer();
