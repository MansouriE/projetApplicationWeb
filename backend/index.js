require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const articleRoutes = require("./routes/articleRoutes");
const bidRoutes = require("./routes/bidRoutes");
const favoriRoutes = require("./routes/favoriRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ["http://localhost:5173", "https://projet-application-web.vercel.app"],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", articleRoutes);
app.use("/api", bidRoutes);
app.use("/api", favoriRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
