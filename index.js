require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet"); // For security enhancements
const app = express();
const port = process.env.PORT || 8000;
const path = require("path");

// Import routers
const categoryRouter = require("./routes/categoryRouter");
const newsRouter = require("./routes/newsRouter");
const userRouter = require("./routes/userRouter");
const commentsRouter = require("./routes/commentsRouter");

//INFORMATION ROUTES

// Import and initialize database connection
const connection = require("./db.js");
connection();

// Middleware

app.use(express.json()); // Built-in JSON parser
app.use(cors());
app.use(morgan("tiny"));
app.use(helmet()); // Security middleware
app.use(express.static(path.join(__dirname, "public")));
// API Routes
app.use("/api/categories", categoryRouter);
app.use("/api/News", newsRouter);
app.use("/api/Users", userRouter);
app.use("/api/Comments", commentsRouter);
// API Routes Ends
// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ status: "fail", message: "Route not found" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({ status: "error", message: "Something went wrong" });
});

// Start the server
app.listen(port, () => {
  console.log("Listening on port:", port);
});
