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
        _id: "557b4fd67262880f6cdec20b"
    }).exec().then(function (TBMN) {
        if (TBMN) {
            //console.log(data.length);
            //Create the subject to study
            var from = data.length/2;
            var to = data.length;//data.length;
            var nPatients = to-from;
            var header = data[0];
            var promises = new Array(nPatients);
            var index = 0;
            try{
                for (var i = from; i < to; i++) { //1 indexed because field 0 of data is header
                    var row = data[i];
                    //console.log(i+ " - "+row[3]+" "+row[4]+" "+row[5]+" "+row[6]+" "+row[7]);
                    promises[index++] = TBMN.createChild('patient', {
                        gender: row[3],
                        age: parseInt(row[4])||0,
                        weight: parseInt(row[5])||0,
                        height: parseInt(row[6])||0,
                        BMI: parseInt(row[7])||0
                    }).save();//.then(console.log("Ok"));*/
                }
            }
            catch(e){
                console.log(e);
            }

            //console.log(promises);
            Promise.all(promises).then(function (patients) {
                console.log("Patients created");
                var infos = [];
                index = 0;
                for (var j = from; j < to; j++) {
                    infos.push(createDiseases(patients[index], header, data[j]));
                    infos.push(createSample(patients[index], data[j]));
                    index++;
                }

                Promise.all(infos).then(function (stack) {
                    var morePromises = [];
                    index = 1;
                    for (var k = from; k < to; k++) {
                        createSpectra(stack[index],data[k],morePromises);
                        index+=2;
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
        zpectrum : {
                    value: fs.readFileSync(spectraPath+row[1]+"0/pdata/1/zpectrum.jdx"),
                    filename: "h1_"+row[1]+".jdx"
                },
        spectrum: {
                    value: fs.readFileSync(spectraPath+row[1]+"0/pdata/1/spectrum.jdx"),
                    filename: "zh1_"+row[1]+".jdx"
                }
    }).save());

    stack.push(sample.createChild('nmr', {
        experiment: "JRES",
        name: "pdata/1",
        solv: "Urine",
        nucleus: [ "1H" ],
        freq: [ 600.59 ],
        spectrum:  {
                    value: fs.readFileSync(spectraPath+row[1]+"1/pdata/1/zpectrum.jdx"),
                    filename: "jres_"+row[1]+".jdx"
                },
        zpectrum:{
                    value: fs.readFileSync(spectraPath+row[1]+"1/pdata/1/spectrum.jdx"),
                    filename: "zjres_"+row[1]+".jdx"
                }
    }).save());
}

