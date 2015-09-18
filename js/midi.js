
function midihandler(farfisa){
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
        selectMIDIIn=document.getElementById("midiIn");

        // clear the MIDI input select
        selectMIDIIn.options.length = 0;

        for (var input of midiAccess.inputs.values()) {
            if (input.name.toString().indexOf("Launchpad") != -1) {
                launchpadFound = true;
                selectMIDIIn.add(new Option(input.name,input.id,true,true));
                midiIn=input;
                midiIn.onmidimessage = onMIDIMessage;
            }
        else
            selectMIDIIn.add(new Option(input.name,input.id,false,false));
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
            console.log("note off");
          //noteOff( noteNumber );
        } else if (cmd == 9) { // note on
            console.log("note on");
          //noteOn( noteNumber, velocity);
        } else if (cmd == 11) { // controller message
          //controller( noteNumber, velocity);
        } else {
          // probably sysex!
        }
    }
}

