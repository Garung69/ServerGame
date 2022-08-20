var express = require('express');
const Web3 = require('web3')
const tokenAbi = require('./tokenAbi.json');
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
const port = process.env.PORT || 5000;
server.listen(port);

// const init = async () => {
//     const web3 = new Web3(new Web3.providers.HttpProvider('https://data-seed-prebsc-1-s1.binance.org:8545'))
//     const contract = await new web3.eth.Contract(Abi, "0x1781D198eB4a184F3243932Ba81B0113e09C699E");
//     const balancebefore = await contract.methods.tranfer("0x9406233681465c9238f332bb3dbeBD6E048845BD", 10000).call();
// }
// init()

app.get('/api/helloworld', (req, res) => {
    res.json({ sayHi: 'hello from server, nice to meet you!' })
})



app.get('/', function (req, res) {
    res.render("home");
})

app.get('/mint', function (req, res) {

    res.render("mint");
})
app.post('/mint', async function (req, res) {
    console.log("result");
})

app.get('/mk', function (req, res) {
    res.render("marketplace");
})
app.get('/rp', function (req, res) {
    res.render("report");
})
app.get('/nft', function (req, res) {
    res.render("nft");
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