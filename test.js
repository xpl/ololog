"use strict";

/*  ------------------------------------------------------------------------ */

const assert = (call, shouldBe = [], method='log') => {

    let impl = console[method], args 

    console[method] = function (...args_) { args = args_ }; call () // @hide
    console[method] = impl

    if (!args) { throw new Error (`console.${method} hasn't been called!`) }

    args.should.deep.equal (shouldBe)
}

/*  ------------------------------------------------------------------------ */
                    
require ('chai').should ()

/*  ------------------------------------------------------------------------ */

describe ('Ololog', () => {

    const ansicolor = require ('ansicolor').nice
    const log = require ('./ololog').configure ({ locate: false, time: { when: new Date ('2017-02-27T12:45:19.951Z') } })

    it ('separator work', () => {

        assert (() => log ('hello\n', 'world', 'line1\nline2\nline3\n'), ['hello\nworld line1\nline2\nline3\n'])
    })

    it.only ('location work', () => {

        log.configure ({ locate: true }).bgBrightCyan ('with location\n\n')

        //assert (() => log.configure ({ locate: true }).red ('with location\n\n'), ['with location \u001b[22m\u001b[2m(assert @ test.js:35)\u001b[22m\n\n'])

        assert (() => require ('./ololog') ('with location'), ['with location \u001b[22m\u001b[2m(assert @ test.js:37)\u001b[22m'])
    })

    it ('indent work', () => {

        assert (() => log.configure ({ indent: { level: 3 } }) ('line 1\nline 2\n\nline 3\n\n'), ['\t\t\tline 1\n\t\t\tline 2\n\t\t\t\n\t\t\tline 3\n\t\t\t\n\t\t\t'])
        assert (() => log.indent (3)                           ('line 1\nline 2\n\nline 3\n\n'), ['\t\t\tline 1\n\t\t\tline 2\n\t\t\t\n\t\t\tline 3\n\t\t\t\n\t\t\t'])
    })

    it ('timestamps work', () => {

        assert (() => log.configure ({ time: true }) ('foobar'), ["\u001b[22m\u001b[2m2017-02-27T12:45:19.951Z\u001b[22m\tfoobar"])
    })

    it ('timestamps are good with indent', () => {

        const mylog = log.configure ({ time: { yes: true, print: when => when + ' | ' } })

        assert (() => mylog ('foo\nbar\nbaz'), [
            'Mon Feb 27 2017 15:45:19 GMT+0300 (MSK) | foo\n' +
            '                                          bar\n' +
            '                                          baz'])

        assert (() => mylog.indent (2) ('foo\nbar\nbaz'), [
            'Mon Feb 27 2017 15:45:19 GMT+0300 (MSK) | \t\tfoo\n' +
            '                                          \t\tbar\n' +
            '                                          \t\tbaz'])
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

        assert (() => log.indent (2).green ({ foo: 42, bar: true, qux: 333, zap: '123457', long: [1,2,3,4,5,3,4,5,6,7] }),

           ["\t\t\u001b[32m{  foo:    42,\u001b[39m\n\t\t\u001b[32m   bar:    true,\u001b[39m\n\t\t\u001b[32m   qux:    333,\u001b[39m\n\t\t\u001b[32m   zap:   \"123457\",\u001b[39m\n\t\t\u001b[32m  long: [ 1,\u001b[39m\n\t\t\u001b[32m          2,\u001b[39m\n\t\t\u001b[32m          3,\u001b[39m\n\t\t\u001b[32m          4,\u001b[39m\n\t\t\u001b[32m          5,\u001b[39m\n\t\t\u001b[32m          3,\u001b[39m\n\t\t\u001b[32m          4,\u001b[39m\n\t\t\u001b[32m          5,\u001b[39m\n\t\t\u001b[32m          6,\u001b[39m\n\t\t\u001b[32m          7  ]      }\u001b[39m"])

        assert (() => log.configure ({ stringify: { pretty: false } }) ({ foo: 42, bar: true, qux: 333, zap: '123457', long: [1,2,3,4,5,3,4,5,6,7] }),

           ["{ foo: 42, bar: true, qux: 333, zap: \"123457\", long: [1, 2, 3, 4, 5, 3, 4, 5, 6, 7] }"])

    })

    it ('trim works', () => {

        assert (() => log.configure ({ trim: { max: 5 } }) ('1234567890', 'abcdefgh'), ["1234… abcd…"])
    })

    it ('.error / .warn / .info works', () => {

        assert (() => log.error.red ('this goes to stderr'),
                     ['\u001b[31m' + 'this goes to stderr' + '\u001b[39m'], 'error')

        assert (() => log.warn.red ('this goes to console.warn'),
                     ['\u001b[31m' + 'this goes to console.warn' + '\u001b[39m'], 'warn')

        assert (() => log.info.red ('this goes to console.info'),
                     ['\u001b[31m' + 'this goes to console.info' + '\u001b[39m'], 'info')
    })

    it ('formatting Error works', () => {

        const e = new Error ('dummy error')

        log.configure ({ '+render': text => {

            text.indexOf ('[EXCEPTION] dummy error\n').should.equal (0)
            text.indexOf ('const e = new Error (\'dummy error\')').should.be.gt (0)

        }}) (e)
    })

    it ('getting rendered text', () => {

        log.before ('render') ({ foo: 42 }).should.be.equal ('{ foo: 42 }')
    })

    it ('returns its first argument', () => {

        assert (() => log (42)              .should.equal (42), ['42'])
        assert (() => log (42, 'foo', 'bar').should.equal (42), ['42 foo bar'])
    })
})



