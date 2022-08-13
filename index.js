var express = require('express');
var app = express();
app.set('view engine', 'ejs');
app.set("views", "./views");
app.use(express.static('public'));
app.use("/scripts", express.static(__dirname + "/node_modules/web3.js-browser/build/"));
var bodyPaser = require("body-parser");
app.use(bodyPaser.urlencoded({ extended: true }));
var server = require("http").Server(app);
// var io = require("socket.io")(server);
// app.io = io;
const port = process.env.PORT || 3000;
server.listen(port);

app.get('/', function (req, res) {
    res.render("home");
})

app.get('/test', function (req, res) {
    res.render("test");
})

app.get('/nftdetail/:id', function (req, res) {
    res.end(JSON.stringify((
        {
            "name": "NFT for test #" + req.params.id,
            "description": "This is one items in the list of the Test Game Blockchain Collection",
            "image_url": "http://testnftblockchain.herokuapp.com/nftimage/" + req.params.id + ".png",
            "tokenId": req.params.id,
        })));
})