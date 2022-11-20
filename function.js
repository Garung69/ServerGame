const { MongoClient, ObjectId, Double } = require('mongodb');

const URL = 'mongodb+srv://thien:tavip123@gameboxdb.rxhaxzg.mongodb.net/test';
const DATABASE_NAME = "boxgamedatabase"

async function getDB() {
    const client = await MongoClient.connect(URL);
    const dbo = client.db(DATABASE_NAME);
    return dbo;
}

async function getAllGame() {
    const dbo = await getDB();
    const allGames = await dbo.collection("gameInfo").find({}).toArray();
    return allGames;
}

async function seedNft() {
    db = await getDB();
    for (let i = 1; i <= 55; i++) {
        let id = i
        let image = "/nftimage/" + i + ".png";
        let owner = "0x0"
        let point = 0;
        let mintable = true;
        let price = "Not Set yet!"
        let issale = false;
        let saletime = "Not Set yet!"
        const newNFT = { _nftId: id, _nftImage: image, _nftOwner: owner, _nftPoint: point, _mintable: mintable, _nftPrice: price, _isSale: issale, _saleTime: saletime }
        console.log("2")
        await db.collection('nft').insertOne(newNFT);
        if (i == 55) { console.log("Seed Done!") }
    }
    return getAllNft();
}
async function getAllNft() {
    db = await getDB();
    const allNft = await db.collection("nft").find({}).toArray();
    return allNft;
}
async function checkNFT(id) {
    db = await getDB();
    const result = await db.collection('nft').findOne({ _nftId: parseInt(id) });
    if (result) {
        console.log("NFT #" + id + "Now available!")
        return true;
    } else {
        console.log("NFT #" + id + "Not found => seedding")
        return false;
    }
}
async function delAllNFT() {
    db = await getDB();
    db.collection("nft").remove({});
    console.log("Done!")
}
async function getNFTDetails(id) {
    console.log(id);
    db = await getDB();
    const result = await db.collection("nft").findOne({ _nftId: parseInt(id) });
    console.log(result)
    if (result) {
        console.log("found!")
        return result;
    } else {
        console.log("Not found!")
        return 0;
    }
}
async function afterMintNFT(id, owner) {
    db = await getDB();
    await db.collection("nft").updateOne({ _nftId: parseInt(id) }, { $set: { _nftOwner: owner, _mintable: false } });
    await db.collection("collection").updateOne({ _name: "boxgame" }, { $set: { _counter: (id + 1) } })
}
async function requestMintNFT(collection) {
    db = await getDB();
    console.log(collection)
    const result = await db.collection("collection").findOne({ _name: collection })
    console.log(result);
    if (result._mintable) {
        return result._counter;
    } else {
        return 0;
    }
}

async function setApprove(address, id, price) {
    db = await getDB();
    const result = await db.collection("approve").findOne({ _nftId: id })
    if (result == null) {
        const newApprove = { _nftId: id, _nftOwner: address }
        await db.collection('approve').insertOne(newApprove);
    }
    await db.collection("nft").updateOne({ _nftId: id }, { $set: { _nftPrice: price + " BNB", _isSale: true, _saleTime: Date.now() } })
    await saveActivityData(0, address, null, price, id, null);
}

function checkExists(a, array) {
    for (let i = 0; i < array.length; i++) {
        console.log(array[i].owner)
        if (array[i].owner == a) {
            console.log("Exists")
            return true;
        }
    }
    console.log("No exists")
    return false;
}

async function calPoint() {
    db = await getDB();
    const result = await db.collection("nft").find({ _nftPoint: { $gt: 0 } }).toArray();
    const addressList = []
    for (let i = 0; i < result.length; i++) {
        if (addressList != null && checkExists(result[i]._nftOwner, addressList)) {
            for (var j = 0; j < addressList.length; j++) {
                if (addressList[j].owner === result[i]._nftOwner) {
                    addressList[j].point += result[i]._nftPoint;
                }
            }
        }
        if (addressList == null || !checkExists(result[i]._nftOwner, addressList)) {
            addressList.push({ owner: result[i]._nftOwner, point: result[i]._nftPoint })
        }
    }
    console.log(addressList)
    return addressList;
}
async function resetPoint() {
    db = await getDB();
    await db.collection("nft").updateMany({}, { $set: { _nftPoint: 0 } })
}
async function setDelist(id) {
    db = await getDB();
    await db.collection("approve").deleteOne({ _nftId: id })
    await db.collection("nft").updateOne({ _nftId: id }, { $set: { _nftPrice: "Not Set yet!", _isSale: false, _saleTime: "Not Set yet!" } })
}

async function saveUnityLoginData(address, hash) {
    db = await getDB();
    const result = await db.collection("loginUnity").findOne({ _address: address })
    if (result) {
        await db.collection("loginUnity").updateOne({ _address: address }, { $set: { _hash: hash } })
    } else {
        const newLoginData = { _address: address, _hash: hash, _time: Date.now() }
        await db.collection("loginUnity").insertOne(newLoginData)
    }
}

async function updateUnityitems(address, _item1, _item2, _item3, _item4, _item5){
    db = await getDB();
    const result = await db.collection("paymentUnity").findOne({ _address: address })
    if (result) {
        await db.collection("paymentUnity").updateOne({ _address: address }, { $set: { _item1: Number(result._item1) - (_item1), _item2: Number(result._item2) - (_item2), _item3: Number(result._item3) - (_item3), _item4: Number(result._item4) - (_item4), _item5: Number(result._item5) - (_item5)  } })
    }
}

async function saveUnityPaymentData(address, id, count, _item1 = 0, _item2 = 0, _item3 = 0, _item4 = 0, _item5 = 0) {
    if(id==1){
        _item1 = 1;
    } if(id==2){
        _item2 = 1;
    }
    if(id==3){
        _item3 = 1;
    }
    if(id==4){
        _item4 = 1;
    }
    if(id==5){
        _item5 = 1;
    }
    db = await getDB();
    const result = await db.collection("paymentUnity").findOne({ _address: address })
    if (result) {
        await db.collection("paymentUnity").updateOne({ _address: address }, { $set: { _item1: Number(result._item1) + (count*_item1), _item2: Number(result._item2) + (count*_item2), _item3: Number(result._item3) + (count*_item3), _item4: Number(result._item4) + (count*_item4), _item5: Number(result._item5) + (count*_item5)  } })
    } else {
        const newData = { _address: address, _item1:  Number(_item1*count) , _item2:  _item2*count, _item3:  _item3*count, _item4:  _item4*count, _item5:  _item5*count}
        await db.collection("paymentUnity").insertOne(newData)
    }
}

function asPromise(context, callbackFunction) {
    return new Promise((resolve, reject) => {
        args.push((err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
        if (context) {
            callbackFunction.call(context);
        } else {
            callbackFunction();
        }
    });
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function callBackGetHash(hash, callbackTimes){
    if (callbackTimes == 0)return 0;
    var result = await db.collection("loginUnity").findOne({ _hash: hash })
    if (result){
        console.log("Data found!")
        console.log(result);
        return result;
    }
    else{
        console.log("No data! ~~ Keep callback!!")
        await delay(10000)
        var result = await callBackGetHash(hash, callbackTimes -1)
    }
    if(result){
        return result;
    }
}


async function getPaymentUnityData(address) {
    db = await getDB();
    var data = await db.collection("paymentUnity").findOne({ _address: address })
    if (data){
        const result = "" + data._item1 + " "+ data._item2 + " " + data._item3 + " " + data._item4 + " " + data._item5;
        return result;
    }
    else{
        return "0 0 0 0 0";
    }  
}

async function getLoginUnityData(hash, callbackTimes) {
    db = await getDB();
    const result = await callBackGetHash(hash, callbackTimes);
    console.log(result !=0)
    console.log("login data "+ result)
    if (result){
        console.log("found!")
        if(result._time - Date.now() <= 300000){
            const resultItem = await getPaymentUnityData(result._address)
            return result._address + " " + resultItem;
        }else{
            return 1;
        }
    }
    else{
        return 0;
    }  
}

async function saveActivityData(type, addressFrom, addressTo, price, nftId, data){
    //  type = 1 (tranfer) 
    //  type = 0 (set price)
    const db = await getDB();
    if(type == 1){ 
        console.log("saveType = 1")
        const addressBuy = addressTo.slice(0, -30) + "...";
        const addressSell = addressFrom.slice(0, -30) + "...";
        const SellPrice = price + "BNB";
        const link = "https://testnet.bscscan.com/tx/"+data;
        const newData = { _type: 1, _addressFrom: addressSell, _addressTo: addressBuy, _nftId: nftId, _price: SellPrice, _link: link, _time: Date.now() }
        await db.collection("activity").insertOne(newData)
    }else{
        const address = addressFrom.slice(0, -4) + "...";
        const SellPrice = price + "BNB";
        const link = "http://localhost:5000/nft"+nftId;
        const newData = { _type: 0, _addressFrom: address, _nftId: nftId, _price: SellPrice, _link: link, _time: Date.now() }
        await db.collection("activity").insertOne(newData)
    }
}

async function savePaymentData( Address, Point, Token, data){
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    const date = today.toLocaleDateString();
    const address = Address.slice(0, -30) + "...";
    const pointEarn = Point + " rp";
    const tokenDistributed = Token + " TTBT";
    const link = "https://testnet.bscscan.com/tx/"+data;
    const newData = { _date: date, _address: address, _fullAddress: Address, _point: pointEarn, _token: tokenDistributed, _link: link , _time: Date.now()}
    await db.collection("payment").insertOne(newData)
}

async function GetPaymentData(address){
    findingAddress = address;
    db = await getDB();
    const data = await db.collection('payment').find({_fullAddress: findingAddress}).sort({_time: -1}).toArray();
    return data;
}

async function GetProfileData(address){
    findingAddress = address;
    db = await getDB();
    let totalPoint = 0;
    let totalToken = 0;
    let totalNFt = 0;
    const payment = await db.collection('payment').find({_fullAddress: findingAddress}).toArray();
    const nft = await db.collection('nft').find({_nftOwner: findingAddress}).toArray();
    totalNFt = nft.length;
    if(payment.length > 0){
        for(let i = 0; i < payment.length; i++){
            totalPoint = Number(totalPoint) + Number(payment[i]._point);
            totalToken = Number(totalToken) + Number(payment[i]._token);
        }
    }
    const data = {SubAddress: address.slice(0, -25)+"..." , Address: address, Nft: totalNFt, Point: totalPoint, Token: totalToken}
    return data;
}

async function SavePoint(address, point){
    db = await getDB();
    const data  =  await GetNFTidByAddress(address);
    if(data){
        let TotalPoint = point;
        data.forEach(async index => {
            if(index._nftPoint < 200){
                const maxPointToAdd = 200 - index._nftPoint;
                if(maxPointToAdd < TotalPoint){
                    await db.collection("nft").updateOne({ _nftId: index._nftId}, {$set: {_nftPoint: maxPointToAdd}})
                    TotalPoint = TotalPoint - maxPointToAdd;
                }else{
                    await db.collection("nft").updateOne({ _nftId: index._nftId}, {$set: {_nftPoint: TotalPoint}})
                    return 1;
                }
            }
        });
        return 1;
    }
    return 0;    
}
async function GetNFTidByAddress(address){
    db = await getDB();
    const data = await db.collection('nft').find({_nftOwner: address}).toArray();
    return data;
}

async function GetActivityData(){
    db = await getDB();
    const data = await db.collection('activity').find({}).sort({_time: -1}).toArray();
    return data;
}


async function currentOwner(id){
    db = await getDB();
    console.log(id)
    const result = await db.collection('nft').findOne({ _nftId: id})
    console.log(result)
    return result._nftOwner;
}
async function afterTransferNFT(id, address){
    console.log("function afterTransferNFT")
    db = await getDB();
    await db.collection('nft').updateOne({ _nftId: id}, {$set: {_nftOwner: address, _isSale: false, _nftPrice: "Not Set yet!", _saleTime: "Not Set yet!"}})
    await db.collection('approve').deleteOne({ _nftId: id})
    return true;
}


module.exports = {updateUnityitems, GetPaymentData,GetProfileData, savePaymentData, GetActivityData, saveActivityData, saveUnityPaymentData, SavePoint, getPaymentUnityData, afterTransferNFT, currentOwner, asPromise, getLoginUnityData, saveUnityLoginData, setDelist, resetPoint, calPoint, getAllGame, seedNft, getAllNft, delAllNFT, getNFTDetails, afterMintNFT, requestMintNFT, setApprove }