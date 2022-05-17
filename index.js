const WebSocket = require('ws')
const url = 'wss://eelxzvivea.execute-api.us-east-2.amazonaws.com/production'
const bodyParser = require('body-parser');

const { uploadToS3, helloTest } = require("./s3-upload");
helloTest()
const express = require('express')
const cors = require('cors');
const multer = require('multer');
multer({
  limits: { fieldSize: 25 * 1024 * 1024 }
})
const upload = multer({dest:'./upload/'});

const app = express();
const port = 3002;

// Where we will keep books
let books = [];
const memConnections = {}
app.use(bodyParser());
app.use(bodyParser.json()); // add a middleware (so that express can parse request.body's json)

app.use(cors({
  origin: '*'
}));
const memCache = {};
// Configuring body parser middleware
app.use(express.json()); // Used to parse JSON bodies

function printNow(req,res,param) {
  let { printerName, username } = req.body;
  if (!username) {
    res.send({username: "missing"});
    return;
  }
  username = username.toLowerCase();
  const link = param['Location'];
  const connectionId = memConnections[username];
  console.log(link, printerName, connectionId);
  
  memCache[connectionId] = res;
  sendLinkToConnection(link,  connectionId, printerName, res)
  // setTimeout( () => memCache[connectionId] && memCache[connectionId].send(true) || false, 5000) 
}
function uploadPDF(req,res,filedata) {

  if (!filedata) {
    console.log("missing file data")
    res.send({filedata: "missing"});
    return;
  }
  const filename = new Date().getTime() + ".pdf";
  uploadToS3(req, res, { name: filename, data: filedata},  printNow)

}
app.post('/print',  (req, res) => {
  console.log("printer command triggered");
    console.log(req.data);
    console.log(req.body);
    console.log(req.body.data);
    const formData = req.data;
    console.log('Upload started')
    uploadPDF(req,res,formData);
});

app.post('/register', (req, res) => {
  let { username, connectionId } = req.body;
  username = username.substring(0,username.indexOf("@"));
  username = username.toLowerCase();
  console.log(username, connectionId)
  memConnections[username] = connectionId;
  console.log(memConnections)
  res.send(true)
});


app.get('/test', (req, res) => {

  res.send("working...")
});



app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));


 
function sendLinkToConnection(link, connectionId, printerName, res){
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
    const sendMsg = {"action":"sendMessage","connectionId": connectionId, "link": link, "printerName": printerName }
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


