// we want to send the proper request to do the OCCAM stuff we want with every file
const to = require("await-to-js").default;
 
const fs = require("fs").promises;
const { promisify } = require("util");
const request = require("request-promise-native");
//const multer = require("multer");
const argv = require("minimist")(process.argv);
const Occam  = require('./occam-node-client');

console.log("args: ", argv);
//const [ input_dir, output_dir ] = process.argv.slice(2);

const [ input, output, dir ] = argv;

const occ = Occam({
                uri:"http://10.0.0.165/weboccam.cgi?action=search&cached=false"
            });

(async (dir) => {
    let err, files, results;

    [err, files] = await to(fs.readdir(dir));
    if(err) return console.log("directory read error", err);

    let started;

    for(var i=0;i<files.length;i++) {
        let f = files[i];
        let r = f.replace(/(\.\w+)?$/,".html");

        console.log("POSTing OCCAM input file:", f, new Date());
        started = Date.now();

        [err, results] = await to(occ.post(input_dir + f, { searchtype: "all" }));
        if(err) {
            console.log("OCCAM request error", err);
            throw err;
        }

        occ.process(results);
        console.log("Results returned and processed in",(Date.now() - started)/1000 + 's');
    }

    return occ.process(results);
})(input_dir)
.catch(err => console.log(err));
