const express = require("express");

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/users.route");
const app = express();
const PORT = 5000;
app.use(cors({ origin: "http://localhost:5173" }));
dotenv.config();
// middleware
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);

const URI = process.env.URI;
// const URI = ;

mongoose
  .connect(URI)
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log("Our server is running on PORT: ", PORT);
    });
  })
  .catch((err) => {
    console.log("Error:", err);
  });

app.get("/", (req, res) => {
  res.send("all students sent from the server");
});
