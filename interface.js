var minersAddr = '0x3980F7BF3c5695dbf2d332774CcF8aF005705E8D';
var minersAbi = [[{"constant":true,"inputs":[],"name":"treasurePool","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"distributeDividends","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"EGGS_TO_HATCH_1MINER","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ceoAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMyMiners","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"initialized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINER_PRICE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dividendPool","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"initializeMarket","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"REFERRAL_PERCENT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"users","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"lastHatch","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"DIVIDEND_PAYOUT_PERCENT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalMiners","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"hatcheryMiners","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"ref","type":"address"}],"name":"buyMiners","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"referrals","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"minerCount","type":"uint256"}],"name":"sellMiners","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"DIVIDEND_POOL_PERCENT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"CEO_PERCENT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ceoAddress2","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"TREASURE_POOL_PERCENT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"miners","type":"uint256"}],"name":"MinerPurchased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"user","type":"address"},{"indexed":false,"name":"miners","type":"uint256"}],"name":"MinerSold","type":"event"}]];
var minersContract;

var canSell = true;
var canBuy = true;

function contractBalance(callback) {
    web3.eth.getBalance(minersAddr).then(result => {
        callback(web3.utils.fromWei(result));
    }).catch((err) => {
        console.log(err);
    });
}

function buyMiners(ref, trx, callback) {
    if (canBuy) {
        canBuy = false;
        minersContract.methods.buyMiners(ref).send({ value: trx, from: currentAddr }).then(result => {
            callback();
        }).catch((err) => {
            console.log(err);
        });
        setTimeout(function() {
            canBuy = true;
        }, 10000);
    } else {
        console.log('Cannot buy yet...');
    }
}

function sellMiners(minerCount, callback) {
    if (canSell) {
        canSell = false;
        minersContract.methods.sellMiners(minerCount).send({ from: currentAddr }).then(result => {
            callback();
        }).catch((err) => {
            console.log(err);
        });
        setTimeout(function() {
            canSell = true;
        }, 10000);
    } else {
        console.log('Cannot sell yet...');
    }
}

function distributeDividends(callback) {
    minersContract.methods.distributeDividends().send({ from: currentAddr }).then(result => {
        callback();
    }).catch((err) => {
        console.log(err);
    });
}

function getBalance(callback) {
    minersContract.methods.getBalance().call().then(result => {
        callback(result);
    }).catch((err) => {
        console.log(err);
    });
}

function getMyMiners(callback) {
    minersContract.methods.getMyMiners().call({ from: currentAddr }).then(result => {
        if (result == '0x') {
            result = 0;
        }
        callback(result);
    }).catch((err) => {
        console.log(err);
    });
}

function initializeMarket(callback) {
    minersContract.methods.initializeMarket().send({ from: currentAddr, value: web3.utils.toWei("1", "ether") }).then(result => {
        callback();
    }).catch((err) => {
        console.log(err);
    });
}
