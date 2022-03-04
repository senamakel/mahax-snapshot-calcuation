const BigNumber = require('bignumber.js');
const _data = require('./out.json');

const data = _data.sort((a, b) => a.ts - b.ts);

accounts = {};

const area = (x1, y1, x2, y2) => {
    const area1 = 0.5 * x1 * y1;
    const area2 = 0.5 * x2 * y2;

    // console.log('area', x1, y1, x2, y2, area2 - area1);
    return area2 - area1;
};

const year_4 = 365 * 86400 * 4;
const mahax = (amount, start, end) => {
    if (amount ==0 ) return 0;
    return amount * ((end - start) / year_4);
};

data.forEach(d => {
    const acct = accounts[d.from] || {};

    if (!acct.lastAmount) acct.lastAmount = 0;
    if (!acct.area) acct.area = 0;
    if (!acct.mahax) acct.mahax = 0;

    if (acct.lastTimestamp) {
        acct.area += (
            area(
                acct.lastTimestamp, acct.mahax,
                d.ts, acct.mahax,
            )
        );
    }

    if (d.fn === 'Create_lock') {
        acct.startPoint = d.ts;

        acct.lastLockPeriod = Number(d.data.lock_time);
        acct.lastAmount = Number(d.data.amount) / 1e18;

        acct.lastLockDurationDays = (acct.lastLockPeriod - acct.startPoint) / 86400;
        acct.mahax = mahax(acct.lastAmount, acct.startPoint, acct.lastLockPeriod);
    }

    if (d.fn === 'Increase_unlock_time') {
        acct.lastLockPeriod = Number(d.data.lock_time);

        acct.lastLockDurationDays = (acct.lastLockPeriod - acct.startPoint) / 86400;
        acct.mahax = mahax(acct.lastAmount, acct.startPoint, acct.lastLockPeriod);
    }

    if (d.fn === 'Increase_amount') {
        acct.lastAmount += Number(d.data.amount) / 1e18;

        acct.lastLockDurationDays = (acct.lastLockPeriod - acct.startPoint) / 86400;
        acct.mahax = mahax(acct.lastAmount, acct.startPoint, acct.lastLockPeriod);
    }

    if (d.fn === 'Withdraw') {
        acct.startPoint = 0;
        acct.lastLockPeriod = 0;
        acct.lastAmount = 0;
        acct.lastLockDurationDays = 0;
        acct.mahax = 0;
    }

    acct.lastTimestamp = d.ts;
    accounts[d.from] = acct;
    // console.log(acct, d.fn);
});

const keys = Object.keys(accounts);
keys.forEach(key => {
    const acct = accounts[key] || {};
    acct.area += (
        area(
            acct.lastTimestamp, acct.mahax,
            1640542375, acct.mahax,
        )
    );

    console.log(`${key}, ${acct.mahax}, ${acct.area}`);
});
