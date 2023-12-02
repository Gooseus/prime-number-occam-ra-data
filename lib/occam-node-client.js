/*
    [Object: null prototype] {
        model: '',
        refmodel: 'default',
        searchtype: 'loopless',
        searchdir: 'default',
        sortby: 'bic',
        searchsortdir: 'descending',
        'alpha-threshold': '0.05',
        searchwidth: '3',
        searchlevels: '7',
        sortreportby: 'information',
        sortdir: 'descending',
        show_h: 'yes',
        show_dlr: 'yes',
        show_pct_dh: 'yes',
        show_aic: 'yes',
        show_bic: 'yes',
        show_alpha: 'yes',
        show_incr_a: 'yes',
        show_pct: 'yes',
        show_pct_cover: 'yes',
        show_pct_miss: 'yes',
        printoptions: 'y',
        skipnominal: 'y',
        batchOutput: '',
        emailSubject: '' }
    [Object: null prototype] {
        data:
        [ { fieldname: 'data',
            originalname: 'primes1K_Pmod3_occam.txt',
            encoding: '7bit',
            mimetype: 'text/plain',
            destination: '.',
            filename: '38a5102d87e79a6b67d1847bb807f9f9',
            path: '38a5102d87e79a6b67d1847bb807f9f9',
            size: 99154 } ] }

*/

const fs = require("fs").promises;
const request = require("request-promise-native");
const cheerio = require('cheerio');

module.exports = function(opts = {}) {
    let default_fields = {
        model: '',
        refmodel: 'default',
        searchtype: 'loopless',
        searchdir: 'default',
        sortby: 'bic',
        searchsortdir: 'descending',
        'alpha-threshold': '0.05',
        searchwidth: '3',
        searchlevels: '7',
        sortreportby: 'information',
        sortdir: 'descending',
        show_h: 'yes',
        show_dlr: 'yes',
        show_pct_dh: 'yes',
        show_aic: 'yes',
        show_bic: 'yes',
        show_alpha: 'yes',
        show_incr_a: 'yes',
        show_pct: 'yes',
        show_pct_cover: 'yes',
        show_pct_miss: 'yes',
        printoptions: 'y',
        skipnominal: 'y',
        batchOutput: '',
        emailSubject: '',
    };

    post = async (file, fields) => {
        let formData = {
            data: {
                value: fs.createReadStream(file),
                options: {
                    filename: file,
                    contentType: 'text/plain'
                }
            }
        };

        let params = {
            method: "POST",
            uri: opts.uri || "http://10.0.101.65/",
            // "http://localhost:6789/", <== why was it this?
            formData: Object.assign({},default_fields,fields,formData),
            headers: {}
        };

        [err, results] = await to(request(params));
        if(err) throw err;
        return results;
    };

    let process = async (files) => {
        files.map(r => {
            [err, results] = await to(fs.writeFile(output_dir + r, results));
            if(err) {
                console.log("Results writing error", err);
                throw err;
            }
        });


        return true;
    };

    return { post, process };
};
