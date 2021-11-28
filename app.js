require("dotenv").config();
const express = require("express");
const app = express();
const { PORT } = process.env;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// socket.io
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const { socketController } = require("./controller/socketio_controller");
socketController(io);

app.use("/api", [
  require("./router/pets"),
  require("./router/breedData"),
  require("./router/user"),
  require("./router/chat"),
  require("./router/match"),
  require("./router/adopt"),
]);

// 404
app.use((req, res, next) => {
  res.status(404).sendFile(__dirname + "/public/404.html");
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Internal Server Error");
});

server.listen(PORT, () => {
  console.log("server running");
});

module.exports = { server, app };
