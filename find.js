'use strict';

var hds = require('hds');
var Entry = hds.Entry;

// Load kinds
require('./kinds');

hds.init({
    database: require('./mongo.json')
}).then(search);

function search() {

    Entry.findOne('experiment', {
        id: 'abc123'
    }).exec().then(function (exp) {
		
		if (exp) {
        	return exp.getChildren({kind: 'nmr'});
		}
		
    }).then(function (children) {

        var nmr = children[0];
        console.log(nmr.solv);
        console.log(nmr.freq);
        nmr.getFile(nmr.jcamp).then(function (file) {
            console.log(file);
            var jcamp = file.content;
            console.log(jcamp.toString().substr(0, 200));
            process.exit();
        });

    });

}
