require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
// hey
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use('/auth', authRoutes);
module.exports=app 
