# Ololog! <sup>BETA</sup>

Platform-agnostic logging / colors & styles / call locations / pretty prints / pluggable architecture.

## Importing

```javascript
log = require ('ololog')
```

## Basic usage

At first, it's similar to `console.log`:

```javascript
log ('foo', 'bar', 'baz') // foo bar baz
```

Although, comparing to Chrome...

![pic](https://cdn.jpg.wtf/futurico/d9/7a/1493353824-d97aedd3837a0c462dd0cf08b6c4b46c.png)

...our tokenizer implementation is more robust, producing no unneeded word separators:

```javascript
log ('foo\n', 'bar', 'baz') // foo
                            // bar baz
```

## `.configure (...)`

It's a pure function that produces a new `log` instance, with new settings applied (not mutating the original one). You can save it for the later use:

```javascript
log = require ('ololog').configure ({ concat: { separator: '' }})
log ('foo', 'bar', 'baz') // foobarbaz
```

...or apply it ad-hoc:

```javascript
log.configure ({ concat: { separator: '' }}) ('foo', 'bar', 'baz') // foobarbaz
```

You can stack up multiple `configure` calls (although this example is rather far-fetched):

```javascript
log.configure ({ concat: { separator: ', ' }})
   .configure ({ lines: { linebreak: '<br>' }}) ('foo<br>', 'bar', 'baz') // foo
                                                                          // bar, baz
```

## ANSI styling

Backed by the [ansicolor](https://github.com/xpl/ansicolor) library. Colored output is supported for the terminal environment and for the Chrome DevTools console. On other platforms, ANSI codes are safely stripped from the output, so they don't mess up anything.

By using `ansicolor` directly:

```javascript
require ('ansicolor').nice // Importing

log (('foo'.dim.red + 'bar'.bgBrightCyan).underline)
```

By using built-in shorthand methods (no need to import `ansicolor`, but we lose the ability to colorize only part of the string):

```javascript
log.red ('red text')
log.bright.red.underline ('multiple styles combined')'
```

## Smart object printing

```javascript
let  obj = { abc: 42, defgh: true, qwertyiop: 333, zap: '123457', long: ['foo', 'bar', 'baz', 'qux', 'lol', 'yup'] }
log (obj)
```
```
{       abc:    42,
      defgh:    true,
  qwertyiop:    333,
        zap:   "123457",
       long: [ "foo",
               "bar",
               "baz",
               "qux",
               "lol",
               "yup"  ]  }
```

Disabling fancy formatting:

```javascript
log.configure ({ stringify: { pretty: false } }) (obj)
```
```
{ abc: 42, defgh: true, qwertyiop: 333, zap: "123457", long: ["foo", "bar", "baz", "qux", "lol", "yup"] }
```

All magic is provided by the external [String.ify](https://github.com/xpl/string.ify) library. Read the docs to see all the available configuration options. There are plenty of them! Contributions are welcome.

## Displaying call location

Have you ever encountered a situation where you need to quickly find in the code the place where the logging is called, but it's not so easy to do? With call location tags it's really easy. And it's enabled by default.

![log message](https://cdn.jpg.wtf/futurico/d6/dd/1493351933-d6dd0c2e633fbb2f886c25c0d8e6f6ad.png)

![call](https://cdn.jpg.wtf/futurico/d6/0c/1493352126-d60cebe41bab9c3d111364ecfc9d2c65.png)

Disabling:

```javascript
log.configure ({ locate: false }) (...)
```

Custom printer:

```javascript
log.configure ({ locate: { print: ({ calleeShort, fileName, line }) => ... } }) (...)
```

Manually setting call location (see [StackTracey](https://github.com/xpl/stacktracey) library, which serves the purpose):

```javascript
log.configure ({ locate: { where: new StackTracey ().at (2) } }) (...)
```

## Indentation

```javascript
log.configure ({ indent: { level: 3 } }) ('foo\n', 'bar\n', 'baz')  //          foo
                                                                    //          bar
                                                                    //          baz
```

Shorthand method:

```javascript
log.indent (2) ('foo\n', 'bar\n', 'baz')
```

## Timestamping

Disabled by default. To enable:

```javascript
log = log.configure ({ time: true })
```

With indentation:

```javascript
log.indent (2) ('Lorem ipsum dolor sit amet\nconsectetur adipiscing elit..\n')
```

![pic](https://cdn.jpg.wtf/futurico/b2/31/1493357342-b2313dd7e25f8606ad7637997ca05fb3.png)

With custom printer:

```javascript
log.configure ({ time: { print: x => (String (x) + ' | ').bright.cyan }}) ('Lorem ipsum dolor sit amet\nconsectetur adipiscing elit..')
```

![pic](https://cdn.jpg.wtf/futurico/93/45/1493357501-9345b20f7edd289e0336bc322f1e68c3.png)

Backdating:

```javascript
log.configure ({ time: { when: new Date ('2017-02-27T12:45:19.951Z') }}) (...)
```

## Custom methods / aspect-oriented code injection

You can add your own shorthand methods, and you can also bind new code to the existing methods, executing it _before_, _after_ or _instead_. See the [pipez](https://github.com/xpl/pipez) library, which provides all the fun.

```javascript
log.methods ({

    indent (level) { return this.configure ({ indent: { level: level }}) }

    get red ()    { return this.configure ({ 'concat+': lines => lines.map (ansicolor.red) }) } // executes it after the 'concat'
    get bright () { return this.configure ({ 'concat+': lines => lines.map (ansicolor.bright) }) }  
})
```

```javascript
log.indent (2).configure ({ time: true }).red.bright ('this is bold red message, indented by 2 and supplied with timestamp')
```

### Limiting max argument length

```javascript
log.configure ({ trim: { max: 5 } }) ('1234567890', 'abcdefgh') // 1234… abcd…
```
