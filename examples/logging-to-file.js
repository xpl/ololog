/*  ------------------------------------------------------------------------ */

const fs   = require ('fs')
const ansi = require ('ansicolor') // that comes with ololog

/*  ------------------------------------------------------------------------ */

const log = require ('ololog').configure ({

/*  Injects a function after the "render" step            */

    'render+' (text, { consoleMethod = '' }) {

        if (text) {

            const strippedText = ansi.strip (text).trim () + '\n' // remove ANSI codes

        /*  Writes to the file only if .info or .error or .warn has been specified.  */

            if (consoleMethod) {

                fs.appendFileSync ('info.log', strippedText)

            /*  Writes .error and .warn calls to a separate file   */

                if ((consoleMethod === 'error') || (consoleMethod === 'warn')) {

                    fs.appendFileSync ('error.log', strippedText)
                }
            }
        }

        return text
    }
})

/*  ------------------------------------------------------------------------ */

log ("this isn't going to a file!")

log.info ("goes to info.log")
log.warn ("goes to info.log and error.log (a warning)")
log.error ("goes to info.log and error.log (an error)")

log.red.info ("ANSI codes are stripped when writing to a file")

/*  ------------------------------------------------------------------------ */
