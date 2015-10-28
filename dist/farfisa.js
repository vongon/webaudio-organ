(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Ryan J McGill
 * 2015
 * Web Audio Organ v1.0
 *
 * Licensed under the MIT License
 * http://opensource.org/licenses/mit-license.php
 *
 */
"use strict";

var rockers_structure = require('./rockers.js')
var note_maps = require('./note-maps.js')

function farfisa(audioContext){
/*
 * Class to generate farfisa keyboard in browser.
 * Pass in a WebAudio audioContext
 */
	this.context = audioContext;
	this.rockers = rockers_structure;
	this.activeRockers = ["clarinet","flute4"];
	this.outputGain = {};
	this.vibratoAmt = 30.0;
	this.vibratoFast = 7.0;
	this.vibratoSlow = 5.0;
	this.outputGainLevel = 0.25;


    var getFrequencyOfNote = function (note) {
    /**
     * Get frequency of a given note.
     * @param  {string} note Musical note to convert into hertz.
     * @return {number} Frequency of note in hertz.
     */
        var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
            key_number,
            octave;

        if (note.length === 3) {
            octave = note.charAt(2);
        } else {
            octave = note.charAt(1);
        }

        key_number = notes.indexOf(note.slice(0, -1));

        if (key_number < 3) {
            key_number = key_number + 12 + ((octave - 1) * 12) + 1;
        } else {
            key_number = key_number + ((octave - 1) * 12) + 1;
        }

        return 440 * Math.pow(2, (key_number - 49) / 12);
    };

 	var createPlayingNotesStructure = function(){
	/**
     * Create structure to store oscillators of sounding notes
     * @return {object} structure to store sounding oscillators per key
     */
		var playingNotes = {}
		var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
			for (var num = 0; num<=7; num++){
				for (var letter = 0; letter < notes.length; letter++){
					var note = notes[letter] + String(num);
					var freq = getFrequencyOfNote(note);
					playingNotes[note] = {
									'frequency':freq,
									'oscillators':[],
									4: note_maps[4][note],
									8: note_maps[8][note],
									16: note_maps[16][note]
								};
				}
			}
		return playingNotes;
	};

	this.playingNotes = createPlayingNotesStructure();

	this.createVoice = function(voice, output){
	/**
     * Create gain/filter flow for {voice}
     * @param {voice} voice object containing properties for gain/filter flow
     * @return {audioNode} connection point to voice
     */
	    var filter = this.context.createBiquadFilter();
		filter.type = voice.filter.type;
		filter.frequency.value = voice.filter.frequency;
		filter.Q.value = voice.filter.Q;

		var outputGain = this.context.createGain()
		outputGain.gain.value = voice.gain;

		filter.connect(outputGain);
		outputGain.connect(output);

	    return filter;
	};

	this.playNote = function(note, rocker, delay){
	/**
     * Create and play all oscillators for {rocker} param on {note}
     * @param {note} key pressed
     * @param {rocker} rocker to play
     */
		 	delay = delay || 0
    	var voices = this.rockers[rocker];
    	var vibrato = this.vibrato.gainNode;

     	for(var voice in voices){
     		if(voice != "output"){
	     		var key = {};
	     		var audibleNote = this.playingNotes[note][voice];
	     		var oscillator = this.context.createOscillator();
	     		var gainNode = this.context.createGain();

	     		oscillator.frequency.value = this.playingNotes[audibleNote].frequency;
	     		oscillator.type = this.rockers[rocker][voice]["waveform"];
	     		vibrato.connect(oscillator.detune);

	     		oscillator.connect(gainNode);
	     		gainNode.connect(this.rockers[rocker][voice]["node"]);

	     		oscillator.start(this.context.currentTime + delay);
	     		key.oscillator = oscillator;
	     		key.gainNode = gainNode;
	     		key.voiceName = rocker + ':' + voice;
	     		this.playingNotes[note]["oscillators"].push(key);
     		}
     	}
	}


	this.keyDown = function(note, delay){
	/**
     * Interface for farfisa to start playing a note.
     * Plays notes through all rockers included in 'activeRockers' structure
     */
		this.playNote(note, "bass", delay);
		this.playNote(note, "clarinet", delay);
		this.playNote(note, "flute4", delay);
		this.playNote(note, "trumpet", delay);
		this.playNote(note, "flute8", delay);
	}

	/**
	 * Stop the sound of the given note
	 *
	 * @param {String} note - the note to stop
	 * @param {Float} delay - (Optional) stop after delay seconds
	 */
	this.keyUp = function(note, delay){
	/**
     * Interface for farfisa to stop playing all oscillators for note.
     */
    	var keys = this.playingNotes[note].oscillators,
			key, i, when;
		var releaseTime = 0.01;
		delay = delay || 0
		for(i=0; keys.length; i++){
			when = this.context.currentTime + delay;
			key = keys.pop();
			key.oscillator.stop(when + releaseTime);

			//create fade out event to avoid key click
			key.gainNode.gain.setValueAtTime(key.gainNode.gain.value, when);
			key.gainNode.gain.exponentialRampToValueAtTime(0.01, when + releaseTime);

			key.oscillator.onended = function(){
			key.oscillator.disconnect();
			key.gainNode.disconnect();
			};
		}
	}
	this.initialize();
};
farfisa.prototype.initialize = function(){
	/**
	 * Initialize voice nodes for organ, automatically called by constructor
	 */
	var rocker, octave, voice, obj;

	this.outputGain = this.context.createGain();
	this.outputGain.connect(this.context.destination);
	this.outputGain.gain.value = this.outputGainLevel;

	for(rocker in this.rockers){
		obj = this.rockers[rocker];
		obj.output = this.context.createGain();
		obj.output.connect(this.outputGain);

		if(this.activeRockers.indexOf(rocker)<0){
			obj.output.gain.value = 0.00;
		}

		for(octave in this.rockers[rocker]){
			if(octave != "output"){
				voice = this.rockers[rocker][octave];
				voice.node = this.createVoice(voice, obj.output);
			}
		}
	}
	this.vibrato = this.createVibrato();
};
farfisa.prototype.createVibrato = function(){
	/*
	 * Initialize vibrato node, automatically called by constructor
	 */
	var lfo = this.context.createOscillator();
	var gainNode = this.context.createGain();
	var enabled = true;
	var speed = "fast";

	lfo.frequency.value = this.vibratoFast;
	lfo.type = "triangle";
	lfo.start(0);

	gainNode.gain.value = this.vibratoAmt;

	lfo.connect(gainNode);
	return {"lfo":lfo, "gainNode":gainNode, "enabled":enabled, "speed":speed};
};
farfisa.prototype.activateVibrato = function(){
	/*
	 * activates vibrato, called by vibrato rocker
	 */
	this.vibrato.gainNode.gain.value = this.vibratoAmt;
	this.vibrato.enabled = true;
};
farfisa.prototype.deactivateVibrato = function(){
	/*
	 * deactivates vibrato, called by vibrato rocker
	 */
	this.vibrato.gainNode.gain.value = 0;
	this.vibrato.enabled = false;
};
farfisa.prototype.slowVibrato = function(){
	/*
	 * make vibrato slow
	 */
	this.vibrato.lfo.frequency.value = this.vibratoSlow;
	this.vibrato.speed = "slow";

}
farfisa.prototype.fastVibrato = function(){
	/*
	 * make vibrato fast
	 */
	 this.vibrato.lfo.frequency.value = this.vibratoFast;
	 this.vibrato.speed = "fast";

}
farfisa.prototype.activateRocker = function(rocker){
	/*
	 * activates voice specified by @rocker, called by voice rocker
	 */
	this.activeRockers.push(rocker);
	this.rockers[rocker].output.gain.value = 1.00;
};
farfisa.prototype.deactivateRocker = function(rocker){
	/*
	 * deactivates voice specified by @rocker, called by voice rocker
	 */
	var index = this.activeRockers.indexOf(rocker);
	if (index < 0) {
		throw "error in deactivateRocker, couldn't find " + rocker;
	};
	this.activeRockers.splice(index,1);
	this.rockers[rocker].output.gain.value = 0.00;
};

if (typeof module === 'object' && module.exports) module.exports = farfisa
if (typeof window !== 'undefined') window.farfisa = farfisa

},{"./note-maps.js":2,"./rockers.js":3}],2:[function(require,module,exports){

module.exports = {
				4   : {	"C1" : "C3",
						"C#1": "C#3",
						"D1" : "D3",
						"D#1": "D#3",
						"E1" : "E3",
						"F1" : "F3",
						"F#1": "F#3",
						"G1" : "G3",
						"G#1": "G#3",
						"A1" : "A3",
						"A#1": "A#3",
						"B1" : "B3",

						"C2" : "C4",
						"C#2": "C#4",
						"D2" : "D4",
						"D#2": "D#4",
						"E2" : "E4",
						"F2" : "F4",
						"F#2": "F#4",
						"G2" : "G4",
						"G#2": "G#4",
						"A2" : "A4",
						"A#2": "A#4",
						"B2" : "B4",

						"C3" : "C5",
						"C#3": "C#5",
						"D3" : "D5",
						"D#3": "D#5",
						"E3" : "E5",
						"F3" : "F5",
						"F#3": "F#5",
						"G3" : "G5",
						"G#3": "G#5",
						"A3" : "A5",
						"A#3": "A#5",
						"B3" : "B5",

						"C4" : "C6",
						"C#4": "C#6",
						"D4" : "D6",
						"D#4": "D#6",
						"E4" : "E6",
						"F4" : "F6",
						"F#4": "F#6",
						"G4" : "G6",
						"G#4": "G#6",
						"A4" : "A6",
						"A#4": "A#6",
						"B4" : "B6",

						"C5" : "C7",
						"C#5": "C#7",
						"D5" : "D7",
						"D#5": "D#7",
						"E5" : "E7",
						"F5" : "F7",
						"F#5": "F#7",
						"G5" : "G7",
						"G#5": "G#7",
						"A5" : "A7",
						"A#5": "A#7",
						"B5" : "B7",

						"C6" : "C7"},

				8   : {	"C1" : "C2",
						"C#1": "C#2",
						"D1" : "D2",
						"D#1": "D#2",
						"E1" : "E2",
						"F1" : "F2",
						"F#1": "F#2",
						"G1" : "G2",
						"G#1": "G#2",
						"A1" : "A2",
						"A#1": "A#2",
						"B1" : "B2",

						"C2" : "C3",
						"C#2": "C#3",
						"D2" : "D3",
						"D#2": "D#3",
						"E2" : "E3",
						"F2" : "F3",
						"F#2": "F#3",
						"G2" : "G3",
						"G#2": "G#3",
						"A2" : "A3",
						"A#2": "A#3",
						"B2" : "B3",

						"C3" : "C4",
						"C#3": "C#4",
						"D3" : "D4",
						"D#3": "D#4",
						"E3" : "E4",
						"F3" : "F4",
						"F#3": "F#4",
						"G3" : "G4",
						"G#3": "G#4",
						"A3" : "A4",
						"A#3": "A#4",
						"B3" : "B4",

						"C4" : "C5",
						"C#4": "C#5",
						"D4" : "D5",
						"D#4": "D#5",
						"E4" : "E5",
						"F4" : "F5",
						"F#4": "F#5",
						"G4" : "G5",
						"G#4": "G#5",
						"A4" : "A5",
						"A#4": "A#5",
						"B4" : "B5",

						"C5" : "C6",
						"C#5": "C#6",
						"D5" : "D6",
						"D#5": "D#6",
						"E5" : "E6",
						"F5" : "F6",
						"F#5": "F#6",
						"G5" : "G6",
						"G#5": "G#6",
						"A5" : "A6",
						"A#5": "A#6",
						"B5" : "B6",

						"C6" : "C6"},

				16  : {	"C1" : "C1",
						"C#1": "C#1",
						"D1" : "D1",
						"D#1": "D#1",
						"E1" : "E1",
						"F1" : "F1",
						"F#1": "F#1",
						"G1" : "G1",
						"G#1": "G#1",
						"A1" : "A1",
						"A#1": "A#1",
						"B1" : "B1",

						"C2" : "C2",
						"C#2": "C#2",
						"D2" : "D2",
						"D#2": "D#2",
						"E2" : "E2",
						"F2" : "F2",
						"F#2": "F#2",
						"G2" : "G2",
						"G#2": "G#2",
						"A2" : "A2",
						"A#2": "A#2",
						"B2" : "B2",

						"C3" : "C3",
						"C#3": "C#3",
						"D3" : "D3",
						"D#3": "D#3",
						"E3" : "E3",
						"F3" : "F3",
						"F#3": "F#3",
						"G3" : "G3",
						"G#3": "G#3",
						"A3" : "A3",
						"A#3": "A#3",
						"B3" : "B3",

						"C4" : "C4",
						"C#4": "C#4",
						"D4" : "D4",
						"D#4": "D#4",
						"E4" : "E4",
						"F4" : "F4",
						"F#4": "F#4",
						"G4" : "G4",
						"G#4": "G#4",
						"A4" : "A4",
						"A#4": "A#4",
						"B4" : "B4",

						"C5" : "C5",
						"C#5": "C#5",
						"D5" : "D5",
						"D#5": "D#5",
						"E5" : "E5",
						"F5" : "F5",
						"F#5": "F#5",
						"G5" : "G5",
						"G#5": "G#5",
						"A5" : "A5",
						"A#5": "A#5",
						"B5" : "B5",

						"C6" : "C6"},
				};

},{}],3:[function(require,module,exports){

module.exports = {
			  "flute4": {
			    "4": {
			      "node": {},
			      "waveform": "triangle",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 4000,
			      	"Q": 1.0
			      	},
			      "gain" : 0.2
			    }
			  },
			  "string": {
			    "4": {
			      "node": {},
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 10000,
			      	"Q": 1
			      	},
			      "gain" : 1.0
			    },
			    "8": {
			      "node": {},
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 10000,
			      	"Q": 1
			      	},
			      "gain" : 1
			    }
			  },
			  "trumpet": {
			    "4": {
			      "node": {},
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"highpass",
			      	"frequency": 8000,
			      	"Q": 1
			      	},
			      "gain" : 0.1
			    },
			    "8": {
			      "node": {},
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 1500,
			      	"Q": 5.0
			      	},
			      "gain" : 0.5
			    }
			  },
			  "oboe": {
			    "4": {
			      "node": {},
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 1000,
			      	"Q": 1
			      	},
			      "gain" : 1
			    },
			    "8": {
			      "node": {},
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 6000,
			      	"Q": 1
			      	},
			      "gain" : 1
			    }
			  },
			  "flute8": {
			    "8": {
			      "node": {},
			      "waveform": "triangle",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 900,
			      	"Q": 1.0
			      	},
			      "gain" : 0.7
			    }
			  },
			  "clarinet": {
			    "16": {
			      "node": {},
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 1100,
			      	"Q": 1.0
			      	},
			      "gain" : 0.7
			    }
			  },
			  "bass": {
			    "16": {
			      "node": {},
			      "waveform": "triangle",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 1000,
			      	"Q": 1
			      	},
			      "gain" : 1.0
			    }
			  }
			};

note_maps = {
				4   : {	"C1" : "C3",
						"C#1": "C#3",
						"D1" : "D3",
						"D#1": "D#3",
						"E1" : "E3",
						"F1" : "F3",
						"F#1": "F#3",
						"G1" : "G3",
						"G#1": "G#3",
						"A1" : "A3",
						"A#1": "A#3",
						"B1" : "B3",

						"C2" : "C4",
						"C#2": "C#4",
						"D2" : "D4",
						"D#2": "D#4",
						"E2" : "E4",
						"F2" : "F4",
						"F#2": "F#4",
						"G2" : "G4",
						"G#2": "G#4",
						"A2" : "A4",
						"A#2": "A#4",
						"B2" : "B4",

						"C3" : "C5",
						"C#3": "C#5",
						"D3" : "D5",
						"D#3": "D#5",
						"E3" : "E5",
						"F3" : "F5",
						"F#3": "F#5",
						"G3" : "G5",
						"G#3": "G#5",
						"A3" : "A5",
						"A#3": "A#5",
						"B3" : "B5",

						"C4" : "C6",
						"C#4": "C#6",
						"D4" : "D6",
						"D#4": "D#6",
						"E4" : "E6",
						"F4" : "F6",
						"F#4": "F#6",
						"G4" : "G6",
						"G#4": "G#6",
						"A4" : "A6",
						"A#4": "A#6",
						"B4" : "B6",

						"C5" : "C7",
						"C#5": "C#7",
						"D5" : "D7",
						"D#5": "D#7",
						"E5" : "E7",
						"F5" : "F7",
						"F#5": "F#7",
						"G5" : "G7",
						"G#5": "G#7",
						"A5" : "A7",
						"A#5": "A#7",
						"B5" : "B7",

						"C6" : "C7"},

				8   : {	"C1" : "C2",
						"C#1": "C#2",
						"D1" : "D2",
						"D#1": "D#2",
						"E1" : "E2",
						"F1" : "F2",
						"F#1": "F#2",
						"G1" : "G2",
						"G#1": "G#2",
						"A1" : "A2",
						"A#1": "A#2",
						"B1" : "B2",

						"C2" : "C3",
						"C#2": "C#3",
						"D2" : "D3",
						"D#2": "D#3",
						"E2" : "E3",
						"F2" : "F3",
						"F#2": "F#3",
						"G2" : "G3",
						"G#2": "G#3",
						"A2" : "A3",
						"A#2": "A#3",
						"B2" : "B3",

						"C3" : "C4",
						"C#3": "C#4",
						"D3" : "D4",
						"D#3": "D#4",
						"E3" : "E4",
						"F3" : "F4",
						"F#3": "F#4",
						"G3" : "G4",
						"G#3": "G#4",
						"A3" : "A4",
						"A#3": "A#4",
						"B3" : "B4",

						"C4" : "C5",
						"C#4": "C#5",
						"D4" : "D5",
						"D#4": "D#5",
						"E4" : "E5",
						"F4" : "F5",
						"F#4": "F#5",
						"G4" : "G5",
						"G#4": "G#5",
						"A4" : "A5",
						"A#4": "A#5",
						"B4" : "B5",

						"C5" : "C6",
						"C#5": "C#6",
						"D5" : "D6",
						"D#5": "D#6",
						"E5" : "E6",
						"F5" : "F6",
						"F#5": "F#6",
						"G5" : "G6",
						"G#5": "G#6",
						"A5" : "A6",
						"A#5": "A#6",
						"B5" : "B6",

						"C6" : "C6"},

				16  : {	"C1" : "C1",
						"C#1": "C#1",
						"D1" : "D1",
						"D#1": "D#1",
						"E1" : "E1",
						"F1" : "F1",
						"F#1": "F#1",
						"G1" : "G1",
						"G#1": "G#1",
						"A1" : "A1",
						"A#1": "A#1",
						"B1" : "B1",

						"C2" : "C2",
						"C#2": "C#2",
						"D2" : "D2",
						"D#2": "D#2",
						"E2" : "E2",
						"F2" : "F2",
						"F#2": "F#2",
						"G2" : "G2",
						"G#2": "G#2",
						"A2" : "A2",
						"A#2": "A#2",
						"B2" : "B2",

						"C3" : "C3",
						"C#3": "C#3",
						"D3" : "D3",
						"D#3": "D#3",
						"E3" : "E3",
						"F3" : "F3",
						"F#3": "F#3",
						"G3" : "G3",
						"G#3": "G#3",
						"A3" : "A3",
						"A#3": "A#3",
						"B3" : "B3",

						"C4" : "C4",
						"C#4": "C#4",
						"D4" : "D4",
						"D#4": "D#4",
						"E4" : "E4",
						"F4" : "F4",
						"F#4": "F#4",
						"G4" : "G4",
						"G#4": "G#4",
						"A4" : "A4",
						"A#4": "A#4",
						"B4" : "B4",

						"C5" : "C5",
						"C#5": "C#5",
						"D5" : "D5",
						"D#5": "D#5",
						"E5" : "E5",
						"F5" : "F5",
						"F#5": "F#5",
						"G5" : "G5",
						"G#5": "G#5",
						"A5" : "A5",
						"A#5": "A#5",
						"B5" : "B5",

						"C6" : "C6"},
				};

},{}]},{},[1]);
