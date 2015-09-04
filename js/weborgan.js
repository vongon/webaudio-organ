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
				                 width: 600,
				                 height: 150,
				                 octaves: 3,
				                 startNote: 'A3',
				                 whiteNotesColour: 'white',
				                 blackNotesColour: 'black',
				                 hoverColour: '#f3e939'
				            	});
	keyboard.keyDown = function (note, frequency) {
	    farf.keyDown(note);
	}
	keyboard.keyUp = function (note, frequency) {
	    farf.keyUp(note);
	}
}

var organ = new weborgan();