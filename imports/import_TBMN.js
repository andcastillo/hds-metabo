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
        _id: "556f6ae067b0a7c40d9ffa09"
    }).exec().then(function (TBMN) {
        if (TBMN) {
            //Create the subject to study
            var nPatients = 10;//data.length - 1; //field 0 of data is header
            var nSamples = 1;
            var header = data[0];
            var promises = [];
            var nPromises = nPatients*nSamples;
            for (var i = 1; i <= nPatients; i++) { //1 indexed because field 0 of data is header
                var row = data[i];
                var patient = TBMN.createChild('patient', {
                    gender:row[3],
                    age: row[4],
                    weight: row[5],
                    height: row[6],
                    BMI: row[7]
                }).save().then(function (patient) {
                    console.log("patient created");
                    //create clinic children for diseases
                    createDiseases(patient, header, row).then(function(){
                        nPromises--;
                        console.log(nPromises);
                        if(nPromises == 0){
                            console.log("Ok");
                            process.exit(0);
                        }
                    });
                    //create nmr objects
                    //createSpectra(patient,row);
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

function createDiseases(patient, header, row) {
    console.log("generating clinic history");
    var diagnosis = [];
    var treatments = [];

    console.log(row);
    //Columns 8 to 12: Diabetes,	HT,	Hyperlipidemia,	IHD,	Smoking,
    for (var j = 8; j <= 12; j++) {

        if (row[j] && (typeof row[j] == "string") && row[j].length > 1) {
            try{

                if (parseInt(row[j].substring(0, 1)) == 1) {
                    diagnosis.push({name:header[j],comments:row[j].substring(1, row[j].length)});
                }
            }
            catch(e){
                console.log("We expected a numeric value as first character but it was not found");
            }
        }
        else {
            if (row[j] == 1) {
                diagnosis.push({name:header[j]});
            }
        }
    }
    //Columns 13 to 15: Other diseases
    for (var j = 13; j <= 15; j++) {
        if (row[j] && (typeof row[j] == "string") && row[j].length > 1) {
            diagnosis.push({name:row[j].trim()});
        }
    }

    //Save the treatments. We don't know the relation among the reported diseases and the treatments
    if(row[16]&&(typeof row[16] ==="string")&&row[16].length>1){
        treatments = row[16].split(",");
    }

    //Define the period
    var period = {from: new Date("01/01/2013"), to: new Date("01/06/2013")};
    var controls = [];
    for(var j = 17; j <= 24; j++) {
        var control = {
            name:header[j].substring(0, header[j].indexOf("(")),
            period:period
        };
        if(row[j] && typeof row[j] ==="numeric" )
            control.numericValue = row[j];
        else{
            if(row[j] && typeof row[j] ==="string" )
                control.stringValue = row[j];
        }
        constrols.push(control);
    }
    console.log("clinic history created");
    return patient.createChild('clinic',{diagnosis:diagnosis,controls:controls,treatments:treatments}).save();
}
/*
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
*/