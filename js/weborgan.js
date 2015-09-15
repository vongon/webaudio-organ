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
function weborgan(){

	function declareContext(){
		/*
		 * Delcares the audio context for all browsers known to support WebAudio API
		 */
		var contextClass = (window.AudioContext ||
							window.webkitAudioContext ||
							window.mozAudioContext ||
							window.oAudioContext ||
							window.msAudioContext);
		if(contextClass){
			//Web Audio API is available.
			return new contextClass();
		} else {
			//Web Audio API is not available.
			alert('Web Audio API does not seem to be available in this browser,'
			 + 'please try a more recent version of Chrome or Safari.');
		}
	}

	var context = declareContext();
	var farf = new farfisa(context);
	var keyboard = new QwertyHancock({
				                 id: 'keyboard',
				                 width: 690,
				                 height: 158,
				                 octaves: 4,
				                 startNote: 'A2',
				                 whiteNotesColour: '',
				                 blackNotesColour: '',
				                 hoverColour: ''
				            	});
	keyboard.keyDown = function (note, frequency) {
	    farf.keyDown(note);
	}
	keyboard.keyUp = function (note, frequency) {
	    farf.keyUp(note);
	}

	var s = Snap("#svgfarfisa");
	var vibrato = s.select("#vibrato");
	vibrato.click(function(){
		if(farf.vibrato.on){
			//turning vibrato on
			console.log('turn off vibrato');
			farf.deactivateVibrato();
		}else{
			//turning vibrato off
			console.log('turn on vibrato');
			farf.activateVibrato();
		}
	});
	var vibrato_speed = s.select("#vibrato_speed");
	vibrato_speed.click(function(){
		if(farf.vibrato.speed == "fast"){
			console.log("make vibrato slow");
			farf.slowVibrato();
		}else{
			console.log("make vibrato fast");
			farf.fastVibrato();
		}
	});
	var voices = s.selectAll("#voices > rect");
	voices.forEach(function(element){
		element.click(function(){
			var rocker = this.node.id;
			if(farf.activeRockers.indexOf(rocker) > -1){
				//rocker is active
				console.log("deactivating " + rocker);
				farf.deactivateRocker(rocker);
			}else{
				//rocker is deactive
				console.log("activating " + rocker);
				farf.activateRocker(rocker);
			}
		});
	});

}

var organ = new weborgan();