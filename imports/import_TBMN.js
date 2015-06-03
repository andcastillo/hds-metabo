'use strict';

var fs = require('fs');
var csv = require('csv');
var parse = csv.parse;
var transform = require('stream-transform');

var hds = require('hds');
var Entry = hds.Entry;
require('./../kinds');

var output = [];

var parser = parse({delimiter: ','}, function(err, data){
    var connection = hds.init({
        database: require('./../mongo.json')
    });
    connection.then(onSuccess(data), onError);
});

fs.createReadStream('../data/data.csv').pipe(parser);
/**
 * This is a simple example where each patient has only 1 sample
 * @param data
 */
function onSuccess(data) {

    Entry.findOne('project', {
        _id: "5568edafba5c2b7e3f392147"
    }).exec().then(function (TBMN) {
        if (TBMN) {
            //Create the subject to study
            var nPatients = 10;//data.length - 1; //field 0 of data is header
            var nSamples = 1;
            for (var i = 1; i <= nPatients; i++) { //1 indexed because field 0 of data is header
                var row = data[i];
                var patient = TBMN.createChild('patient', {
                    gender:row[3],
                    age: row[4],
                    weight: row[5],
                    height: row[6],
                    BMI: row[7]
                }).save().then(function (patient, row) {
                    console.log("patient created");
                    //create clinic children for diseases
                    createDiseases(patient,row);
                    //create nmr objects
                    createSpectra(patient,row);
                });
            }
            //console.log(TBMN);
            //process.exit(0);
            //return exp.getChildren({kind: 'entity'});
        }

    })
}

function onError(){
    console.log("Error, as usual, unexpected");
}


function createDiseases(patient,row) {
    console.log("generating clinic history");
    for (var j = 8; j <= 12; j++) {
        if (typeOf(row[j]) == "string") {
            if (parseInt(row[j].substring(0, 1)) == 1) {
                patient.createChild('clinic', {
                    name: row[0],
                    info: row[j].substring(1, row[j].length)
                }).save();
            }
        }
        else {
            if (row[j] == 1) {
                patient.createChild('clinic', {
                    name: row[0],
                }).save();
            }
        }
    }

    for (var j = 13; j <= 15; j++) {
        patient.createChild('clinic', { name: row[j] }
        ).save();
    }

    for(var j = 15; j <= 22; j++) {
        patient.createChild('clinic', {
            name: row[0],
            value: row[j]
        }).save();
    }

    console.log("clinic history saved");
}

function createSpectra(patient,row) {
    console.log("generating sample");
    var sample = patient.createChild('sample', {
        kind: "Urine"
    }).save().then(function (sample) {
        console.log("sample saved");
        console.log("generating NMR spectra");
        var nmr1d = sample.createChild('nmr', {
            jcamp: [
                {
                    processing: "lowres",
                    jcamp: path // in the original bruker files corresponds to the directory data[i][1] + "0"
                },
                {
                    processing: "highres",
                    jcamp: path // in the original bruker files corresponds to the directory data[i][1] + "0"
                }]
        }).save();
        var jres = sample.createChild('nmr', {
            jcamp: [
                {
                    processing: "lowres",
                    jcamp: path // in the original bruker files corresponds to the directory data[i][1] + "1"
                },
                {
                    processing: "highres",
                    jcamp: path // in the original bruker files corresponds to the directory data[i][1] + "1"
                }]
        }).save();

    }).save();
    console.log("spectra saved");
}