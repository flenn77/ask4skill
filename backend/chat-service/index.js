const express = require("express");
const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("Service chat-service OK");
});

app.listen(port, () => {
  console.log("Service chat-service lancé sur le port", port);
});
