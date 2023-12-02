// Create prime number OCCAM data
// we should really create they data in a more common data format (JSON) and then pas that to a JSON-OCCAM-translator/sposer-converter

const fs = require("fs");
const es = require("event-stream");
const to = require("await-to-js").default;
const [pfile,dvmod] = process.argv.slice(2);

let pnum = 0;
let lp = [];
let skip = 3;
//let modnum = 100;
//let mods = Array.from({length:modnum},(v,i) => i+3);

// list of mods with prime residue class size <= 10
let mods = [ 3,5,7,11,13,15,17,19,21,33,35,39 ];
let header = mods.map(m=>`LPm${m}`);//.concat(mods.map(m=>`Pm${m}`));
header.push(`Pmod${dvmod}`);
let dvint = BigInt(dvmod);

let outfile = pfile.replace('.txt','.csv');

let process_prime = prime => {
    let p = BigInt(prime);
    let data = mods.map(m => p % BigInt(m));
    let dv = p % dvint;
    data.push(dv);

    pnum += 1;

    if(pnum > skip) {
        let next = lp.concat(data).join(",");
        lp = data;
        return next;
    }

    lp = data;
    return '';
};

let process_file = async (file,proc) => {
    let filereader = fs.createReadStream(file);
    return new Promise((resolve,reject) =>{
        let err = err => reject(err);
        let fin = () => {
            resolve(pnum);
        };

        let process_line = line => {
            if(line) {
                let next = proc(line);
                return next ? next+"\n" : "";
            }
            return "";
        };

        let split = es.split(/[(\t?)\n]/);
        let map = es.mapSync(process_line).on('error',err);//.on('end',fin);

        //fs.createReadStream(file)
        filereader.on("error",err).on("finish", fin);
        filereader.pipe(split).pipe(map)
            .pipe(fs.createWriteStream(outfile, { flags:'a' }));
    });
}

(async () => {
    fs.writeFileSync(outfile,header.join(',') + "\n");
    let [err, count ] = await to(process_file(pfile, process_prime));
    if(err) return console.log("error processing primes", err);
    return console.log(`processed ${count} primes.`);
})();

