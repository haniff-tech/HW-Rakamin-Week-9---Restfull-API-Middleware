const express = require('express');
const app = express();
const port = 5000;
const morgan = require('morgan');

app.use(morgan("combined"))
app.use(express.json());
require('dotenv').config();


//Required routes
const movies = require('./routes/movies.js');
const users = require('./routes/users.js');

//Use the router on the sub router 
app.use('/movies', movies);
app.use('/users', users);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
  