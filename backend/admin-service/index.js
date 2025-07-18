const express = require("express");
const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("Service admin-service OK");
});

app.listen(port, () => {
  console.log("Service admin-service lancé sur le port", port);
});
