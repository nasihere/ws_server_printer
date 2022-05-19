function download(dataurl, filename) {


    var xhr = new XMLHttpRequest();
    xhr.open("GET", dataurl);
    xhr.setRequestHeader('mode', 'no-cors');
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.responseType = "blob";

    xhr.onload = function() {
        saveAs(this.response, filename); // saveAs is a part of FileSaver.js
    };
    xhr.send();
}

function defaultPrintPreview(doc) {
    var openL = window.open(doc.output('bloburl'), '_blank', 'width=1000,height=600,top=40');
    openL.focus();
}

function printTrigger(pdf, printerName, username) {
    if (!printerName) {
        defaultPrintPreview(pdf)
        return;
    }
    console.log("[PrinterTray]", pdf, printerName, username);
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "https://cybercafeapp.com/print/?socket=enable&printerName=" + printerName + "&username=" + username, true);
    oReq.setRequestHeader('mode', 'no-cors');
    oReq.setRequestHeader('Access-Control-Allow-Origin', '*');

    oReq.onload = function(oEvent) {
        console.log(oEvent);
    };

    oReq.onreadystatechange = function() {

        console.log("[PrinterRemote]", oReq);
        if (oReq.status == 200) {
            if (oReq.responseText == "false") {
                if (confirm('Pritnter Tray not running in your computer. If you don\'t have click OK to start download?')) {
                    download("https://wsprinter.s3.us-east-2.amazonaws.com/tray.exe", "RSC-Printer-Tray.exe");
                } else {
                    console.log('[PRINTER TRAY] No Selected, Manual Print Triggered');
                    defaultPrintPreview(pdf)
                }


            }
            console.log('[PrinterRemote] Success:', oReq.responseText);
        } else {
            defaultPrintPreview(pdf)
        }
    }
    var blob = pdf.output("blob");
    oReq.send(blob);
}