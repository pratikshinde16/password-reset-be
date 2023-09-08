const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(express.json());
app.use(cors());
require("dotenv").config();
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const passwordResetRoutes = require("./routes/passwordReset");
const sendmail = require("./utils/sendEmail");

const port = Number(process.env.PORT) || 3001;

app.listen(port, () => console.log(`server is running on port ${port}`));

app.use(bodyParser.json());

// Database Connection
connection();

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/sendmail", sendmail);
