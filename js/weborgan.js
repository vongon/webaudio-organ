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

var midiNumber = {107:'B7',106:'A#7',105:'A7',104:'G#7',103:'G7',102:'F#7',101:'F7',100:'E7',99:'D#7',98:'D7',97:'C#7',96:'C7',95:'B6',94:'A#6',93:'A6',92:'G#6',91:'G6',90:'F#6',89:'F6',88:'E6',87:'D#6',86:'D6',85:'C#6',84:'C6',83:'B5',82:'A#5',81:'A5',80:'G#5',79:'G5',78:'F#5',77:'F5',76:'E5',75:'D#5',74:'D5',73:'C#5',72:'C5',71:'B4',70:'A#4',69:'A4',68:'G#4',67:'G4',66:'F#4',65:'F4',64:'E4',63:'D#4',62:'D4',61:'C#4',60:'C4',59:'B3',58:'A#3',57:'A3',56:'G#3',55:'G3',54:'F#3',53:'F3',52:'E3',51:'D#3',50:'D3',49:'C#3',48:'C3',47:'B2',46:'A#2',45:'A2',44:'G#2',43:'G2',42:'F#2',41:'F2',40:'E2',39:'D#2',38:'D2',37:'C#2',36:'C2',35:'B1',34:'A#1',33:'A1',32:'G#1',31:'G1',30:'F#1',29:'F1',28:'E1',27:'D#1',26:'D1',25:'C#1',24:'C1',23:'B0',22:'A#0',21:'A0'};

function weborgan(){
	this.checkBrowser();
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
	    if(note != ""){ //error in keyboard DIV that calls this method with no note value
	    	farf.keyDown(note);
	    }
	}
	keyboard.keyUp = function (note, frequency) {
	    if(note != ""){
	    	farf.keyUp(note);
	    }
	}

	var s = Snap("#farfisa");
	var vibrato = s.selectAll(".vibrato").forEach(function(element){
			element.click(function(){
			var toggle = true;
			if(farf.vibrato.enabled){
				farf.deactivateVibrato();
				toggle = false;
			}else{
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
				farf.slowVibrato();
			}else{
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
					farf.deactivateRocker(rocker);
					toggle = false;
				}else{
					//rocker is deactive
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
    	var selectMIDIIn=document.getElementById("midiIn");
    	selectMIDIIn.options.length = 0;
    	selectMIDIIn.add(new Option("No MIDI support in this broswer"))
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
        var selectMIDIIn=document.getElementById("midiIn");
    	selectMIDIIn.options.length = 0;
    	selectMIDIIn.add(new Option("MIDI error:" + error))
    }

    function onMIDIMessage( ev ) {
        data = ev.data; // this gives us our [command/channel, note, velocity] data.
        var cmd = ev.data[0] >> 4;
        var channel = ev.data[0] & 0xf;
        var noteNumber = ev.data[1];
        var velocity = 0;
        if (ev.data.length > 2)
          velocity = ev.data[2];

        // MIDI noteon with velocity=0 is the same as noteoff
        if ( cmd==8 || ((cmd==9)&&(velocity==0)) ) { // noteoff
        	farf.keyUp(midiNumber[noteNumber]);
        } else if (cmd == 9) { // note on
          	farf.keyDown(midiNumber[noteNumber]);
        } else if (cmd == 11) { // controller message
          //controller( noteNumber, velocity);
        } else {
          // probably sysex!
        }
    }

}
weborgan.prototype.checkBrowser = function(){
	var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
	var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
	var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
	var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
	var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6
	if(!isChrome){
		$('#checkBrowser').addClass("alert alert-danger");
		$('#checkBrowser').append("<h3>Alert: We reccomend using <a href='http://www.google.com/chrome/' target='_blank'>Google Chrome</a> for best results!</h3>");
	}
}


var organ = new weborgan();
