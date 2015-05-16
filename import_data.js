'use strict';

var hds = require('hds');
var Entry = hds.Entry;

var person0 = {identification:{typeI:"cc",value:"0000000"},
    name:{first:"fallen",last:"ember"},
    age:29,
    gender:"male",
    race:"black"
};

var person1 = {identification:{typeI:"ce",value:"1111111"},
    name:{first:"mean",last:"kitty"},
    age:34,
    gender:"male",
    race:"white"
};

var person2 = {identification:{typeI:"ti",value:"2222222"},
    name:{first:"doom",last:"slang"},
    age:33,
    gender:"male",
    race:"gray"
};

var blood0 = {info:"Loved blood"};
var blood1 = {info:"Cold blood"};
var blood2 = {info:"Running blood"};

// Load kinds
require('./kinds');

hds.init({
    database: require('./mongo.json')
}).then(search);

function search() {

    Entry.findOne('project', {
        name: 'diagnosisX'
    }).exec().then(function (exp) {

        if (exp) {
            return exp.getChildren({kind: 'entity'});
        }

    }).then(function (children) {
        var saved = new Array(children.length);
        saved[0]=children[0].createChild('person',person0).save();
        saved[1]=children[1].createChild('person',person1).save();
        saved[2]=children[2].createChild('person',person2).save();

        Promise.all(saved)
            .then(function () {
                console.log('Everything saved');
                process.exit(0);
            });
    });

}
