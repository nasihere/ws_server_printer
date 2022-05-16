const WebSocket = require('ws')
const url = 'wss://eelxzvivea.execute-api.us-east-2.amazonaws.com/production'

const { uploadToS3, helloTest } = require("./s3-upload");
helloTest()
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const upload = multer();

const app = express();
const port = 3002;

// Where we will keep books
let books = [];
const memConnections = {}
app.use(cors());
const memCache = {};
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function printNow(req,res,param) {
  const { printerName, username } = req.body;
  if (!username) {
    res.send({username: "missing"});
    return;
  }
  const link = param['Location'];
  const connectionId = memConnections[username];
  console.log(link, printerName, connectionId);
  
  memCache[connectionId] = res;
  sendLinkToConnection(link,  connectionId, printerName, res)
  // setTimeout( () => memCache[connectionId] && memCache[connectionId].send(true) || false, 5000) 
}
function uploadPDF(req,res,filedata) {
  if (!filedata) {
    res.send({filedata: "missing"});
    return;
  }
  const filename = new Date().getTime() + ".pdf";
  uploadToS3(req, res, { name: filename, data: filedata},  printNow)

}
app.post('/print', upload.none(), (req, res) => {
  console.log("strat")
    const formData = req.body.data;
    uploadPDF(req,res,formData);
});

app.post('/register', (req, res) => {
  const { username, connectionId } = req.body;
  console.log(username, connectionId)
  memConnections[username] = connectionId;
  console.log(memConnections)
  res.send(true)
});


app.get('/test', (req, res) => {

  res.send("working...")
});

function printTrigger(doc, printerName, username ) {
  
  function download(dataurl, filename) {
    var a = document.createElement("a");
    a.href = dataurl;
    a.setAttribute("download", filename);
    a.click();
    return false;
  }
  

  const awsURL = "http://ec2-3-132-213-115.us-east-2.compute.amazonaws.com:3002/print";
  var pdf =doc.output(); 
  var data = new FormData();
  data.append("data" , pdf);

  fetch(awsURL, {
    method: 'POST', 
    headers: {
      'Content-Type': 'form-data',
    },
    body: {
      data,
      printerName,
      username
    },
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    
    console.error('Error:', error);
    if (confirm('Pritnter Tray not running in your computer. Do you wish to download Printer Tray application?')) {
      // Save it!
      download("https://wsprinter.s3.us-east-2.amazonaws.com/tray.exe", "RSC-Printer-Tray.exe");
    } else {
      // Do nothing!
      console.log('[PRINTER TRAY] No Selected, Manual Print Triggered');
      var openL = window.open(doc.output('bloburl'), '_blank', 'width=1000,height=600,top=40');
      openL.focus();


    }
  });

}


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


