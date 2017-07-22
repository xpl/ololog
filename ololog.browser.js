/*  This gets compiled by
        
        browserify --debug ./ololog.browser.js > ./build/ololog.browser.js  */

window.ololog      = require ('./build/ololog.es5')
window.ansicolor   = require ('ansicolor').nice
window.StackTracey = require ('stacktracey')