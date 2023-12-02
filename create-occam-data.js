// Create OCCAM :nominal section from a data file
// Using Streams and Sets means the data file can be pretty  big
const fs = require("fs");
const es = require("event-stream");
const to = require("await-to-js").default;
const [infile,dv] = process.argv.slice(2);

let datafile = infile.replace(/\.\w+$/,'.data');
let headerfile = infile.replace(/\.\w+$/,'.header');
let outfile = infile.replace(/\.\w+$/,'.occam');

let alpha = "abcdefghijklmnopqrstuvwxyz";
let count = 0;
let default_type = 1;
let vars, varnum, varsets;

let alpha_shortname = (i,amod=10) => {
    let id = Math.floor(i/amod);
    let im = i % amod;
    if(id>0) return alpha[alpha.length-id] + alpha_shortname(i-amod*id);
    else return alpha[im];
};

let process_head = head => {
    vars = head.split(',');
    varnum = vars.length;
    varsets = vars.map(v=>new Set());
};

let process_record = rec => {
    if(!rec) return '';

    if(count==0) {
        count++;
        process_head(rec);
        return '';
    }

    count++;
    let cols = rec.split(",");
    for(var i=0; i<varnum; i++) {
        varsets[i].add(cols[i]);
    }

    return rec;
};

let nominal_map = (name,i) => {
    let sname = alpha_shortname(i).replace(/^\w/,a=>a.toUpperCase());
    if(dv && sname==dv) return [ name, varsets[i].size, 2, sname ].join(',');
    else if(sname[0]=='Z') return [ name, varsets[i].size, 0, sname ].join(',');
    return [ name, varsets[i].size, default_type, sname ].join(',');
};

let process_file = async (file,proc) => {
    let datastream = fs.createWriteStream(datafile);

    datastream.write(":data\n");

    return new Promise((resolve,reject) =>{
        let err = err => reject(err);
        let fin = () => resolve(vars.map(nominal_map));

        let split = es.split();
        let join = es.join("\n");
        let map = es.mapSync(process_record).on('error',err).on('end',fin);
        let filter = es.filterSync(line=>!!line);

        fs.createReadStream(file).pipe(split).pipe(map).pipe(filter).pipe(join).pipe(fs.createWriteStream(datafile));
    });
};

(async () => {
    let [err, data ] = await to(process_file(infile));
    if(err) return console.log("Error creating OCCAM nominal section:", err);

    let nominal = data.join("\n");

    console.log("Nominal data:");
    console.log(nominal);
    console.log("");
    console.log("Starting OCCAM file writing.\n");

    //let datastream = fs.createReadStream(datafile);
    let outstream = fs.createWriteStream(headerfile);

    //datastream.on("error", err=> console.log("error with data stream:", err));
    outstream.on("error", err=> console.log("error with output stream:", err));
    outstream.on("finish", ()=> console.log(`Finished processing ${count} lines of data.`));

    outstream.write(":nominal\n");
    outstream.write(nominal);
    outstream.write('\n\n:no-frequency\n');

    //return datastream.pipe(outstream);
})();

