require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const authRoutes = require('./routes/authRoutes');
const moderatorRoutes = require('./routes/moderatorRoutes');
const classesRoutes = require('./routes/classesRoutes');
const studentsRoutes = require('./routes/studentsRoutes');

const app = express();

// 👇 Your normal middlewares
app.use((req, res, next) => {
  const ua = req.get('User-Agent') || '';
  if (/curl|wget|python|postman/i.test(ua.toLowerCase())) {
    return res.status(404).send('Not Found');
  }
  next();
});

app.use((req, res, next) => {
  const origin = req.get('Origin') || '';
  if (!origin.includes('localhost:5173')) {
    return res.status(403).send('Forbidden');
  }
  next();
});

app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());

// 👇 Your custom routes
app.use('/auth', authRoutes);
app.use('/moderator',moderatorRoutes);
app.use('/students',studentsRoutes);
app.use('/classes',classesRoutes);
app.listen(3000,()=>{
  console.log("Server Running On Port 3000")
})
module.exports = app;