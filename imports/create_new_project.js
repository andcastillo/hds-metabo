'use strict';

var fs = require('fs');
var hds = require('hds');
var Entry = hds.Entry;
var data = []; //this is the input data table as found in TBMN_Urines_MTBX_JW

// Load kinds
require('./../kinds');

var connection = hds.init({
    database: require('./../mongo.json')
});

connection.then(onSuccess, onError);

function onSuccess() {
	hds.dropDatabase().then(startImport);
}

function onError(e) {
	console.error(e);
	process.exit(1);
}

function startImport() {
    var TBMN = Entry.create('project', {
        //id: new Types.ObjectId()
    }, {
        owner: 'metabo@cheminfo.org'
    });
    TBMN.name = 'TBMN Urines MTBX';
    TBMN.description = "Demo project, dataset from kidney disease patient cohort provided by the Group of Computational and Systems Medicine, Imperial College, London";
    TBMN.keywords = ["Kidney disease", "NMR", "Demo"];
    TBMN.save().then(function() {
        console.log("Project created ");
        console.log(TBMN);
        process.exit(0);
    });
}
