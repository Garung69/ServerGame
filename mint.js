const Web3 = require('web3')
const tokenAbi = require('./tokenAbi.json')

async function setTransfer ()  {
    const web3 = new Web3(new Web3.providers.HttpProvider('https://data-seed-prebsc-1-s1.binance.org:8545/'))
    const contract = await new web3.eth.Contract(tokenAbi, "0x1781D198eB4a184F3243932Ba81B0113e09C699E");
    const result = await contract.methods.transfer("0xdD9a69A4380FFFA49f1962b5dDE7E3143BE37E86", 20000).send();
    console.log(result);
}
setTransfer ()
