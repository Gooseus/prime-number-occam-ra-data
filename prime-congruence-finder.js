const fs = require("fs");
const es = require("event-stream");
const iv_rules = [
    //[ 1, 3, 2 ],
    //[ 7, 11, 15 ],
    [1,7],
    [7,11],
    [2,15]
];

const dv_rule = [3, 10];

const [pfile] = process.argv.slice(2);

const prime_stream = fs.createReadStream(pfile);

let rnum = 0;
let dnum = 0;
let last = null;
let pass = false;

let big_mod = (n,m) => BigInt(n) % BigInt(m);
let big_diff = (a,b) => BigInt(a) - BigInt(b);

const prime_proc = prime => {
    if(!prime) return;
    prime = BigInt(prime);

    pass = iv_rules.map(rule=>big_mod(prime,rule[1])==rule[0]).reduce((b,a)=>a&&b,true);

    if(last) {
        if(big_mod(prime,dv_rule[1]) == dv_rule[0]) {
            let diff = (prime - last);
            console.log(`${last}\t${prime}\t${diff}`);
            dnum += 1;
        }
    }

    if(pass) {
        last = prime;
        rnum += 1;
        pass = false;
    } else {
        last = null;
    }
    return;
};

let err = err => console.log('error', err);
let fin = () => console.log('finished.', `passed=>${rnum}`,`number=>${dnum}`);

let split = es.split(/[(\t?)\n]/);
let map = es.mapSync(prime_proc).on('error',err);//.on('end',fin);

prime_stream.on("error",err).on("finish", fin);
prime_stream.pipe(split).pipe(map);
