const mocha  = require ('mocha')
    , ansi   = require ('ansicolor')
    , ololog = require ('ololog')
    , log    = ololog.configure ({ locate: false })
    
/*  ------------------------------------------------------------------------ */

process.on ('uncaughtException',  e => { log.bright.red.error (e) })
process.on ('unhandledRejection', e => { log.bright.red.error (e) })

/*  ------------------------------------------------------------------------ */

module.exports = function (runner) {

    mocha.reporters.Base.call (this, runner)

    const logImplRender = ololog.impl.render
    
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

        ololog.impl.render = text => {

            const lines = text.split ('\n')
            const multiline = lines.length > 1
            
            test.logBuffer += (multiline ? `\n${text}\n` : text) + '\n'
        }
    })

    runner.on ('test end', ({ state = undefined, title, logBuffer, only, verbose = false, parent, ...other }) => {

        ololog.impl.render = logImplRender

        if (state) {

            const labels = {
                'passed': '😎',
                'failed': '👹'
            }
            
            log.darkGray (labels[state] + ' ',  title)
            
            const onlyEnabled = parent._onlyTests.length

            while (!verbose && parent) {
                verbose = parent.verbose
                parent = parent.parent
            }

            let show = (onlyEnabled || verbose || (state === 'failed')) && logBuffer
            if (show) {
                log ('  ', ('\n' + logBuffer.trim () + '\n').replace (/\n\n\n/g, '\n\n'))
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
            log.bright.red.error (err)            
        }
    })
}
