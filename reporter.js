const mocha       = require ('mocha')
    , ansi        = require ('ansicolor')
    , ololog      = require ('ololog')
    , StackTracey = require ('stacktracey')
    , log         = ololog.configure ({ locate: false })
    , { isBlank } = require ('printable-characters')

/*  ------------------------------------------------------------------------ */

process.on ('uncaughtException',  e => { log.bright.red.error (e) })
process.on ('unhandledRejection', e => { log.bright.red.error (e) })

/*  ------------------------------------------------------------------------ */

const sleep = ms => new Promise (resolve => setTimeout (resolve, ms))

/*  ------------------------------------------------------------------------ */

module.exports = function (runner) {

mocha.reporters.Base.call (this, runner)

const originalImpl = Object.assign ({}, ololog.impl)
const cursorUp     = '\u001b[1A'

StackTracey.resetCache () // when running mocha under --watch, this is needed to re-load the changed sources

runner.on ('suite', ({ title }) => {

    if (title) {
        log.bright (title + ':', '\n')
    }
})

runner.on ('suite end', ({ title, tests }) => {

    if (tests.length) {
        console.log ('')
    }
})

runner.on ('test', test => {
        
    test.logBuffer = ''

    let prevLocation

    ololog.impl.render = text => {

        const lines = text.split ('\n')
        const multiline = lines.length > 1

        const location = new StackTracey ().clean.at (2)
        const locationChanged = prevLocation && !StackTracey.locationsEqual (location, prevLocation)
        prevLocation = location

        test.logBuffer += ((locationChanged || multiline) ? '\n' : '') + text + '\n'
    }

    ;(async () => {
        
        const clock = ['◐', '◓', '◑', '◒']
        
        console.log ('')
        
        for (let i = 0, n = clock.length; !test.state; i++) {

            console.log (ansi.darkGray (cursorUp + clock[i % n] + ' ' + test.title + ' ' + '.'.repeat (i/2 % 5).padEnd (5)))
            await sleep (100)
        }

    }) ()
})

runner.on ('test end', ({ state = undefined, title, logBuffer, only, verbose = false, parent, ...other }) => {

    ololog.impl.render = originalImpl.render

    if (state) {
        
        log.darkGray (cursorUp + { 'passed': '😎', 'failed': '👹' }[state] + ' ',  title, '    ')
        
        const onlyEnabled = parent._onlyTests.length

        while (!verbose && parent) {
            verbose = parent.verbose
            parent = parent.parent
        }

        let show = (onlyEnabled || verbose || (state === 'failed')) && logBuffer
        if (show) {

            const sanitized = logBuffer
                                .split ('\n')
                                .map (line => isBlank (line) ? '' : line)
                                .join ('\n')

            log ('  ', '\n' + sanitized.replace (/\n\n\n+/g, '\n\n').trim () + '\n')
        }
    }
})

runner.on ('fail', (test, err) => {

    if (('actual' in err) && ('expected' in err)) {
        
        log.bright.red.error ('[AssertionError] ' + err.message)
        log.newline ()
        log.red.error ('\tactual:  ', err.actual)
        log.green.error ('\texpected:', err.expected)

    } else {
        log.bright.red.error ('\n', err)            
    }
})
}
