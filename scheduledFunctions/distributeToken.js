const CronJob = require("node-cron");
const contractAddress = "0x1781D198eB4a184F3243932Ba81B0113e09C699E"
const provider = 'https://data-seed-prebsc-1-s1.binance.org:8545/'
const privateKey = "d6181c28b8c41da16ef1eed12d7430abd5e9d76b6e72356cbedccbde4787dab4";
const Web3 = require('web3')
const { resetPoint, calPoint, savePaymentData } = require('../function');
const Abi = require('../tokenabi.json');
async function initScheduledJobs() {
    const scheduledJobFunction = CronJob.schedule("30 00 * * *", async () => {
        distributeToken()
    });

    async function distributeToken() {
        const listAdress = await calPoint();
        const web3 = new Web3(new Web3.providers.HttpProvider(provider))
        for (let i = 0; i < listAdress.length; i++) {
            const contract = await new web3.eth.Contract(Abi, contractAddress);
            const tx = {
                to: contractAddress,
                chainId: '97',
                gasPrice: "20000000000",
                gas: "40000",
                data: contract.methods.transfer(listAdress[i].owner, (listAdress[i].point * (10**18)).toString()).encodeABI()
            };
            const signPromise = await web3.eth.accounts.signTransaction(tx, privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signPromise.rawTransaction);
            await savePaymentData(listAdress[i].owner, listAdress[i].point, listAdress[i].point, receipt.transactionHash);
            console.log(receipt);
        }
        resetPoint();
    }

    scheduledJobFunction.start();
}
module.exports = {initScheduledJobs}