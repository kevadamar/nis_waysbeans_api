require('dotenv').config();
const express = require('express');
const app = express();
// routes
const router = require('./src/routes');
const cors = require('cors');

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/', router);

app.listen(PORT, () => console.log(`Your app is running in port : ${PORT}`));
