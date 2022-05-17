// Load the necessary modules and define a port
const app = require('express')();
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3002;
const cors = require('cors');
const { uploadToS3, helloTest } = require("./s3-upload");
const WebSocket = require('ws')
const url = 'wss://eelxzvivea.execute-api.us-east-2.amazonaws.com/production'
const bodyParser = require('body-parser');
const express = require('express')
app.use(express.json()); // Used to parse JSON bodies

app.use(cors({
    origin: '*'
}));
// Take in the request & filepath, stream the file to the filePath
const uploadFile = (req, filePath) => {
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(filePath);
        // With the open - event, data will start being written
        // from the request to the stream's destination path
        stream.on('open', () => {
            console.log('Stream open ...  0.00%');
            req.pipe(stream);
        });

        // Drain is fired whenever a data chunk is written.
        // When that happens, print how much data has been written yet.
        stream.on('drain', () => {
            const written = parseInt(stream.bytesWritten);
            const total = parseInt(req.headers['content-length']);
            const pWritten = ((written / total) * 100).toFixed(2);
            console.log(`Processing  ...  ${pWritten}% done`);
        });

        // When the stream is finished, print a final message
        // Also, resolve the location of the file to calling function
        stream.on('close', () => {
            console.log('Processing  ...  100%');
            resolve(filePath);
        });
        // If something goes wrong, reject the primise
        stream.on('error', err => {
            console.error(err);
            reject(err);
        });
    });
};

// Add a basic get - route to check if server's up
app.get('/', (req, res) => {
    res.status(200).send(`Server up and running`);
});

// Add a route to accept incoming post requests for the fileupload.
// Also, attach two callback functions to handle the response.
app.post('/', (req, res) => {
    const filePath = path.join(__dirname, `/image.pdf`);
    uploadFile(req, filePath)
        .then(path => {
            console.log("file upload done", filePath);
            uploadPDF(req, res, filePath)
                // res.send({ status: 'success', path })
        })
        .catch(err => res.send({ status: 'error', err }));
});

app.get('/test', function(req, res) {
    res.sendFile('./index.html', { root: '.' });
});

// Mount the app to a port
app.listen(port, () => {
    console.log('Server running at http://127.0.0.1:3000/');
});

//---------------------------//

const memCache = {};
const memConnections = {}

function printNow(req, res, param) {
    let queryString = new URLSearchParams(req.url);
    for (let pair of queryString.entries()) {
        console.log("Key is: " + pair[0]);
        console.log("Value is: " + pair[1]);
    }

    let printerName = queryString.get('printerName')
    let username = queryString.get('username')

    if (!username) {
        console.log("Username is missing")
        res.send({ username: "missing" });
        return;
    }
    username = username.toLowerCase();
    const link = param['Location'];
    const connectionId = memConnections[username];
    // if (!connectionId) {
    //     console.log("connectionId is missing")
    //     res.send({ connectionId: "missing" });
    //     return;
    // }
    console.log(link, printerName, connectionId);

    memCache[connectionId] = res;
    sendLinkToConnection(link, connectionId, printerName, res)
        // setTimeout( () => memCache[connectionId] && memCache[connectionId].send(true) || false, 5000) 
}

function uploadPDF(req, res, filedata) {

    if (!filedata) {
        console.log("missing file data")
        res.send({ filedata: "missing" });
        return;
    }
    const filename = new Date().getTime() + ".pdf";
    const fileStream = fs.createReadStream(filedata);
    uploadToS3(req, res, { name: filename, data: fileStream }, printNow)

}

function sendLinkToConnection(link, connectionId, printerName, res) {
    const connection = new WebSocket(url)


    connection.onmessage = (e) => {
        const incomingMessage = JSON.parse(e.data);
        if (incomingMessage) {

            const { message } = incomingMessage;
            if (message == "Internal server error") {
                console.log("error")

                res.send(false)
                connection.close();
                res = null;

            }
        }

        console.log(e.data)
    }


    connection.onopen = () => {
        const sendMsg = { "action": "sendMessage", "connectionId": connectionId, "link": link, "printerName": printerName }
        connection.send(JSON.stringify(sendMsg))
        setTimeout(() => {
            if (res) {
                res.send(true);
                connection.close()
            }
        }, 1000);
    }

    connection.onerror = (error) => {
        console.log(`WebSocket error: ${error}`)
    }
}

app.use(bodyParser.json()); // add a middleware (so that express can parse request.body's json)

app.post('/register', (req, res) => {
    console.log(req.body, 'Register')
    let { username, connectionId } = req.body;
    username = username.substring(0, username.indexOf("@"));
    username = username.toLowerCase();
    console.log(username, connectionId)
    memConnections[username] = connectionId;
    console.log(memConnections)
    res.send(true)
});