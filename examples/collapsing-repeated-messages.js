/*  ------------------------------------------------------------------------ */

const fs   = require ('fs')
const ansi = require ('ansicolor') // that comes with ololog

/*  ------------------------------------------------------------------------ */

let prevLine
let prevLineCounter = 1

const log = require ('ololog').configure ({

/*  Injects a function before a "render" step            */

    '+render' (text) {

    /*  Only single-line messages are collapsed in this example (for simplicity)    */

        if (text && prevLine && (prevLine === text) && (text.split ('\n').length === 1)) {

            prevLineCounter++
            return '\u001b[1A' + text + ' ' + ansi.darkGray.inverse.dim (` ×${prevLineCounter} `) + '\u001b[K'
        }

        prevLineCounter = 1
        prevLine = text
        return text
    }
})

/*  ------------------------------------------------------------------------ */

log ('a message')
for (let i = 0; i < 7; i++) log ('a repeated message')
log ('end')

/*  ------------------------------------------------------------------------ */