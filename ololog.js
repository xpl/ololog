"use strict";

/*  ------------------------------------------------------------------------ */

const O           = Object,
      StackTracey = require ('stacktracey'),
      ansi        = require ('ansicolor'),
      bullet      = require ('string.bullet'),
      stringify   = require ('string.ify'),
      pipez       = require ('pipez')

/*  ------------------------------------------------------------------------ */

const log = module.exports = pipez ({

/*  ------------------------------------------------------------------------ */

    stringify: (args) => args.map (arg => (typeof arg === 'string') ? arg : stringify (arg)),
    concat:    (args) => args.join (' '),
    locate:    (text, {

                    where = (new StackTracey ()).clean.at (4),
                    join  = ((a, sep, b) => (a && b) ? (a + sep + b) : (a || b)),
                    print = ({ calleeShort, fileName = [], line = [] }) => ansi.dim ('(' + join (calleeShort, ' @ ', join (fileName, ':', line)) + ')')

                }) => join (text, ' ', print (where)),

    lines:  (text) => text.split ('\n'),
    indent: (lines, { level = 0, pattern = '\t' }) => lines.map (line => pattern.repeat (level) + line),
    
    time: (lines, { when  = new Date (),
                    print = when => ansi.dim (when.toISOString ()) + ' ' }) => bullet (print (when), lines),

    render: (lines, {

        engine = ((typeof window !== 'undefined') && (window.window === window) && window.navigator)

                            ? (navigator.userAgent.indexOf ('AppleWebKit') >= 0)

                                ? 'webkit'
                                : 'generic'

                            : 'ansi',

        engines = { /* configurable */ },

        defaults = {

            ansi:    line => console.log (line),
            webkit:  line => console.log (...ansi.parse (line).browserConsoleArguments),
            generic: line => console.log (ansi.strip (line))
        }

    }) => lines.forEach (O.assign (defaults, engines)[engine])

/*  ------------------------------------------------------------------------ */

}).configure ({

    time: false // disables 'time' step (until enabled back explicitly)

/*  ------------------------------------------------------------------------ */

}).methods ({

    indent (level) { return this.configure ({ indent: { level: level }}) }
})

/*  ------------------------------------------------------------------------ */

ansi.names.forEach (color => {

    log.methods ({

        get [color] () { return this.configure ({ 'concat+': text => ansi[color] (text) }) }
    })
})

/*  ------------------------------------------------------------------------ */
