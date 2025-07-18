const express = require("express");
const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("Service coach-service OK");
});

app.listen(port, () => {
  console.log("Service coach-service lancé sur le port", port);
});
