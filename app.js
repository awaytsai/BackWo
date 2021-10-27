require("dotenv").config();
const express = require("express");
const app = express();
const { PORT } = process.env;

// socket.io
const http = require("http");
const server = http.createServer(app);
// const io = require("socket.io")(server);
// const { socketController } = require("./socketio_controller");
// socketController(io);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use("/api", [
  require("./Router/findowners"),
  require("./Router/findpets"),
  require("./Router/getData"),
  require("./Router/user"),
]);

// page not found 404
app.use((req, res, next) => {
  res.status(404).send("Page not exist");
  //   res.status(404).sendFile(__dirname + "/public/404.html");
});

// error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Internal Server Error");
});

server.listen(PORT, () => {
  console.log("server running");
});

module.exports = server;
