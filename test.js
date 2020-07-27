"use strict";

/*  ------------------------------------------------------------------------ */

const ansicolor = require ('ansicolor').nice
const ololog    = require (process.env.OLOLOG_TEST_FILE)

/*  ------------------------------------------------------------------------ */

const assert = (call, shouldBe = undefined, method = 'log') => {

    let impl = console[method], args 

    try {
        console[method] = function (...args_) { args = args_ }; call () // @hide
    } catch (e) {
        console[method] = impl
        throw e
    } finally {
        console[method] = impl
    }
        
    if (shouldBe) {
        if (!args) { throw new Error (`console.${method} hasn't been called!`) }
        args.should.deep.equal (shouldBe)
    } else {
        if (args) { throw new Error (`console.${method} has been called (unexpectedly)!`) }
    }
}

/*  ------------------------------------------------------------------------ */
                    
require ('chai').should ()

/*  ------------------------------------------------------------------------ */

describe ('Ololog', () => {

    const log = ololog.configure ({ locate: false, time: { format: 'iso', when: new Date ('2017-02-27T12:45:19.951Z') } })

    it ('tokenization / line splitting / left-pad work', () => {

        assert (() => log ('hello\n', 'world', 'line1\nline2\nline3\n'), ['hello\nworld line1\n      line2\n      line3\n'])
    })

    it ('location work', () => {
        
        assert (function hello() {
            ololog.configure ({ locate: true }).bgBrightCyan ('with location\n\n')
        }, ['\u001b[106mwith location\u001b[49m \u001b[90m(hello @ test.js:49)\u001b[39m\n\u001b[106m\u001b[49m\n\u001b[106m\u001b[49m'])

        assert (function hello() {
            require ('./ololog') ('with location')
        }, ['with location \u001b[90m(hello @ test.js:53)\u001b[39m'])
    })

    it ('indent work', () => {

        assert (() => log.configure ({ indent: { level: 3 } }) ('line 1\nline 2\n\nline 3\n\n'), ['\t\t\tline 1\n\t\t\tline 2\n\t\t\t\n\t\t\tline 3\n\t\t\t\n\t\t\t'])
        assert (() => log.indent (3)                           ('line 1\nline 2\n\nline 3\n\n'), ['\t\t\tline 1\n\t\t\tline 2\n\t\t\t\n\t\t\tline 3\n\t\t\t\n\t\t\t'])
    })

    it ('timestamps work', () => {

        const date = new Date ('2017-02-27T12:45:19.951Z')
        const log = ololog.configure ({ locate: false, time: { yes: true, when: date } })

        assert (() => log ('foobar'), [`\u001b[90m${date.toLocaleString ()}\u001b[39m\tfoobar`])

        assert (() => log.configure ({ time: { format: 'locale' }}) ('foobar'), [`\u001b[90m${date.toLocaleString ()}\u001b[39m\tfoobar`])
        assert (() => log.configure ({ time: { format: 'iso' }}) ('foobar'),    ["\u001b[90m2017-02-27T12:45:19.951Z\u001b[39m\tfoobar"])
        assert (() => log.configure ({ time: { format: 'utc' }}) ('foobar'),    ["\u001b[90mMon, 27 Feb 2017 12:45:19 GMT\u001b[39m\tfoobar"])

        assert (() => log.configure ({ time: { format: null }}) ('foobar'),    [`\u001b[90m${date.toString ()}\u001b[39m\tfoobar`])

        assert (() => log.configure ({
            time: {
                format: 'locale',
                locale: 'en-US',
                options: { timeZone: 'America/Denver' }
            }
        }) ('foobar'), [`\u001b[90m${date.toLocaleString ('en-US', { timeZone: 'America/Denver' })}\u001b[39m\tfoobar`])
    })

    it ('timestamps are good with indent', () => {

        const mylog = log.configure ({ time: { yes: true, print: when => when.toUTCString () + ' | ' } })

        assert (() => mylog ('foo\nbar\nbaz'), [
            'Mon, 27 Feb 2017 12:45:19 GMT | foo\n' +
            '                                bar\n' +
            '                                baz'])

        assert (() => mylog.indent (2) ('foo\nbar\nbaz'), [
            'Mon, 27 Feb 2017 12:45:19 GMT | \t\tfoo\n' +
            '                                \t\tbar\n' +
            '                                \t\tbaz'])
    })

    it ('ANSI styles work', () => {

        assert (() => log.magenta     ('hello' + 'bright'.bright),               ['\u001b[35mhello\u001b[22m\u001b[1mbright\u001b[22m\u001b[39m'])
        assert (() => log.bgBrightRed ('hello' + 'cyan'.cyan),                   ['\u001b[101mhello\u001b[36mcyan\u001b[39m\u001b[49m'])
        assert (() => log.inverse     ('hello' + 'underline_dim'.underline.dim), ['\u001b[7mhello\u001b[22m\u001b[2m\u001b[4munderline_dim\u001b[24m\u001b[22m\u001b[27m'])
    })

    it ('ANSI style chaining works', () => {

        assert (() => log.red.bright ('foo'), ["\u001b[22m\u001b[1m\u001b[31mfoo\u001b[39m\u001b[22m"])
    })

    it ('string.ify work', () => {

        assert (() => log.indent (2).green ({ foo: 42, bar: true, qux: 333, qux1: 444, qux2: 555, zap: '123457890' }),

           ["\t\t\u001b[32m{  foo:  42,\u001b[39m\n\t\t\u001b[32m   bar:  true,\u001b[39m\n\t\t\u001b[32m   qux:  333,\u001b[39m\n\t\t\u001b[32m  qux1:  444,\u001b[39m\n\t\t\u001b[32m  qux2:  555,\u001b[39m\n\t\t\u001b[32m   zap: \"123457890\" }\u001b[39m"])

        assert (() => log.configure ({ stringify: { pretty: false } }) ({ foo: 42, bar: true, qux: 333, zap: '123457', long: [1,2,3,4,5,3,4,5,6,7] }),

           ["{ foo: 42, bar: true, qux: 333, zap: \"123457\", long: [1, 2, 3, 4, 5, 3, 4, 5, 6, 7] }"])

    })

    it ('trim works', () => {

        assert (() => log.configure ({ trim: { max: 5 } }) ('1234567890', 'abcdefgh'), ["1234… abcd…"])
    })

    it ('.error / .warn / .info / .debug works', () => {

        assert (() => log.error.red ('this goes to stderr'),
                     ['\u001b[31m' + 'this goes to stderr' + '\u001b[39m'], 'error')

        assert (() => log.warn.red ('this goes to console.warn'),
                     ['\u001b[31m' + 'this goes to console.warn' + '\u001b[39m'], 'warn')

        assert (() => log.info.red ('this goes to console.info'),
                     ['\u001b[31m' + 'this goes to console.info' + '\u001b[39m'], 'info')

        assert (() => log.debug.red ('this goes to console.debug'),
        ['\u001b[31m' + 'this goes to console.debug' + '\u001b[39m'], 'debug')
    })

    it ('formatting Error works', () => {

        const e = new Error ('dummy error')

        log.configure ({ '+render': text => {

            text.indexOf ('[Error] dummy error\n').should.equal (0)
            text.indexOf ('const e = new Error (\'dummy error\')').should.be.gt (0)

        }}) (e)
    })

    it ('does not format Errors that are inside of objects', () => {
        
        const e = new Error ('dummy error')

        log.configure ({ '+render': text => {

            text.should.equal ('{ inner: <Error: dummy error> }')

        }}) ({ inner: e })
    })

    it ('formatting Assertions works', () => {
        
        const err = (() => { try { 'foo'.should.equal ('bar') } catch (e) { return e } }) ()

        log.configure ({ '+render': text => {

            text.startsWith ("[AssertionError] expected 'foo' to equal 'bar'\n\n").should.equal (true)
            text.includes ('actual:   "foo"').should.equal (true)
            text.includes ('expected: "bar"').should.equal (true)
            
            text.includes ("const err = (() => { try { 'foo'.should.equal ('bar') } catch (e) { return e }").should.equal (true)

        }}) (err)
    })

    it ('getting rendered text', () => {

        log.before ('render') ({ foo: 42 }).should.be.equal ('{ foo: 42 }')
    })

    it ('returns its first argument', () => {

        assert (() => log (42)              .should.equal (42), ['42'])
        assert (() => log (42, 'foo', 'bar').should.equal (42), ['42 foo bar'])
    })

    it ('smart newline handling', () => {

        assert (() =>
            log.bright.magenta (
                'this is something:'.yellow, [ "595da547d9b22f23d8228643", "595da547d9b22f23d822863f", "595da547d9b22f23d8228641" ]), ['\u001b[35m\u001b[22m\u001b[1m\u001b[33mthis is something:\u001b[35m [ \"595da547d9b22f23d8228643\",\u001b[22m\u001b[39m\n\u001b[35m\u001b[22m\u001b[1m                     \"595da547d9b22f23d822863f\",\u001b[22m\u001b[39m\n\u001b[35m\u001b[22m\u001b[1m                     \"595da547d9b22f23d8228641\"  ]\u001b[22m\u001b[39m'])

        assert (() =>
            log.bright (
                'this is something:'.yellow, '[ "595da547d9b22f23d8228643",\n  "595da547d9b22f23d822863f",\n  "595da547d9b22f23d8228641"  ]'.cyan,
                                             '[ "595da547d9b22f23d8228643",\n  "595da547d9b22f23d822863f",\n  "595da547d9b22f23d8228641"  ]'.green), ['\u001b[22m\u001b[1m\u001b[33mthis is something:\u001b[39m \u001b[36m[ \"595da547d9b22f23d8228643\",\u001b[39m\u001b[22m\n\u001b[22m\u001b[1m                   \u001b[36m  \"595da547d9b22f23d822863f\",\u001b[39m\u001b[22m\n\u001b[22m\u001b[1m                   \u001b[36m  \"595da547d9b22f23d8228641\"  ]\u001b[39m \u001b[32m[ \"595da547d9b22f23d8228643\",\u001b[39m\u001b[22m\n\u001b[22m\u001b[1m                                                   \u001b[32m  \"595da547d9b22f23d822863f\",\u001b[39m\u001b[22m\n\u001b[22m\u001b[1m                                                   \u001b[32m  \"595da547d9b22f23d8228641\"  ]\u001b[39m\u001b[22m'])
    })

    it ('noop', () => {

        const noopLog = log.noop

        assert (() => noopLog.bright.red ('foo', 'bar').should.equal ('foo'), undefined)
    })

    it ('location work on different platforms (debug)', () => {

        const pipez       = require ('pipez')
        const StackTracey = require ('stacktracey')
        const getStack = pipez ({ locate: () => (new StackTracey ().clean) })
        const stack = getStack ()
        console.log (stack.pretty)
    })

    if (String.prototype.padStart) { // no .padStart on Node 8 :(

        it ('tag works', () => {

            const log = ololog.configure ({ locate: false, tag: true })
            
            assert (() => log ('a regular message'), ['      \ta regular message'])
            assert (() => log.info ('an info message'), ['\u001b[36m  INFO\t\u001b[39man info message'], 'info')
            assert (() => log.warn ('a warning'), ['\u001b[33m  WARN\t\u001b[39ma warning'], 'warn')
            assert (() => log.error ('an error'), ['\u001b[22m\u001b[1m\u001b[31m ERROR\t\u001b[39m\u001b[22man error'], 'error')
        })
    }

    it ('custom stringifier works', () => {

        // specifying custom printer
        let log = ololog.configure ({ locate: false, stringify: { print (x) { return 'foo!' } } })
        assert (() => log (42), ['foo!'])

        // overriding the stringify stage completely
        log = ololog.configure ({ locate: false, stringify (args, cfg) { return args.map (x => cfg.foo) } })
        assert (() => log.configure ({ stringify: { foo: 'foo!' }}) (42, 24), ['foo! foo!'])
    })
})



