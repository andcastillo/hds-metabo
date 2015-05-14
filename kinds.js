'use strict';

var hds = require('hds');
var Kind = hds.Kind;

Kind.create('project', {
    id: String,
    name: String,
    description: String,
    keywords: [String]
});

Kind.create('entity', {
    id: String,
	kind: Object
});

Kind.create('sample', {
    id: String,
    kind: Object
});

Kind.create('person', {
    id: String,
    identification: String,
    name: String,
    surname: String,
    age: Number,
    gender: String,
    race: String,
    diagnosis: Object
});

var jcamp = new Kind.File({
    filename: 'nmr.jdx',
    mimetype: 'chemical/x-jcamp-dx'
});

var nmr = Kind.create('nmr', {
    solv: String,
    freq: [Number],
    nucleus:[String],
    type: String,
    jcamp: jcamp
});

var ms = Kind.create('ms', {
    solv: String,
    type: String,
    jcamp: jcamp
});

Kind.create('blood', {
    id: String,
    date: Date,
    spectrumMs: ms,
    spectrumNmr:nmr
});


