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


function farfisa(audioContext){
/*
 * Class to generate farfisa keyboard in browser.
 * Pass in a WebAudio audioContext
 */
	this.context = audioContext;
	this.rockers = rockers_structure;


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
			for (var num = 0; num<=5; num++){
				for (var letter = 0; letter < notes.length; letter++){
					var note = notes[letter] + String(num);
					var freq = getFrequencyOfNote(note);
					playingNotes[note] = {	'frequency':freq,
											'oscillators':[],
											4: note_maps[4][note],
											8: note_maps[8][note],
											16: note_maps[16][note]};
				}
			}
		return playingNotes;
	};

	this.playingNotes = createPlayingNotesStructure();

	this.createVoice = function(voice){
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
		outputGain.connect(this.context.destination);

	    return filter;
	};

	this.playNote = function(note, rocker){
	/**
     * Create and play all oscillators for {rocker} param on {note}
     * @param {note} key pressed
     * @param {rocker} rocker to play
     */	
    	var voices = this.rockers[rocker];
     	for(var voice in voices){
     		var audibleNote = this.playingNotes[note][voice];
     		var oscillator = this.context.createOscillator();
     		oscillator.frequency.value = this.playingNotes[audibleNote].frequency;
     		oscillator.type = this.rockers[rocker][voice]["waveform"];
     		oscillator.connect(this.rockers[rocker][voice]["node"]);

     		oscillator.start(0);
     		this.playingNotes[note]["oscillators"].push(oscillator);
     	}
	}


	this.keyDown = function(note){
	/**
     * Interface for farfisa to start playing a note. 
     * Plays notes through all rockers included in 'voiceNodes' structure
     */	
		this.playNote(note, "flute4");
		this.playNote(note, "bass");
	}
	this.keyUp = function(note){
	/**
     * Interface for farfisa to stop playing all oscillators for note. 
     */	
		var oscillators = this.playingNotes[note].oscillators;
		for(var i = 0; i <= oscillators.length; i++){
			var oscillator = oscillators.pop();
			oscillator.stop();
			oscillator.disconnect();
		}
	}
};
farfisa.prototype.initialize = function(){
		var voice = this.rockers["flute4"]["4"];
		voice.node = this.createVoice(voice);
		voice = this.rockers["bass"]["16"];
		voice.node = this.createVoice(voice);
};

