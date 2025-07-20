require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const superAdmRoutes = require('./routes/superAdminRoutes');
const cookieParser = require("cookie-parser");

const app = express();

app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true // must match!
}));

app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/super-admin', superAdmRoutes);

app.listen(3000, ()=>{
	console.log("Server Listening On Port 3000")
})
