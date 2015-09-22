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

	this.playNote = function(note, rocker){
	/**
     * Create and play all oscillators for {rocker} param on {note}
     * @param {note} key pressed
     * @param {rocker} rocker to play
     */	
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

	     		oscillator.start(0);
	     		key.oscillator = oscillator;
	     		key.gainNode = gainNode;
	     		key.voiceName = rocker + ':' + voice;
	     		this.playingNotes[note]["oscillators"].push(key);
     		}
     	}
	}


	this.keyDown = function(note){
	/**
     * Interface for farfisa to start playing a note. 
     * Plays notes through all rockers included in 'activeRockers' structure
     */	
		this.playNote(note, "bass");
		this.playNote(note, "clarinet");
		this.playNote(note, "flute4");
		this.playNote(note, "trumpet");
		this.playNote(note, "flute8");
	}

	this.keyUp = function(note){
	/**
     * Interface for farfisa to stop playing all oscillators for note. 
     */	
    	var keys = this.playingNotes[note].oscillators,
			key, i, now;
		var releaseTime = 0.01;
		for(i=0; keys.length; i++){
			now = this.context.currentTime;
			key = keys.pop();
			key.oscillator.stop(now + releaseTime);

			//create fade out event to avoid key click
			key.gainNode.gain.setValueAtTime(key.gainNode.gain.value, now);
			key.gainNode.gain.exponentialRampToValueAtTime(0.01, now + releaseTime);
			
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





