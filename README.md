# Ololog!

[![Build Status](https://travis-ci.org/xpl/ololog.svg?branch=master)](https://travis-ci.org/xpl/ololog) [![Windows Build Status](https://ci.appveyor.com/api/projects/status/toprqa1obtcawp1m?svg=true)](https://ci.appveyor.com/project/xpl/ololog)
 [![NPM](https://img.shields.io/npm/v/ololog.svg)](http://npmjs.com/package/ololog)

- [x] Platform-agnostic logging
- [x] [Colors / styles](https://github.com/xpl/ololog#ansi-styling) for terminals and Chrome DevTools (try [online demo](https://xpl.github.io/ololog/))
- [x] [Displays call locations](https://github.com/xpl/ololog#displaying-call-location)
- [x] [Returns its argument](https://github.com/xpl/ololog#debugging-of-functional-expressions) (for easy debugging of functional expressions)
- [x] [Smart newline / indentation handling](https://github.com/xpl/ololog#smart-indentationnewline-handling)
- [x] [Powerful object printer](https://github.com/xpl/ololog#smart-object-printing)
- [x] Formats `Error` instances as [pretty stacktraces with source lines](https://github.com/xpl/ololog#pretty-printing-error-instances)
- [x] Full sourcemap support (via [`get-source`](https://github.com/xpl/get-source))
- [x] [Pluggable pipeline architecture](https://github.com/xpl/pipez#pipezbeta)
- [x] [Can replace the default unhandled error printer in Node](https://github.com/xpl/ololog#using-as-the-default-exception-printer-in-node)
- [x] [Integrates with Mocha](https://github.com/xpl/ololog#using-with-mocha) (experimental)


# Examples _(NEW!)_

These examples demonstrate some non-trivial complex behaviors that could be achieved with Ololog by [plugging](#overriding-the-default-behaivor) into it's rendering pipeline. For simpler examples read further docs!

1. [Logging to a file and on screen at the same time (with different log levels)](https://github.com/xpl/ololog/blob/master/examples/logging-to-file.js)
2. [Collapsing repeated messages (with an incrementing counter)](https://github.com/xpl/ololog/blob/master/examples/collapsing-repeated-messages.js)

     <img width="422" alt="screen shot 2018-05-11 at 19 32 48" src="https://user-images.githubusercontent.com/1707/39935701-8cc52cfe-5552-11e8-934b-43f1f8da0518.png">

3. [Displaying log levels and custom tags](https://github.com/xpl/ololog/blob/master/examples/custom-tags.js)

     <img width="458" alt="screen shot 2019-01-22 at 22 46 59" src="https://user-images.githubusercontent.com/1707/51561304-ec029d00-1e97-11e9-9fcc-6d6edd0401fb.png">


# TODO

- [ ] HTML/DOM rendering
- [ ] Improve [tests](https://github.com/xpl/ololog/blob/master/test.js) coverage

# Importing

For use with Node or with module bundlers (Browserify / WebPack / Rollup):

```bash
npm install ololog
```
```javascript
const log = require ('ololog')
```

# Using With [Mocha](https://mochajs.org/)

<img src="https://user-images.githubusercontent.com/1707/30816536-e504a9d6-a21e-11e7-976c-778a95d32219.png">

```bash
mocha --reporter ololog/reporter
```

- [x] Aligns log messages nicely
- [x] Supresses log output for nonfailed tests (disable with `.only` or `this.verbose=true` for a suite/test)
- [x] Automatically manages empty lines / whitespace for better legibility
- [x] Prints unhandled exceptions and promise rejections as nice stacktraces
- [x] [Animated execution progress](https://user-images.githubusercontent.com/1707/30836580-c80ab106-a267-11e7-87d1-04513d36995b.gif)

**NOTE:** It is highly experimental yet, and things may not work as expected...

# Browser Bundle

...for those who still uses `<script>` tag for module importing ;) Exposes the global `ololog` and [`ansicolor`](https://github.com/xpl/ansicolor) objects. Installs [String extensions for ANSI styles](https://github.com/xpl/ansicolor#nice-mode-by-request). Not compressed.

```html
<script src="https://unpkg.com/ololog"></script> <!-- from unpkg.com CDN -->
<script>
    log = ololog
    log ('something'.red)
</script>
```

# Basic Usage

At first, it's similar to `console.log`:

```javascript
log ('foo', 'bar', 'baz') // foo bar baz
```

# Configuration

It exposes a method called `.configure`, which produces a new `log` instance with the new settings applied (not mutating the original one), which can be saved and re-used subsequently:

```javascript
const log = require ('ololog').configure ({ concat: { separator: '' }})
```
```javascript
log ('foo', 'bar', 'baz') // foobarbaz
```

...or you can apply the configuration method _ad-hoc_:

```javascript
log.configure ({ concat: { separator: '' }}) ('foo', 'bar', 'baz') // foobarbaz
```

You can [read more about `configure` here](https://github.com/xpl/pipez#pipezbeta). Configuration engine is implemented as a separate external library, for everyone's use. Contributions are welcome.

# Debugging Of Functional Expressions

Ololog returns its first argument (a feature that `console.log` doesn't have), and it greatly simplifies debugging of functional expressions, as you can simply wrap part of an expression to `log`:

```javascript
array.map (x => log (x) + 1)
```

It is far less ugly than with `console.log`:

```javascript
array.map (x => { console.log (x); return x + 1 })
```

# ANSI Styling

Backed by the [ansicolor](https://github.com/xpl/ansicolor) library, colored output is supported for the terminal environment and for the Chrome DevTools console. On other platforms, ANSI codes are safely stripped from the output, so they don't mess up anything.

Apply styling by calling the [`ansicolor`](https://github.com/xpl/ansicolor) methods on arbitrary strings:

```javascript
require ('ansicolor').nice // importing in .nice mode extends the String prototype, but there's a safe functional mode as well (see the docs...)

log (('foo'.dim.red + 'bar'.bgLightCyan).underline)
```

...or by using the built-in shorthand methods (no need to import `ansicolor`, but we lose the ability to colorize just a part of a string):

```javascript
log.red ('red text')
log.bright.red.underline ('multiple styles combined')
```

[See all the supported styling options here](https://github.com/xpl/ansicolor#supported-styles).

# Smart Indentation/Newline Handling

```javascript
log.bright.magenta ('this is something:'.yellow, [ "595da547d9b22f23d8228643", "595da547d9b22f23d822863f", "595da547d9b22f23d8228641" ])
```

![pic](https://cdn.jpg.wtf/futurico/a3/cf/1499313101-a3cf62db303adad169816ce670f43a3b.png)

...and this is how it would look without special caring:

![pic](https://cdn.jpg.wtf/futurico/b1/34/1499313467-b1342c4330146675e9353eddd281006c.png)

# Smart Object Printing

All magic is provided by the external [String.ify](https://github.com/xpl/string.ify) library. Read the docs to see all the available configuration options. There are plenty of them! Contributions are welcome.

![GIF Animation](https://user-images.githubusercontent.com/1707/39936518-6163e2dc-5555-11e8-9c40-3abe57371ab4.gif)

Example object:

```javascript
const obj = { asks: [{ price: "1000", amount: 10 }, { price: "2000", amount: 10 }], bids: [{ price: "500", amount: 10 }, { price: "100", amount: 10 }] }
```

Default output:

```javascript
log (obj)
```
```
{ asks: [ { price: "1000", amount: 10 },
          { price: "2000", amount: 10 }  ],
  bids: [ { price: "500", amount: 10 },
          { price: "100", amount: 10 }  ]   }
```

Longer strings:

```javascript
log.maxLength (70) (obj)
```
```
{ asks: [{ price: "1000", amount: 10 }, { price: "2000", amount: 10 }],
  bids: [{ price: "500", amount: 10 }, { price: "100", amount: 10 }]    }
```

Shorter strings:

```javascript
log.maxLength (20) (obj)
```
```
{ asks: [ {  price: "1000",
            amount:  10     },
          {  price: "2000",
            amount:  10     }  ],
  bids: [ {  price: "500",
            amount:  10    },
          {  price: "100",
            amount:  10    }  ]   }
```

Disabling fancy formatting / single line mode:

```javascript
log.noPretty (obj)
```
```
{ asks: [{ price: "1000", amount: 10 }, { price: "2000", amount: 10 }], bids: [{ price: "500", amount: 10 }, { price: "100", amount: 10 }] }
```

Changing max print depth / max array length:

```javascript
log.maxDepth (1).maxArrayLength (100) (obj) // or log.configure ({ stringify: { maxDepth: 1, maxArrayLength: 100 } })
```
```javascript
log.unlimited (obj) // disables limiting
```

Setting floating-point output precision:

```javascript
log.precision (2) ({ foo: 123.456789 })
```
```javascript
{ foo: 123.45 }
```

Passing other configuration options to [`string.ify`](https://github.com/xpl/string.ify): 

```javascript
log.configure ({ stringify: { precision: 2 } }) (obj) // Read the string.ify docs to see all the available configuration options. There are plenty of them!
```

# Using With Custom Stringifier

Replacing the default printer with [q-i](https://github.com/sapegin/q-i) (as an example):

```javascript
const log = require ('ololog').configure ({ stringify: { print: require ('q-i').stringify } })
```
```javascript
log ({ foo: true, bar: 42 })
```

![pic](https://user-images.githubusercontent.com/1707/30799941-222a66a8-a1e7-11e7-89b5-4bed706c7840.png)

# Pretty Printing `Error` Instances

This feature is implemented in the [StackTracey](https://github.com/xpl/stacktracey#pretty-printing) library. See it's docs for more (you can configure the path shortening / library calls skipping).

```javascript
log.bright.red (e) // where `e` is an instance of Error
```

or (if you want the output go to _stderr_ and supress the grey location badge):

```javascript
log.bright.red.error.noLocate (e)
```

<img width="936" alt="screen shot 2017-09-27 at 13 57 24" src="https://user-images.githubusercontent.com/1707/30910025-dd160de6-a38b-11e7-9297-70f139cd63b8.png">

# Using As The Default Exception Printer In Node

```javascript
process.on ('uncaughtException',  e => { log.bright.red.error.noLocate (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error.noLocate (e); process.exit (1) })
```

Or you can simply call the `handleNodeErrors` helper when importing Ololog:

```javascript
const log = require ('ololog').handleNodeErrors ()
```

# Displaying Call Location

Have you ever encountered a situation where you need to quickly find in the code the place where the logging is called, but it's not so easy to do? With call location tags it's really easy. And it's enabled by default.

![log message](https://cdn.jpg.wtf/futurico/d6/dd/1493351933-d6dd0c2e633fbb2f886c25c0d8e6f6ad.png)

![call](https://cdn.jpg.wtf/futurico/d6/0c/1493352126-d60cebe41bab9c3d111364ecfc9d2c65.png)

Disabling:

```javascript
log.configure ({ locate: false }) (...)
```

...or:

```javascript
log.noLocate (...)
````

Custom printer:

```javascript
log.configure ({ locate: { print: ({ calleeShort, fileName, line }) => ... } }) (...)
```

Displaying outer call location (upwards the stack), can be useful when implementing library code / wrappers:

```javascript
log.configure ({ locate: { shift: 1 }}) (...)
```

Manually setting call location (see the [StackTracey](https://github.com/xpl/stacktracey) library, which serves the purpose):

```javascript
log.configure ({ locate: { where: new StackTracey ().at (2) } }) (...)
```

# Indentation

```javascript
log.configure ({ indent: { level: 3 } }) ('foo\n', 'bar\n', 'baz')  //          foo
                                                                    //          bar
                                                                    //          baz
```

Shorthand method:

```javascript
log.indent (2) ('foo\n', 'bar\n', 'baz')
```

# Timestamping

Disabled by default. To enable (with default options):

```javascript
log = log.configure ({ time: true })
```

<img width="965" src="https://user-images.githubusercontent.com/1707/39397314-f5df5ffe-4b05-11e8-8b7c-fda493d40749.png">

Configure formatting:

```javascript
log = log.configure ({ time: { yes: true, format: 'iso' } })
```

Here is the correspondence between the `format` option value and the related `Date` method used for rendering:

| `format` value | `Date` method
| -------------- | --------------------- |
| `"locale"`     | `.toLocaleString ()`  |
| `"iso"`        | `.toISOString ()`     |
| `"utc"`        | `.toUTCString ()`     |
| `null`         | `.toString ()`        |

Providing a custom printer:

```javascript
log.configure ({ time: { yes: true, print: x => (String (x) + ' | ').bright.cyan }}) ('Lorem ipsum dolor sit amet\nconsectetur adipiscing elit..')
```

![pic](https://cdn.jpg.wtf/futurico/93/45/1493357501-9345b20f7edd289e0336bc322f1e68c3.png)

Backdating:

```javascript
log.configure ({ time: { yes: true, when: new Date ('2017-02-27T12:45:19.951Z') }}) (...)
```

# Specifying Additional Semantics (errors / warnings / info messages)

You can add the `.error` call modifier, which tells Ololog to render with the `console.error` instead of the `console.log`: 

```javascript
log.error ('this goes to stderr')
```
```javascript
log.bright.red.error ('bright red error!')
```

Other `console` methods are supported as well:

```javascript
log.info ('calls console.info')
```
```javascript
log.warn ('calls console.warn')
```

# Displaying The `INFO` / `WARN` / `ERROR` Tags

There is a `tag` stage (disabled by default) that displays the log level:

```javascript
const log = require ('ololog').configure ({ tag: true })

log       ('a regular message')
log.info  ('an info message')
log.warn  ('a warning')
log.error ('an error')
```

<img width="203" alt="screen shot 2019-01-22 at 22 22 44" src="https://user-images.githubusercontent.com/1707/51559915-426ddc80-1e94-11e9-967e-4780437d6818.png">

# Customized Tag Printer

You can completely override the `tag` stage, introducing new parameters and behavior (a `clusterId` in this example):

```javascript
const bullet = require ('string.bullet') // NB: these packages are part of Ololog, no need to install them separately
const { cyan, yellow, red, dim } = require ('ansicolor')

const log = require ('ololog').configure ({

    locate: false,
    time: true,
    tag: (lines, {
            level = '',
            levelColor = { 'info': cyan, 'warn': yellow, 'error': red.bright.inverse },
            clusterId
          }) => {
        
        const clusterStr = clusterId ? ('CLUSTER[' + (clusterId + '').padStart (2, '0') + ']') : ''
        const levelStr = level && (levelColor[level] || (s => s)) (level.toUpperCase ())

        return bullet (dim (clusterStr.padStart (10)) + '\t' + levelStr.padStart (6) + '\t', lines)
    }
})
```

```javascript
log.configure ({ tag: { clusterId: 1  } })       ('foo')
log.configure ({ tag: { clusterId: 3  } }).info  ('bar')
log.configure ({ tag: { clusterId: 27 } }).error ('a multiline\nerror\nmessage')
```

The output:

<img width="458" alt="screen shot 2019-01-22 at 22 46 59" src="https://user-images.githubusercontent.com/1707/51561304-ec029d00-1e97-11e9-9fcc-6d6edd0401fb.png">


# Limiting Max Argument Length

```javascript
log.configure ({ trim: { max: 5 } }) ('1234567890', 'abcdefgh') // 1234… abcd…
```

# Getting Rendered Text

The following will execute all stages before the 'render' (screen output) stage, returning its argument:

```javascript
log.before ('render') ({ foo: 42 }) // '{ foo: 42 }'
```

# Custom Methods

You can add your own shorthand methods/properties (will add new properties globally for any instance of the `ololog`, but this may change in future). An example, demonstrating how the actual `indent` and `red` chain-style helpers were implemented:

```javascript
log.methods ({

    indent (level) { return this.configure ({ indent: { level: level }}) }
    get red ()     { return this.configure ({ 'concat+': lines => lines.map (ansicolor.red) }) } // executes it after the 'concat'
})
```

# Overriding The Default Behaivor

You can also bind new code to the existing methods in an _aspect-oriented programming_ style, executing it _before_, _after_ or _instead_ – and thus overriding the default behavior. See the [pipez](https://github.com/xpl/pipez#pipez) library, which provides all the fun. For example, if you want to write `.error` calls not just on screen, but to a separate file, you can do following (by injecting a custom hook after the `render` call):

```javascript
const ololog = require ('ololog')
    , ansi   = require ('ansicolor')
    , fs     = require ('fs')
    
const log = require ('ololog').configure ({

    'render+' (text, { consoleMethod = '' }) { // adds this method after `render`
        if (consoleMethod === 'error') {
            fs.appendToFile ('error.log', '\n' + ansi.strip (text)) // strip ANSI styling codes from output
        }
        return text
    }
})
```

Here's a complete example on how to set up a file logging that supports different log levels:

- [`examples/logging-to-file.js`](https://github.com/xpl/ololog/blob/master/examples/logging-to-file.js)

Here's another trick that you could do by injecting a handler _before_ the `render` step:

- [Collapsing repeated messages (with an incrementing counter)](https://github.com/xpl/ololog/blob/master/examples/collapsing-repeated-messages.js)

     <img width="422" alt="screen shot 2018-05-11 at 19 32 48" src="https://user-images.githubusercontent.com/1707/39935701-8cc52cfe-5552-11e8-934b-43f1f8da0518.png">

# Null Device

Use `.null` to obtain a reduced instance that does nothing apart from returning its first argument:

```javascript
const devNull = log.null
```
```javascript
devNull.bright.red ('this never shows') // simply returns 'this never shows'
```

# Powered By

- [String.ify](https://github.com/xpl/string.ify)
- [StackTracey](https://github.com/xpl/stacktracey)
- [pipez](https://github.com/xpl/pipez)
- [ansicolor](https://github.com/xpl/ansicolor)
- [printable-characters](https://github.com/xpl/printable-characters)

# Projects That Use Ololog

- [CCXT](https://github.com/ccxt-dev/ccxt) – a cryptocurrency trading library with 100+ exchanges.
