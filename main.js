var modal;
var modalContent;
var lastNumEggs = -1;
var lastNumMiners = -1;
var lastSecondsUntilFull = 100;
var lastHatchTime = 0;
var eggstohatch1 = 864000;
var lastUpdate = new Date().getTime();
var modalID = 0;
var baseNum = '';
var currentAddr = '';

window.addEventListener('load', async function() {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable(); // Request access
            minersContract = await new web3.eth.Contract(minersAbi, minersAddr);
            let accounts = await web3.eth.getAccounts();
            currentAddr = accounts[0];
            setTimeout(function() {
                controlLoop();
                controlLoopFaster();
            }, 1000);
        } catch (error) {
            console.error(error); // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        minersContract = await new web3.eth.Contract(minersAbi, minersAddr);
        let accounts = await web3.eth.getAccounts();
        currentAddr = accounts[0];
        setTimeout(function() {
            controlLoop();
            controlLoopFaster();
        }, 1000);
    }

    setTimeout(checkForBinanceChain, 1500);
});

async function checkForBinanceChain() {
    await BinanceChain.enable();

    console.log(typeof(window.BinanceChain));

    if (window.BinanceChain) {
        console.log('hmm?');
        await BinanceChain.enable();
        window.web3 = new Web3(BinanceChain);
        minersContract = await new web3.eth.Contract(minersAbi, minersAddr);
        let accounts = await web3.eth.getAccounts();
        currentAddr = accounts[0];
        setTimeout(function() {
            controlLoop();
            controlLoopFaster();
        }, 1000);
    }
}

function controlLoop() {
    refreshData();
    setTimeout(controlLoop, 2500);
}

function controlLoopFaster() {
    liveUpdateEggs();
    setTimeout(controlLoopFaster, 30);
}

function stripDecimals(str, num) {
    if (str.indexOf('.') > -1) {
        var left = str.split('.')[0];
        var right = str.split('.')[1];
        return left + '.' + right.slice(0, num);
    } else {
        return str;
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function refreshData() {
    var balanceElem = document.getElementById('contractBal');
    var baseNum = 0;
    contractBalance(function(result) {
        rawStr = numberWithCommas(Number(result).toFixed(3));
        balanceElem.textContent = 'Contract Balance: ' + stripDecimals(rawStr, 3) + ' BNB';
    });

    web3.eth.getBalance(currentAddr).then(result => {
        rawStr = numberWithCommas(Number(web3.utils.fromWei(result)).toFixed(3));
        document.getElementById('userTrx').textContent = 'Your Balance: ' + stripDecimals(rawStr, 3) + ' BNB';
    }).catch((err) => {
        console.log(err);
    });

    lastHatch(currentAddr, function(lh) {
        lastHatchTime = lh;
    });

    getMyEggs(function(eggs) {
        if (lastNumEggs != eggs) {
            lastNumEggs = eggs;
            lastUpdate = new Date().getTime();
            updateEggNumber(eggs / eggstohatch1);
        }
        var timeuntilfulldoc = document.getElementById('timeuntilfull');
        secondsuntilfull = eggstohatch1 - eggs / lastNumMiners;
        lastSecondsUntilFull = secondsuntilfull;
        timeuntilfulldoc.textContent = secondsToString(secondsuntilfull);
        if (lastNumMiners == 0) {
            timeuntilfulldoc.textContent = '?';
        }
    });

    getMyMiners(function(miners) {
        lastNumMiners = miners;
        var allnumminers = document.getElementsByClassName('numminers');
        for (var i = 0; i < allnumminers.length; i++) {
            if (allnumminers[i]) {
                allnumminers[i].textContent = translateQuantity(miners);
            }
        }
        var productiondoc = document.getElementById('production');
        productiondoc.textContent = formatEggs(lastNumMiners * 60 * 60);

        var sellsforexampledoc = document.getElementById('sellsforexample');
        calculateEggBuySimple(web3.utils.toWei('0.1'), function(eggs) {
            devFee(eggs, function(fee) {
                sellsforexampledoc.textContent = '0.1 BNB Hires ' + formatEggs(eggs - fee) + ' miners';
            });
        });
    });

    updateBuyPrice();
    updateSellPrice();
    var prldoc = document.getElementById('playerreflink');
    prldoc.textContent = window.location.origin + "?ref=" + currentAddr;
    var copyText = document.getElementById("copytextthing");
    copyText.value = prldoc.textContent;
}

function updateEggNumber(eggs) {
    var hatchminersquantitydoc = document.getElementById('hatchminersquantity');
    hatchminersquantitydoc.textContent = translateQuantity(eggs, 0);
    var allnumeggs = document.getElementsByClassName('numeggs');
    for (var i = 0; i < allnumeggs.length; i++) {
        if (allnumeggs[i]) {
            allnumeggs[i].textContent = translateQuantity(eggs, 3);
        }
    }
}

function hatchEggs1() {
    ref = getQueryVariable('ref');
    if (!web3.utils.isAddress(ref)) {
        ref = currentAddr;
    }
    console.log('hatcheggs ref ', ref);
    hatchEggs(ref, displayTransactionMessage);
}

function liveUpdateEggs() {
    if (lastSecondsUntilFull > 1 && lastNumEggs >= 0 && lastNumMiners > 0 && eggstohatch1 > 0) {
        currentTime = new Date().getTime();
        if (currentTime / 1000 - lastHatchTime > eggstohatch1) {
            return;
        }
        difference = (currentTime - lastUpdate) / 1000;
        additionalEggs = Math.floor(difference * lastNumMiners);
        updateEggNumber(((lastNumEggs * 1) + additionalEggs) / eggstohatch1);
    }
}

function updateSellPrice() {
    var eggstoselldoc = document.getElementById('sellprice');
    getMyEggs(function(eggs) {
        if (eggs > 0) {
            calculateEggSell(eggs, function(sun) {
                devFee(sun, function(fee) {
                    eggstoselldoc.textContent = formatTrxValue(web3.utils.fromWei(sun) - web3.utils.fromWei(fee));
                });
            });
        }
    });
}

function updateBuyPrice() {
    var eggstobuydoc = document.getElementById('eggstobuy');
    var trxspenddoc = document.getElementById('ethtospend');
    calculateEggBuySimple(web3.utils.toWei(trxspenddoc.value), function(eggs) {
        devFee(eggs, function(fee) {
            eggstobuydoc.textContent = formatEggs(eggs - fee);
        });
    });
}

function buyEggs2() {
    var trxspenddoc = document.getElementById('ethtospend');
    ref = getQueryVariable('ref');
    if (!web3.utils.isAddress(ref)) {
        ref = currentAddr;
    }
    console.log('hatcheggs ref ', ref);
    buyEggs(ref, web3.utils.toWei(trxspenddoc.value), function() {
        displayTransactionMessage();
    });
}

function formatEggs(eggs) {
    return translateQuantity(eggs / eggstohatch1, 3);
}

function findBaseNum(num) {
    var ret = 0;
    if (num > 1000000) {
        ret = 1000000;
    }
    if (num > 1000000000) {
        ret = 1000000000;
    }
    if (num > 1000000000000) {
        ret = 1000000000000;
    }
    if (num > 1000000000000000) {
        ret = 1000000000000000;
    }
    if (num > 1000000000000000000) {
        ret = 1000000000000000000;
    }
    if (num > 1000000000000000000000) {
        ret = 1000000000000000000000;
    }
    if (num > 1000000000000000000000000) {
        ret = 1000000000000000000000000;
    }
    return ret;
}

function translateQuantity(quantity, precision) {
    baseNum = findBaseNum(quantity);
    return stripDecimals(quantity / baseNum, precision);
}

function formatTrxValue(trxstr) {
    return stripDecimals(numberWithCommas(parseFloat(trxstr).toFixed(6)), 6);
}

function secondsToString(seconds) {
    seconds = Math.max(seconds, 0);
    var numdays = Math.floor(seconds / 86400);
    var numhours = Math.floor((seconds % 86400) / 3600);
    var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
    var numseconds = ((seconds % 86400) % 3600) % 60;
    return numdays + 'd ' + numhours + 'h ' + numminutes + 'm ' + numseconds + 's';
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return false;
}
