"use strict";

/*  ------------------------------------------------------------------------ */
                    
require ('chai').should ()
require ('ansicolor').nice

/*  ------------------------------------------------------------------------ */

describe ('Ololog', () => {

    const log = require ('./ololog')

    // NO REAL WORKING TESTS HERE YET, WORK IN PROGRESS!!

    it ('basics works', () => {

        log.configure ({ indent: { level: 1 }})
           .configure ({ indent: { pattern: '--' }}) ('foo', 'bar')
    })

    it ('location work', () => {

        log.configure ({ locate: false }) ('no location')
    })


    it ('indent work', () => {

        log.configure ({ indent: { level: 3 } }) ('line 1\nline 2\n\nline 3\n\n')

        log.indent (3) ('line 1\nline 2\n\nline 3\n\n')

    })

    it ('timestamps work', () => {

        log.configure ({ time: true }) ('timestamp test 1')
        log.configure ({ time: { yes: true } }) ('timestamp test 2')

        log.configure ({ time: { yes: true, print: when => when + '\t' } }) ('timestamp test 3')

        log.configure ({ time: true })
           .configure ({ time: (lines, { when = new Date () }) => ['---', 'time:' + when, ...lines, '---'] })
           .configure ({ time: { when: new Date ('Wed Aug 25 1993 23:10:22 GMT+0400 (MSD)') }}) ('timestamp test 4')

        log.configure ({ time: true })
           .configure ({ time: false }) ('no timestamp')

    })

    it ('colors work', () => {

        log.magenta     ('hello' + 'hello'.bright)
        log.bgBrightRed ('hello' + 'hello'.cyan)
        log.inverse     ('hello' + 'hello'.underline.dim)

    })

    it ('string.ify work', () => {

        log.indent (4)
           .green ({ foo: 42, bar: true, qux: 333, zap: '123457', long: [1,2,3,4,5,3,4,5,6,7] })

    })
})



