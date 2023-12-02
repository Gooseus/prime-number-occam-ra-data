const fs = require("fs");
const es = require("event-stream");
const [pfile] = process.argv.slice(2);

let last;
let count = 0;
let dict = {};

let process_prime = prime => {
    if(prime) {
        let next = BigInt(prime);
        if(last) {
            let gap = (next - last).toString();
            if(!dict[gap]) dict[gap] = 0;
            count += 1;
            dict[gap] += 1;
        }
        last = next;
    }
};

let filereader = fs.createReadStream(pfile);
let err = err => console.log(err);
let finish = () => {
    Object.keys(dict).sort((a,b) => {
        if(dict[a]==dict[b]) return 0;
        return dict[a] < dict[b] ? 1 : -1;
    }).forEach(g => {
        console.log(g,"\t",dict[g]);
    });
    console.log("finished.", `${count} total gaps.`);
};
let split = es.split(/[(\t?)\n]/);
let map = es.mapSync(process_prime).on('error',err);

(async () => {
    console.log("start reading: ", pfile);
    filereader.on("error",err).on("end", finish);
    filereader.pipe(split).pipe(map);
})();

