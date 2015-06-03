'use strict';

var hds = require('hds');
var Kind = hds.Kind;
var Schema = hds.Schema;

Kind.create('project', {
    name: String,
    description: String,
    keywords: [String]
});

Kind.create('entity', {
    kindX: String
});

Kind.create('sample', {
    kindX: String
});

Kind.create('urine', {
    info: String,
    date: Date
});

Kind.create('patient', {
    identification: {typeI: String, value: String},
    name: {first:String,last:String},
    age: Number,
    gender: String,
    race: String,
    weight: Number,
    height: Number,
    BMI: Number
})

Kind.create('clinic', {
    diagnosis: [{name:String, procedure: [String], comments:String}],
    controls: [{name:String, period: {from: Date, to: Date}, numericValue: Number, stringValue: String}],
    treatments:[String]
});

var jcamp = new Kind.File({
    filename: 'nmr.jdx',
    mimetype: 'chemical/x-jcamp-dx'
});

Kind.create('nmr', {
    experiment: String,
    name: String,
    solv: String,
    temp: Number,
    jcamp: [{processing: String, jcamp: {type:Number,ref:"jcamp"}}],
    nucleus: [ String ],
    freq: [ Number ]
});

/*******Not used*********/
/*Kind.create('ms', {
    solv: String,
    temp: Number,
    jcamp: jcamp
});*/
