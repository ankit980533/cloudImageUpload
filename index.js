
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const mongoose=require('mongoose');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const url = process.env.URL;
require('dotenv').config();

mongoose.connect("mongodb+srv://user:ankitraj@cluster0.ky8l28e.mongodb.net/")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/images', require('./routes/images'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

