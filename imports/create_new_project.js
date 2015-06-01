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
        console.log("Project created");
        process.exit(0);
    });
    /*
        //Create the subject to study
        var nEntities = 3;
        var nSamples = 3;
        var promisesSchema = new Array(nEntities);
        for(var i=0;i<nEntities;i++){
            //We don't know yet the persons.
            promisesSchema[i] = TBMN.createChild('entity',{
                kindX:"patient"
            }).save();
            console.log("Ok")
        };

        var promises = new Array(nEntities*nSamples);
        Promise.all(promisesSchema).then(function(entities){
            var index = 0;
            for(var i=0;i<entities.length;i++){
                for(var j=0;j<nSamples;j++){
                    promises[index++] = entities[i].createChild('sample',{
                        kindX:"urine"
                    }).save();
                }
            }
        });
        Promise.all(promises).then(function(){
            process.exit(0);
        });
    });*/
}
