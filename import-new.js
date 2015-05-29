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
    s
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
	    //create clinic children for diseases
	    createDiseases();
	    //create nmr objects
	    createSpectra();
	});
    }
}

function createDiseases(){
    console.log("generating clinic history");
    for (var j=8; j<=12;j++){
	if(typeOf(data[i][j]) == "string"){
	    if (parseInt(data[i][j].substring(0,1)) == 1){
		patient.createChild('clinic', {
		    name: data[i][0],
		    info: data[i][j].substring(1,data[i][j].length)
		}).save();
	    }
	}
	else{
	    if(data[i][j] == 1){
		patient.createChild('clinic', {
		    name: data[i][0],
		}).save();
	    }
	}
    }
    for (var j=13; j<=15; j++){
	patient.createChild('clinic' {
	    name: data[i][j]
	}).save();
    }
    console.log("clinic history saved");
}

function createSpectra(){
    console.log("generating sample");
    var sample = patient.createChild('sample',{
        kind:"Urine"
    }).save().then(function (sample) {
	console.log("sample saved");
	console.log("generating NMR spectra");
	var nmr1d = sample.createChild('nmr',{
	    jcamp: [
		{
		    processing: "lowres",
		    jcamp: path // in the original bruker files corresponds to the directory data[i][1] + "0"
		},
		{
		    processing: "highres",
		    jcamp: path // in the original bruker files corresponds to the directory data[i][1] + "0"
		}]}).save();
	var jres = sample.createChild('nmr',{
	    jcamp: [
		{
		    processing: "lowres",
		    jcamp: path // in the original bruker files corresponds to the directory data[i][1] + "1"
		},
		{
		    processing: "highres",
		    jcamp: path // in the original bruker files corresponds to the directory data[i][1] + "1"
		}]}).save();
		
	}).save();
    console.log("spectra saved");
}

