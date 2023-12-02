// Create prime number OCCAM data with gaps
// we should really create they data in a more common data format (JSON) and then pas that to a JSON-OCCAM-translator/sposer-converter

const fs = require("fs");
const es = require("event-stream");
const to = require("await-to-js").default;
const [pfile] = process.argv.slice(2);

let pnum = 0;
let last = [];
let skip = 5;// must be greater than 0

// primes below 50, and then some
// 2, 3, 5, 7, 11, 13
let iv_mods = [ 3,4,5, 6,7, 8,9,11, 13, 16 ];
let last_prime = 6;
let header = iv_mods.map(m=>`LPm${m}`).concat(iv_mods.map(m=>`Pm${m}`));
//header.unshift("P");
//header.push(`Gap`);
header.push(`Log10(Gap)`);
header.push(`Log2(Gap)`);

let outfile = pfile.replace('.txt','_residue-gaps.csv');

let process_prime = prime => {
    let p = BigInt(prime);
    let next = iv_mods.map(m => p % BigInt(m));

    pnum += 1;

    if(pnum > skip) {
        let g = p - last_prime;
        let data = last.concat(next);

        //data.push(g);
        data.push(g.toString().length);
        data.push(g.toString(2).length);

        last = next;
        last_prime = p;

        return data.join(",");
    }

    last = next;
    last_prime = p;
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

