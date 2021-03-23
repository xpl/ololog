"use strict";

/*  ------------------------------------------------------------------------ */

const O                 = Object
    , StackTracey       = require ('stacktracey')
    , ansi              = require ('ansicolor')
    , bullet            = require ('string.bullet')
    , pipez             = require ('pipez')

/*  ------------------------------------------------------------------------ */


const stringify = require ('string.ify').configure ({

    formatter (x, stringify) {

        if ((x instanceof Error) && !(typeof Symbol !== 'undefined' && x[Symbol.for ('String.ify')])) {

            if (stringify.state.depth > 0) return `<Error: ${x.message}>` // prevents unwanted pretty printing for Errors that are properties of complex objects

            const indent        = '    '
                , why           = stringify.limit ((x.message || '').replace (/\r|\n/g, '').trim (), stringify.state.maxErrorMessageLength || 120)
                , stack         = new StackTracey (x).withSources ().asTable ()
                , stackIndented = stack.split ('\n').map (x => indent + x).join ('\n')
                , isAssertion = ('actual' in x) && ('expected' in x)
                , type        = x.constructor.name || 'Error'

            if (isAssertion) {

                const str = stringify.configure ({ maxStringLength: Number.MAX_VALUE, maxDepth: 8 })
                
                let actual   = bullet (indent + 'actual:   ', str (x.actual))
                  , expected = bullet (indent + 'expected: ', str (x.expected))

                if ((actual.split ('\n').length > 1) || (expected.split ('\n').length > 1)) // if multiline actual/expected, need extra whitespace inbetween
                    actual += '\n'

                return `[${type}] ${why}\n\n${ansi.red (actual)}\n${ansi.green (expected)}\n\n${stackIndented}\n`
                
            } else {
                return `[${type}] ${why}\n\n${stackIndented}\n`
            }
        }
    }
})

/*  ------------------------------------------------------------------------ */

const { isBlank, blank } = require ('printable-characters')

    , changeLastNonemptyLine = (lines, fn) => {

        for (let i = lines.length - 1; i >= 0; i--) {
            
            if ((i === 0) || !isBlank (lines[i])) {
                
                lines[i] = fn (lines[i])
                break;
            }
        }
        return lines
    }

/*  ------------------------------------------------------------------------ */

const log = pipez ({

/*  ------------------------------------------------------------------------ */

    stringify: (args, cfg, print = cfg.print || stringify.configure (cfg)) => args.map (arg => (typeof arg === 'string') ? arg : print (arg)),
    
    trim: (tokens, { max = undefined }) => !max ? tokens : tokens.map (t => stringify.limit (t, max)),

    lines: (tokens, { linebreak = '\n' }) => {

        let lines = [[]]
        let leftPad = []

        for (const t of tokens) {

            const [first, ...rest] = t.split (linebreak)

            lines[lines.length - 1].push (first)
            lines = [...lines, ...rest.map (t => t ? [...leftPad, t] : [])]

            const pad = blank (!rest.length ? t : rest[rest.length - 1])
            
            if (pad) { leftPad.push (pad) }
        }

        return lines
    },

    concat: (lines, { separator = ' ' }) => lines.map (tokens => tokens.join (separator)),

    indent: (lines, { level = 0, pattern = '\t' }) => lines.map (line => pattern.repeat (level) + line),
    
    tag: (lines, { level = '',
                   levelColor = {
                       'info': ansi.cyan,
                       'warn': ansi.yellow,
                       'debug': ansi.blue,
                       'error': ansi.bright.red } }) => bullet ((levelColor[level] || (s => s)) (level.toUpperCase ().padStart (6) + '\t'), lines),

    time: (lines, { when   = new Date (),
                    format = 'locale',
                    locale = [],
                    options = {},
                    print  = when => ansi.darkGray (
                                        ((format === 'iso')    ? when.toISOString () :
                                        ((format === 'locale') ? when.toLocaleString (locale, options) :
                                        ((format === 'utc')    ? when.toUTCString () :
                                                                 when.toString ())))) + '\t' }) => bullet (print (when), lines),

    locate: (lines, {

                    shift = 0,
                    where = (new StackTracey ().clean ().at (1 + shift)),
                    join  = ((a, sep, b) => (a && b) ? (a + sep + b) : (a || b)),
                    print = ({ calleeShort, fileName = [], line = [] }) => ansi.darkGray ('(' + join (calleeShort, ' @ ', join (fileName, ':', line)) + ')')

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
        }

    }) => ((text && O.assign (defaults, engines)[engine] (text), text)),

    returnValue: (__, { initialArguments: [firstArgument] }) => firstArgument

/*  ------------------------------------------------------------------------ */

}).configure ({

    time: false, // disables some steps (until enabled back explicitly)
    tag:  false

/*  ------------------------------------------------------------------------ */

}).methods ({

    get noop () { return pipez ({ returnValue: args => args[0] }).methods (this.methods_) },
    get null () { return this.noop }, // LEGACY, DEPRECATED (left here for backward compatibility)

    indent (level) { return this.configure ({ indent: { level: level }}) },

    get error () { return this.configure ({ tag: { level: 'error' }, render: { consoleMethod: 'error' } }) },
    get warn ()  { return this.configure ({ tag: { level: 'warn' },  render: { consoleMethod: 'warn' } }) },
    get info ()  { return this.configure ({ tag: { level: 'info' },  render: { consoleMethod: 'info' } }) },
    get debug ()  { return this.configure ({ tag: { level: 'debug' },  render: { consoleMethod: 'debug' } }) },

    maxArrayLength (n)  { return this.configure ({ stringify: { maxArrayLength: n } }) },
    maxObjectLength (n) { return this.configure ({ stringify: { maxObjectLength: n } }) },
    maxDepth (n)        { return this.configure ({ stringify: { maxDepth: n } }) },
    maxLength (n)       { return this.configure ({ stringify: { maxLength: n } }) },
    
    get unlimited () { return this.configure ({ stringify: { maxStringLength: Number.MAX_VALUE,
                                                             maxObjectLength: Number.MAX_VALUE,
                                                             maxArrayLength: Number.MAX_VALUE,
                                                             maxDepth: Number.MAX_VALUE,
                                                             maxErrorMessageLength: Number.MAX_VALUE } }) },

    get noPretty () { return this.configure ({ stringify: { pretty: false } }) },
    get noFancy () { return this.configure ({ stringify: { fancy: false } }) },
    get noRightAlignKeys () { return this.configure ({ stringify: { rightAlignKeys: false } }) },
    get noLocate () { return this.configure ({ locate: false }) },
    precision (n) { return this.configure ({ stringify: { precision: n } }) },

    get serialize () { return this.before ('render') },
    get deserialize () { return this.from ('render') },

    newline () { return this.from ('join')(['']) },

    handleNodeErrors () {
        process.on ('uncaughtException',  e => { this.bright.red.error.noLocate (e); process.exit (1) })
        process.on ('unhandledRejection', e => { this.bright.red.error.noLocate (e); process.exit (1) })
        return this
    }
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


