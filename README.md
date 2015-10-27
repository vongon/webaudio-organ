# webaudio-organ
This webapp is an interactive emulation of the Farfisa Fast 3, a vintage analog organ that can be controlled with a USB-MIDI controller keyboard. The application was made possible with the Web Audio and Web MIDI api's. The Farfisa Fast 3 is a 1960's era analog transistor organ that is known for it's iconic vintage sound found on the records of artist such as Kraftwerk, Jackson 5, The Ventures, and more!

http://www.farfisaofthefuture.com/
<a href="http://www.farfisaofthefuture.com/" target="_blank"><img alt="farfisaofthefutuer" src="https://cloud.githubusercontent.com/assets/6580936/10120354/7e5cd65e-647c-11e5-8e45-4fda9310ed0e.png"></a>

View here: www.farfisaofthefuture.com

## Install

Via npm: `npm install --save farfisa` or get the `dist/farfisa.min.js` file from this repo.

## Build distribution and run the demo

To build distribution:

1. Clone this repo
2. Install npm
3. Install browserify and uglifyjs: `npm install -g browserify uglifyjs`
4. Run `dist` npm script: `npm run dist`

To run the demo on local:

1. Clone this repo
2. Install npm
3. Install http-server: `npm install -g http-server`
4. Run `server` npm script: `npm run server`
