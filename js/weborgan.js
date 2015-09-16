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
				                 width: 695,
				                 height: 162,
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

	var s = Snap("#farfisa");
	var vibrato = s.selectAll(".vibrato").forEach(function(element){
			element.click(function(){
			var toggle = true;
			if(farf.vibrato.on){
				console.log('turn off vibrato');
				farf.deactivateVibrato();
				toggle = false;
			}else{
				console.log('turn on vibrato');
				farf.activateVibrato();
			}
			vibrato[0].toggleClass("hide", toggle);
			vibrato[1].toggleClass("hide", !toggle);
		});
	});
	
	var speed = s.selectAll(".speed").forEach(function(element){
			element.click(function(){
			var toggle = true;
			if(farf.vibrato.speed == "fast"){
				console.log("make vibrato slow");
				farf.slowVibrato();
			}else{
				console.log("make vibrato fast");
				farf.fastVibrato();
				toggle = false;
			}
			speed[0].toggleClass("hide", toggle);
			speed[1].toggleClass("hide", !toggle);
		});
	});

	var voices = s.selectAll("#voices > g");
	voices.forEach(function(voice){
		console.log("looped");
		var rocker = voice.node.id;
		var state = voice.selectAll("g");
		state.forEach(function(element){
			var toggle = true;
			element.click(function(){
				if(farf.activeRockers.indexOf(rocker) > -1){
					//rocker is active
					console.log("deactivating " + rocker);
					farf.deactivateRocker(rocker);
					toggle = false;
				}else{
					//rocker is deactive
					console.log("activating " + rocker);
					farf.activateRocker(rocker);
				}
				state[0].toggleClass("hide", toggle);
				state[1].toggleClass("hide", !toggle);
			});
		});

			
	});

}

var organ = new weborgan();