const fs = require('fs');
var Web3 = require('web3');

const data = fs.readFileSync('./data.csv');
const lines = data.toString().split('\r\n');
const parsedLines = lines.map(l => l.split(','));

const finalData = parsedLines.map(l => ({
    hash: l[0],
    blockNumber: l[1],
    ts: l[2],
    from: l[4],
    to: l[4],
    fn: l[15]
}));


var web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mainnet.infura.io/v3/3f9967d704884ac0b0136b98e5534f55')); // your web3 provider
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const parse = async (lines) => {
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const tx = await web3.eth.getTransaction(line.hash);
        console.log('fuck', tx, line.hash);

        await wait(1000);

        let tx_data = tx.input;
        let input_data = '0x' + tx_data.slice(10);  // get only data without function selector

        if (line.fn === 'Create_lock') {
            let params = web3.eth.abi.decodeParameters(['uint256', 'uint256'], input_data);
            line.data = {
                amount: params[0],
                lock_time: params[1]
            };
        }

        if (line.fn === 'Increase_unlock_time') {
            let params = web3.eth.abi.decodeParameters(['uint256'], input_data);
            line.data = {
                lock_time: params[0]
            };
        }

        if (line.fn === 'Increase_amount') {
            let params = web3.eth.abi.decodeParameters(['uint256'], input_data);
            line.data = {
                amount: params[0]
            };
        }

        fs.writeFileSync("out.json", JSON.stringify(lines, null, 2));
    }


};

parse(finalData);
