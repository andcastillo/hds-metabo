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
var spectraPath = "/usr/local/script/data/test\@patiny.com/Research/Metabo/data/Manuja_urine/";
/**
 * This is a simple example where each patient has only 1 sample
 * @param data
 */
function onSuccess(data) {

    Entry.findOne('project', {
        _id: "5570e2201171122d2f772df6"
    }).exec().then(function (TBMN) {
        if (TBMN) {
            //Create the subject to study
            var nPatients = 2;//data.length - 1; //field 0 of data is header
            var header = data[0];
            var promises = new Array(nPatients);

            for (var i = 1; i <= nPatients; i++) { //1 indexed because field 0 of data is header
                var row = data[i];
                promises[i - 1] = TBMN.createChild('patient', {
                    gender: row[3],
                    age: row[4],
                    weight: row[5],
                    height: row[6],
                    BMI: row[7]
                }).save();//.then(console.log("Ok"));
            }

            //console.log(promises);
            Promise.all(promises).then(function (patients) {
                console.log("Patients created");
                var infos = [];
                for (var j = 1; j <= nPatients; j++) {
                    infos.push(createDiseases(patients[j-1], header, data[j]));
                    infos.push(createSample(patients[j-1], data[j]));
                }

                Promise.all(infos).then(function (stack) {
                    var morePromises = [];
                    for (var k = 1; k <= nPatients; k++) {
                        createSpectra(stack[2*k-1],data[j],morePromises);
                    }
                    Promise.all(morePromises).then(function(oo){
                        console.log("Process finished!!!");
                        process.exit(0);
                    });
                });
            });
        }
    })
}

function onError(){
    console.log("Error, as usual, unexpected");
}

function createDiseases(patient, header, row) {
    var diagnosis = [];
    var treatments = [];
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

        controls.push(control);
    }
    console.log("clinic history created");
    return patient.createChild('clinic',{diagnosis:diagnosis,controls:controls,treatments:treatments}).save();
}

function createSample(patient) {
    //console.log("generating sample");
    return patient.createChild('urine', {
        info: "",
        date:new Date("01/01/2013")
    }).save();
}

function createSpectra(sample, row, stack) {
    //console.log("generating sample");
    stack.push(sample.createChild("nmr", {
        experiment: "1H",
        name: "pdata/1",
        solv: "Urine",
        nucleus: [ "1H" ],
        freq: [ 600.59 ],
        spectra: [
            {
                processing: "lowres",
                jcamp: {
                    value: fs.readFileSync("../data/fs_read.csv"),//fs.readFileSync(spectraPath+row[1]+"0/pdata/1/zpectrum.jdx"),
                    filename: "h1_"+row[1]+".jdx"
                }
            },
            {
                processing: "highres",
                jcamp: {
                    value: fs.readFileSync("../data/fs_read.csv"),//fs.readFileSync(spectraPath+row[1]+"0/pdata/1/spectrum.jdx"),
                    filename: "zh1_"+row[1]+".jdx"
                }
            }
        ]
    }).save());

    stack.push(sample.createChild('nmr', {
        experiment: "JRES",
        name: "pdata/1",
        solv: "Urine",
        nucleus: [ "1H" ],
        freq: [ 600.59 ],
        spectra: [
            {
                processing: "lowres",
                jcamp: {
                    value: fs.readFileSync("../data/fs_read.csv"),//fs.readFileSync(spectraPath+row[1]+"1/pdata/1/zpectrum.jdx"),
                    filename: "jres_"+row[1]+".jdx"
                }
            },
            {
                processing: "highres",
                jcamp: {
                    value: fs.readFileSync("../data/fs_read.csv"),//fs.readFileSync(spectraPath+row[1]+"1/pdata/1/spectrum.jdx"),
                    filename: "zjres_"+row[1]+".jdx"
                }
            }
        ]
    }).save());
}

