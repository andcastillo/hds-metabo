'use strict';

var fs = require('fs');
var hds = require('hds');
var Entry = hds.Entry;
var data = []; //this is the input data table as found in TBMN_Urines_MTBX_JW

// Load kinds
require('./kinds');

var connection = hds.init({
    database: require('./mongo.json')
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
    //console.log("Done");
    //process.exit(0);

    var TBMN = Entry.create('project', {
        //id: new Types.ObjectId()
    }, {
        owner: 'metabo@cheminfo.org'
    });
    TBMN.name = 'TBMN Urines MTBX';
    TBMN.description = "Demo project, dataset from kidney disease patient cohort provided by the Group of Computational and Systems Medicine, Imperial College, London";
    TBMN.keywords = ["Kidney disease", "NMR", "Demo"];
    
    TBMN.save().then(createData);
});

function createData() {
    //Create the subject to study
    var nPatients = data.length - 1; //field 0 of data is header
    var nSamples = 1;
    //var promisesSchema = [];
    for(var i=1;i<=nPatients;i++){ //1 indexed because field 0 of data is header
        var patient = TBMN.createChild('patient',{
	    gender: data[i][3],
	    age: data[i][4],
	    weight: data[i][5],
	    height: data[i][6],
	    BMI: data[i][7]
        }).save().then(function(patient){
            console.log("patient created");
	    for (var j=...){
		//create clinic children for diseases
	    }
            for(var j=0;j<nSamples;j++){
                console.log("Creating sample "+j);
                var sample = patient.createChild('sample',{
                    kind:"Urine"
                }).save().then(function (sample) {
		    var nmr1d = sample.createChild('nmr',{
			jcamp: path + data[i][1] + "0";
		    }).save();
		    var nmr2d = sample.createChild('nmr',{
			jcamp: path + data[i][1] + "1";
		    }).save();
		});
		
            }
	});
    }
}
