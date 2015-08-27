
rockers_structure = {
			  "flute4": {
			    "4": {
			      "node": {},
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 1000,
			      	"Q": 1
			      	},
			      "gain" : 0.4
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
			      	}
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
			      	"type":"lowpass",
			      	"frequency": 5000,
			      	"Q": 1
			      	},
			      "gain" : 1
			    },
			    "8": {
			      "node": {},
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 1000,
			      	"Q": 1
			      	},
			      "gain" : 1
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
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 600,
			      	"Q": 1
			      	},
			      "gain" : 1
			    }
			  },
			  "clarinet": {
			    "16": {
			      "node": {},
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 1000,
			      	"Q": 1
			      	},
			      "gain" : 1
			    }
			  },
			  "bass": {
			    "16": {
			      "node": {},
			      "waveform": "sawtooth",
			      "filter" : {
			      	"type":"lowpass",
			      	"frequency": 400,
			      	"Q": 1
			      	},
			      "gain" : 1
			    }
			  }
			};

note_maps = { 
				4   : {	"C1" : "C2",
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

						"C5" : "C4"},

				8	: { "C1" : "C1",
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

						"C5" : "C4"},

				16	: {	"C1" : "C0",
						"C#1": "C#0",
						"D1" : "D0",
						"D#1": "D#0",
						"E1" : "E0",
						"F1" : "F0",
						"F#1": "F#0",
						"G1" : "G0",
						"G#1": "G#0",
						"A1" : "A0",
						"A#1": "A#0",
						"B1" : "B0",

						"C2" : "C1",
						"C#2": "C#1",
						"D2" : "D1",
						"D#2": "D#1",
						"E2" : "E1",
						"F2" : "F1",
						"F#2": "F#1",
						"G2" : "G1",
						"G#2": "G#1",
						"A2" : "A1",
						"A#2": "A#1",
						"B2" : "B1",

						"C3" : "C2",
						"C#3": "C#2",
						"D3" : "D2",
						"D#3": "D#2",
						"E3" : "E2",
						"F3" : "F2",
						"F#3": "F#2",
						"G3" : "G2",
						"G#3": "G#2",
						"A3" : "A2",
						"A#3": "A#2",
						"B3" : "B2",

						"C4" : "C3",
						"C#4": "C#3",
						"D4" : "D3",
						"D#4": "D#3",
						"E4" : "E3",
						"F4" : "F3",
						"F#4": "F#3",
						"G4" : "G3",
						"G#4": "G#3",
						"A4" : "A3",
						"A#4": "A#3",
						"B4" : "B3",

						"C5" : "C4"},
				};