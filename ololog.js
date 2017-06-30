"use strict";

/*  ------------------------------------------------------------------------ */

const O                 = Object,
      StackTracey       = require ('stacktracey'),
      ansi              = require ('ansicolor'),
      bullet            = require ('string.bullet'),
      pipez             = require ('pipez'),
      { printableText } = require ('stringpector')

/*  ------------------------------------------------------------------------ */

const stringify = require ('string.ify').configure ({

    formatter (x) {

        if (x instanceof Error) {

            const why           = stringify.limit ((x.message || '').replace (/\r|\n/g, '').trim (), 120),
                  stack         = new StackTracey (x).pretty,
                  stackIndented = stack.split ('\n').map (x => '    ' + x).join ('\n')

            return `[EXCEPTION] ${why}\n\n${stackIndented}\n`
        }
    }
})

/*  ------------------------------------------------------------------------ */

const changeLastNonemptyLine = (lines, fn) => {

    for (let i = lines.length - 1; i >= 0; i--) {

        if ((i === 0) || (printableText (lines[i]).length > 0)) {
            lines[i] = fn (lines[i])
            break;
        }
    }

    return lines
}

/*  ------------------------------------------------------------------------ */

const log = pipez ({

/*  ------------------------------------------------------------------------ */

    stringify: (args, cfg, print = stringify.configure (cfg)) => args.map (arg => (typeof arg === 'string') ? arg : print (arg)),
    
    trim: (tokens, { max = undefined }) => !max ? tokens : tokens.map (t => stringify.limit (t, max)),

    lines: (tokens, { linebreak = '\n' }) => {

        let lines = [[]]

        for (const t of tokens) {
            
            const [first, ...rest] = t.split (linebreak)

            lines[lines.length - 1].push (first)
            lines = lines.concat (rest.map (t => t ? [t] : []))
        }

        return lines
    },

    concat: (lines, { separator = ' ' }) => lines.map (tokens => tokens.join (separator)),

    indent: (lines, { level = 0, pattern = '\t' }) => lines.map (line => pattern.repeat (level) + line),
    
    time: (lines, { when  = new Date (),
                    print = when => ansi.dim (when.toISOString ()) + '\t' }) => bullet (print (when), lines),

    locate: (lines, {

                    where = (new StackTracey ().clean.at (2)),
                    join  = ((a, sep, b) => (a && b) ? (a + sep + b) : (a || b)),
                    print = ({ calleeShort, fileName = [], line = [] }) => ansi.dim ('(' + join (calleeShort, ' @ ', join (fileName, ':', line)) + ')')

                }) => changeLastNonemptyLine (lines, line => join (line, ' ', print (where))),

    join: (lines, { linebreak = '\n' }) => lines.join (linebreak),

    render: (text, {

        engine = ((typeof window !== 'undefined') && (window.window === window) && window.navigator)

                            ? (navigator.userAgent.indexOf ('Chrome') >= 0)

                                ? 'chrome'
                                : 'generic'

                            : 'ansi',

        engines = { /* configurable */ },

        consoleMethod = 'log',

        defaults = {

            ansi:    s => console[consoleMethod] (s),
            chrome:  s => console[consoleMethod] (...ansi.parse (s).asChromeConsoleLogArguments),
            generic: s => console[consoleMethod] (ansi.strip (s))
        },

        initialArguments: [firstArgument]

    }) => ((text && O.assign (defaults, engines)[engine] (text)), firstArgument)

/*  ------------------------------------------------------------------------ */

}).configure ({

    time: false // disables 'time' step (until enabled back explicitly)

/*  ------------------------------------------------------------------------ */

}).methods ({

    indent (level) { return this.configure ({ indent: { level: level }}) },

    get error () { return this.configure ({ render: { consoleMethod: 'error' } }) },
    get warn ()  { return this.configure ({ render: { consoleMethod: 'warn' } }) },
    get info ()  { return this.configure ({ render: { consoleMethod: 'info' } }) },

    get unlimited () { return this.configure ({ stringify: { maxArrayLength: Number.MAX_VALUE, maxDepth: Number.MAX_VALUE } }) },

    get serialize () { return this.before ('render') },
    get deserialize () { return this.from ('render') }
})

/*  ------------------------------------------------------------------------ */

ansi.names.forEach (color => {

    log.methods ({

        get [color] () { return this.configure ({ 'concat+': lines => lines.map (ansi[color]) }) }
    })
})

/*  ------------------------------------------------------------------------ */

module.exports = log

/*  ------------------------------------------------------------------------ */


