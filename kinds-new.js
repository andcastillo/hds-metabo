'use strict';

var hds = require('hds');
var Kind = hds.Kind;
var Schema = hds.Schema;

Kind.create('project', {
    name: String,
    description: String,
    keywords: [String]
});

Kind.create('sample', {
    kind: String,
    date: { type: Date },
    info: String
});

Kind.create('patient', {
    identification: {typeI: String, value: String},
    name: {first:String,last:String},
    age: { type: Number, min: 18, max: 65 },
    gender: String,
    race: String,
    weight: Number,
    height: Number,
    BMI: Number
})

Kind.create('clinic', {
    name: String,
    value: Number,
    info: String
}

var jcamp = new Kind.File({
    filename: 'nmr.jdx',
    mimetype: 'chemical/x-jcamp-dx'
});

Kind.create('nmr', {
    solv: String,
    temp: Number,
    jcamp: jcamp,
    nucleus: [ String ],
    freq: [ Number ]
});





Kind.create('entity', {
    kind: String
});

Kind.create('ms', {
    solv: String,
    temp: Number,
    jcamp: jcamp
});

Kind.create('blood',{
    date: { type: Date, default: Date.now },
    info: String,
    lala: { type: Number, ref: 'ms'},
    fafa: [ ms ]
});

Kind.create('diagnosis', {
    date: { type: Date, default: Date.now },
    active: { type:Boolean, default:false },
    description: String
});