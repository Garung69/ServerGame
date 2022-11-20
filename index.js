const { MongoClient, ObjectId, Double } = require('mongodb');

const URL = 'mongodb+srv://thien:tavip123@gameboxdb.rxhaxzg.mongodb.net/test';
const DATABASE_NAME = "boxgamedatabase"

async function getDB() {
    const client = await MongoClient.connect(URL);
    const dbo = client.db(DATABASE_NAME);
    return dbo;
}



var express = require('express');
const Web3 = require('web3')
const Abi = require('./nftabi.json');
const { initScheduledJobs } = require('./scheduledFunctions/distributeToken')
const {GetPaymentData, updateUnityitems, GetProfileData, calPoint, SavePoint, GetActivityData, getPaymentUnityData, saveUnityPaymentData,saveActivityData, getLoginUnityData,afterTransferNFT, currentOwner, test, asPromise, saveUnityLoginData, setDelist, getAllGame, seedNft, getAllNft, delAllNFT, getNFTDetails, afterMintNFT, requestMintNFT, setApprove } = require('./function');
const tokenReceiverForMint = "0xdD9a69A4380FFFA49f1962b5dDE7E3143BE37E86";
const privateKey = "d6181c28b8c41da16ef1eed12d7430abd5e9d76b6e72356cbedccbde4787dab4";
const provider = 'https://data-seed-prebsc-1-s1.binance.org:8545/'
const contractAddress = "0xc506885bb49f03F77418Ba0ae10EB5ED3CE16037"
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
server.listen(process.env.PORT || 5000);

initScheduledJobs();

app.post('/loginDataHandle', async (req, res) => {
    await saveUnityLoginData(req.body.account, req.body.hash)
    res.json("SUCCESS")
})

app.post('/loginUnityHandle', async (req, res) => {
    console.log(req.body.hash);
    const result = await getLoginUnityData(req.body.hash, 6)
    res.json(result);
})


app.get('/loginUnity/:id', async (req, res) => {
    res.render("login");
})

app.post('/saveDataUseItems', async (req, res) => {
    await updateUnityitems(req.body.address, req.body.item1 , req.body.item2 , req.body.item3 , req.body.item4 , req.body.item5 );
    res.json(req.body.address);
})

app.post('/saveDataBuyItems', async (req, res) => {
    await saveUnityPaymentData(req.body.address, req.body.id , req.body.count);
    res.json(req.body.id);
})

app.post('/getDataBuyItems', async (req, res) => {
    const result = await getPaymentUnityData(req.body.address)
    res.json(result);
})

app.post('/SavePoint', async (req, res) => {
    const result = await SavePoint(req.body.address, req.body.point);
    res.json(result);
})


app.get('/buyItems', async (req, res) => {
    res.render("items");
})


app.post('/addpoint', async (req, res) => {
    return "false";
})

app.get('/apitest', async (req, res) => {
    const allGames = await calPoint();
    res.json(allGames);
})

app.get('/delnft', async (req, res) => {
    await delAllNFT();
    res.json({ text: "done" });
})

app.get('/seednft', async (req, res) => {
    const seednft = await seedNft();
    const result = await getAllNft();
    res.json(result);
})
app.get('/apiformint/:id', (req, res) => {
    if (req.params.id == 1) {
        res.json({ Mintable: false })
    } else {
        res.json({ Mintable: true })
    }
})
app.get('/', function (req, res) {
    const web3 = new Web3(new Web3.providers.HttpProvider(provider))
    console.log(web3.version)
    res.render("home");
})

app.get('/mint', function (req, res) {

    res.render("mint");
})
app.post('/mint', async function (req, res) {
    console.log("result");
})

app.get('/mk', async function (req, res) {
    const allNFT = await getAllNft();
    const allActivity = await GetActivityData();
    res.render("marketplace", { nfts: allNFT, activity:allActivity });
    //res.json({ nfts: allNFT })
})
app.get('/rp', function (req, res) {
    res.render("report",{ profile: null, activity: null } );
})
app.get('/rp:id', async function (req, res) {
    const userProfile = await GetProfileData(req.params.id);
    const allActivity = await GetPaymentData(req.params.id);
    res.render("report", { profile: userProfile, activity: allActivity });
})
app.get('/nft:id', async function (req, res) {
    console.log(req.params.id);
    const nft = await getNFTDetails(req.params.id);
    res.render("nft", { nft: nft });
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
    const web3 = new Web3(new Web3.providers.HttpProvider(provider))
    result = await web3.eth.getTransaction(req.body.tx);
    if (result.to == tokenReceiverForMint && (result.value / (10 ** 18)) == 0.05) {
        const couter = await requestMintNFT("boxgame");
        await mintToken(couter);
        res.json({ success: couter, status: 200 });
    }
    async function mintToken(id) {
        const contract = await new web3.eth.Contract(Abi, contractAddress);
        const tx = {
            to: contractAddress,
            gas: '0x' + (200000).toString(16),
            gasPrice: '0x' + (80000000000).toString(16),
            chainId: '97',
            data: contract.methods.mintNew(req.body.address, id).encodeABI()
        };
        console.log(tx.data);
        const signPromise = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
        console.log(receipt);
        afterMintNFT(id, req.body.address);
    }
})

app.post('/encode', async (req, res) => {

    const web3 = new Web3(new Web3.providers.HttpProvider(provider))
    console.log(web3.version)
    const contract = await new web3.eth.Contract(Abi, contractAddress);
    const encode = contract.methods.approve("0x9406233681465c9238f332bb3dbeBD6E048845BD", req.body.tokenId).encodeABI().toString()
    console.log("encode: " + encode)
    res.json({ success: encode });
})

app.post('/approved', async (req, res) => {
    await setApprove(req.body.address, req.body.id, req.body.price);
    res.json({ success: true });
})
app.post('/delist', async (req, res) => {
    await setDelist(req.body.id);
    res.json({ success: true });
})

app.post('/buyNFT', async function (req, res) {
    const web3 = new Web3(new Web3.providers.HttpProvider(provider))
        console.log("function buy NFT")
        await transferToken();
        res.json({ success: true , status: 200 });

    async function transferToken() {       
        console.log("Function transfer token")
        const contract = await new web3.eth.Contract(Abi, contractAddress);
        const tx = {
            to: contractAddress,
            chainId: '97',
            gasPrice: "20000000000",
            gas: "100000",
            data: contract.methods.safeTransferFrom(await currentOwner(req.body.id), req.body.address, req.body.id).encodeABI()
        };
        const signPromise = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
        await saveActivityData(1, await currentOwner(req.body.id), req.body.address, req.body.price, req.body.id, receipt.transactionHash)
        await afterTransferNFT(req.body.id, req.body.address);
    }
})

app.post('/sendPayLoad', (req,res)=>{
    let response = ''
    try {
        const payLoad = req.body.jsonpayload      
        const jsonObjec = JSON.parse(payLoad)


        console.log("User ID: "+jsonObjec.userId)
        console.log("Number Record: "+jsonObjec.detailList.length)
        console.log("Data: : "+payLoad)
        
        let names = ''
        jsonObjec.detailList.forEach(element => {
            names += element.name + ","
        });
        names = names.substring(0,names.length -1) // remove the last ","
        response = {
            'uploadResponseCode' :'SUCCESS',
            'userid' : jsonObjec.userId,
            'number': jsonObjec.detailList.length,
            'names' : names,
            'message':'successful upload – all done!'
        }
    } catch (error) {
        response = {
            'uploadResponseCode' :'ERROR',
            'message':'your request is invalid! check the request format!'
        }
    }    
    res.json(response)
})