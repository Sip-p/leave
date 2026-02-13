import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";    
import authRoutes from "./routes/authRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("  Server is running successfully!");
});

// Start Server
app.listen(process.env.PORT || 3000, () => {
  console.log(`  Server running on port ${process.env.PORT || 3000}`);
});
