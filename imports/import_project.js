'use strict';

var fs = require('fs');
var hds = require('hds');
var Entry = hds.Entry;

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
    //console.log("Done");
    //process.exit(0);

    var experiment = Entry.create('project', {
        //id: new Types.ObjectId()
    }, {
        owner: 'metabo@cheminfo.org'
    });
	experiment.name = 'diagnosisY';
    experiment.description = "This project aims to detect the Y condition in elder people.";
    experiment.keywords = ["Y", "South Murica", "elder", "illness"];

    experiment.save().then(createStudyShema);

    function createStudyShema() {

        //Create the subject to study
        var nEntities = 3;
        var nSamples = 3;
        //var promisesSchema = [];
        for(var i=0;i<nEntities;i++){
            //We don't know yet the persons.
            var entity = experiment.createChild('entity',{
                kind:"person"
            }).save().then(function(entity){
                console.log("entity created");
                for(var j=0;j<nSamples;j++){
                    console.log("Creating sample "+j);
                    var sample = entity.createChild('sample',{
                        kind:"blood"
                    }).save().then(function () {
                        console.log('Everything saved');
                    });
                }
            });
        };
        //process.exit(0);
    }
}
