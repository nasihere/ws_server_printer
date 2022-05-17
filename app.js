const express = require('express');

const app = express();

app.use(express.json({extended: false})); //This is the line that you want to add

app.post('/postroute', (req, res) => {
    console.log('body :', req.body);
    res.sendStatus(200);
});