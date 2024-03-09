require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');

const app = express();
const PORT = 3000 || process.env.PORT;

// abilito i file statici, vado a mettere gli assets
app.use(express.static('assets'));

// template engine
app.use(expressLayout);
app.set('layout', './templates/main');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send("HOME");
});

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});