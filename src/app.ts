import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";

import { Server } from "socket.io";

import { router } from "./routes";



const app = express();

// cors "permite ou barra as requisições"
app.use(cors())

const serverHttp = http.createServer(app);

const io = new Server(serverHttp, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log(`Usuário conectado no socket ${socket.id}`)
});

app.use(express.json());

app.use(router);

// Quando solicitar essa URL
app.get("/github", (request, response) => {
  response.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
  );
})

// Quando autorizar mando os dados para essa rota de callback
app.get("/signin/callback", (request, response) => {
  const { code } = request.query;

  //Retorno os dados
  return response.json(code);
})

export { serverHttp, io }