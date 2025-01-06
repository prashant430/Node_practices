const http = require("http");
const fs = require('fs');
const url = require('url');



const server = http.createServer((req, res) => {
    let dateInMillisecs = new Date().getTime();
    let dateInWords = new Date(dateInMillisecs);
    const log = `${dateInWords} : url : ${req.url} : res : ${res} : New Req Recieved\n`;
    const myurl = url.parse(req.url,true);
    console.log(myurl);
    fs.appendFile('test.txt',log ,function(err,data){
    switch(req.url){
    case '/' : res.end("It's Homepage");
    break;
    case '/about' : res.end("It's About Page");
    break;
    default : res.end('404 Error');
    }
    });
});



server.listen((8000), () => {
    console.log("Server is Running again");
})