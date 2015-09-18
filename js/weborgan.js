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
				                 startNote: 'C2',
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


	//MIDI STUFF
    var midi, data;
    // request MIDI access
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({
            sysex: false
        }).then(onMIDISuccess, onMIDIFailure);
    } else {
        alert("No MIDI support in your browser.");
    }

    // midi functions
    function onMIDISuccess( midi ) {
        var midiAccess = midi;
        var selectMIDIIn=document.getElementById("midiIn");

        // clear the MIDI input select
        if(midiAccess.inputs.size > 0){
        	selectMIDIIn.options.length = 0;
    	}

        for (var input of midiAccess.inputs.values()) {
            if (input.name.toString().indexOf("Launchpad") != -1) {
                launchpadFound = true;
                selectMIDIIn.add(new Option(input.name,input.id,true,true));
                midiIn=input;
                midiIn.onmidimessage = onMIDIMessage;
            }
        	else{
            selectMIDIIn.add(new Option(input.name,input.id,false,false));
        	input.onmidimessage = onMIDIMessage;
        	}
        }
    }



    function onMIDIFailure(error) {
        // when we get a failed response, run this code
        console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + error);
    }

    function onMIDIMessage( ev ) {
        data = ev.data; // this gives us our [command/channel, note, velocity] data.
        console.log('MIDI data', data); // MIDI data [144, 63, 73]

        var cmd = ev.data[0] >> 4;
        var channel = ev.data[0] & 0xf;
        var noteNumber = ev.data[1];
        var velocity = 0;
        if (ev.data.length > 2)
          velocity = ev.data[2];

        // MIDI noteon with velocity=0 is the same as noteoff
        if ( cmd==8 || ((cmd==9)&&(velocity==0)) ) { // noteoff
            console.log("note off: "+noteNumber);
        	farf.keyUp(midiNumber[noteNumber]);
        } else if (cmd == 9) { // note on
            console.log("note on: "+noteNumber);
          	farf.keyDown(midiNumber[noteNumber]);
        } else if (cmd == 11) { // controller message
          //controller( noteNumber, velocity);
        } else {
          // probably sysex!
        }
    }

}



var organ = new weborgan();
