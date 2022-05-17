const express = require('express');
const uploadRoute = require('./upload');

const app = express()

const port = process.env.PORT || 3002

app.use(uploadRoute);

app.listen(port, () => {
    console.log('Server is up on port ' + port);
})