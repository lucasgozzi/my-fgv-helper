const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3333;

mongoose.connect('mongodb+srv://omnistack:OZHDWD2TICry6rSc@cluster0-hmuc0.mongodb.net/fgv?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

app.use(cors());
app.use(express.json());
app.use(routes);


app.listen(PORT, () => { console.log('listening on port 3333') });