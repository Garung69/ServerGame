var express = require('express');
const Web3 = require('web3')
const Abi = require('./abi.json');
const tokenReceiverForMint = "0xdD9a69A4380FFFA49f1962b5dDE7E3143BE37E86";
const privateKey = "d6181c28b8c41da16ef1eed12d7430abd5e9d76b6e72356cbedccbde4787dab4";
var app = express();
app.set('view engine', 'ejs');
app.set("views", "./views");
app.use(express.static('public'));
app.use(express.json());
app.use("/scripts", express.static(__dirname + "/node_modules/web3.js-browser/build/"));
var bodyPaser = require("body-parser");
const { request } = require('http');
app.use(bodyPaser.urlencoded({ extended: true }));
var server = require("http").Server(app);
// var io = require("socket.io")(server);
// app.io = io;
const port = process.env.PORT || 5000;
server.listen(port);

app.get('/api/helloworld', (req, res) => {
    res.json({ sayHi: 'hello from server, nice to meet you!' })
})
app.get('/apiformint/:id', (req, res) => {
    if(req.params.id == 1){
        res.json({ Mintable: false })
    }else{
        res.json({ Mintable: true })
    }
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

app.post('/ajax', async function (req, res) {
    const web3 = new Web3(new Web3.providers.HttpProvider('https://data-seed-prebsc-1-s1.binance.org:8545/'))
    result = await web3.eth.getTransaction(req.body.tx);
    if (result.to == tokenReceiverForMint && (result.value / (10 ** 18)) == 0.05) {
        const contract = await new web3.eth.Contract(Abi, "0x1781D198eB4a184F3243932Ba81B0113e09C699E");
        mintToken();
        // const result2 = await contract.methods.transfer("0xdD9a69A4380FFFA49f1962b5dDE7E3143BE37E86", 25000).send();
        // console.log(result2);
    }
    async function mintToken() {
        const contract = await new web3.eth.Contract(Abi, "0x1781D198eB4a184F3243932Ba81B0113e09C699E");
        const tx = {
            from: "0x9406233681465c9238f332bb3dbeBD6E048845BD",
            to: "0x1781D198eB4a184F3243932Ba81B0113e09C699E",
            nonce: '0x0',
            gas: '0x' + (100000).toString(16),
            gasPrice: '0x' + (50000000000).toString(16),
            data: contract.methods.transfer("0xdD9a69A4380FFFA49f1962b5dDE7E3143BE37E86", 25000).encodeABI()
        };
        const signPromise = web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
        console.log(receipt);
    }

})
