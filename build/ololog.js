"use strict";

/*  ------------------------------------------------------------------------ */

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defineEnumerableProperties(obj, descs) { for (var key in descs) { var desc = descs[key]; desc.configurable = desc.enumerable = true; if ("value" in desc) desc.writable = true; Object.defineProperty(obj, key, desc); } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var O = Object,
    StackTracey = require('stacktracey'),
    ansi = require('ansicolor'),
    bullet = require('string.bullet'),
    pipez = require('pipez');

/*  ------------------------------------------------------------------------ */

var _stringify = require('string.ify').configure({
    formatter: function formatter(x) {

        if (x instanceof Error && !(typeof Symbol !== 'undefined' && x[Symbol.for('String.ify')])) {

            var why = _stringify.limit((x.message || '').replace(/\r|\n/g, '').trim(), 120),
                stack = new StackTracey(x).pretty,
                stackIndented = stack.split('\n').map(function (x) {
                return '    ' + x;
            }).join('\n');

            return '[EXCEPTION] ' + why + '\n\n' + stackIndented + '\n';
        }
    }
});

/*  ------------------------------------------------------------------------ */

var _require = require('printable-characters'),
    isBlank = _require.isBlank,
    blank = _require.blank,
    changeLastNonemptyLine = function changeLastNonemptyLine(lines, fn) {

    for (var i = lines.length - 1; i >= 0; i--) {

        if (i === 0 || !isBlank(lines[i])) {

            lines[i] = fn(lines[i]);

            break;
        }
    }

    return lines;
};

/*  ------------------------------------------------------------------------ */

var log = pipez({

    /*  ------------------------------------------------------------------------ */

    stringify: function stringify(args, cfg) {
        var print = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _stringify.configure(cfg);
        return args.map(function (arg) {
            return typeof arg === 'string' ? arg : print(arg);
        });
    },

    trim: function trim(tokens, _ref) {
        var _ref$max = _ref.max,
            max = _ref$max === undefined ? undefined : _ref$max;
        return !max ? tokens : tokens.map(function (t) {
            return _stringify.limit(t, max);
        });
    },

    lines: function lines(tokens, _ref2) {
        var _ref2$linebreak = _ref2.linebreak,
            linebreak = _ref2$linebreak === undefined ? '\n' : _ref2$linebreak;


        var lines = [[]];

        var leftPad = [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var t = _step.value;

                var _t$split = t.split(linebreak),
                    _t$split2 = _toArray(_t$split),
                    first = _t$split2[0],
                    rest = _t$split2.slice(1);

                lines[lines.length - 1].push(first);
                lines = [].concat(_toConsumableArray(lines), _toConsumableArray(rest.map(function (t) {
                    return t ? [].concat(leftPad, [t]) : [];
                })));

                var pad = blank(!rest.length ? t : rest[rest.length - 1]);

                if (pad) {
                    leftPad.push(pad);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return lines;
    },

    concat: function concat(lines, _ref3) {
        var _ref3$separator = _ref3.separator,
            separator = _ref3$separator === undefined ? ' ' : _ref3$separator;
        return lines.map(function (tokens) {
            return tokens.join(separator);
        });
    },

    indent: function indent(lines, _ref4) {
        var _ref4$level = _ref4.level,
            level = _ref4$level === undefined ? 0 : _ref4$level,
            _ref4$pattern = _ref4.pattern,
            pattern = _ref4$pattern === undefined ? '\t' : _ref4$pattern;
        return lines.map(function (line) {
            return pattern.repeat(level) + line;
        });
    },

    time: function time(lines, _ref5) {
        var _ref5$when = _ref5.when,
            when = _ref5$when === undefined ? new Date() : _ref5$when,
            _ref5$print = _ref5.print,
            print = _ref5$print === undefined ? function (when) {
            return ansi.darkGray(when.toISOString()) + '\t';
        } : _ref5$print;
        return bullet(print(when), lines);
    },

    locate: function locate(lines, _ref6) {
        var _ref6$shift = _ref6.shift,
            shift = _ref6$shift === undefined ? 0 : _ref6$shift,
            _ref6$where = _ref6.where,
            where = _ref6$where === undefined ? new StackTracey().clean.at(2 + shift) : _ref6$where,
            _ref6$join = _ref6.join,
            join = _ref6$join === undefined ? function (a, sep, b) {
            return a && b ? a + sep + b : a || b;
        } : _ref6$join,
            _ref6$print = _ref6.print,
            print = _ref6$print === undefined ? function (_ref7) {
            var calleeShort = _ref7.calleeShort,
                _ref7$fileName = _ref7.fileName,
                fileName = _ref7$fileName === undefined ? [] : _ref7$fileName,
                _ref7$line = _ref7.line,
                line = _ref7$line === undefined ? [] : _ref7$line;
            return ansi.darkGray('(' + join(calleeShort, ' @ ', join(fileName, ':', line)) + ')');
        } : _ref6$print;
        return changeLastNonemptyLine(lines, function (line) {
            return join(line, ' ', print(where));
        });
    },

    join: function join(lines, _ref8) {
        var _ref8$linebreak = _ref8.linebreak,
            linebreak = _ref8$linebreak === undefined ? '\n' : _ref8$linebreak;
        return lines.join(linebreak);
    },

    render: function render(text, _ref9) {
        var _ref9$engine = _ref9.engine,
            engine = _ref9$engine === undefined ? typeof window !== 'undefined' && window.window === window && window.navigator ? navigator.userAgent.indexOf('Chrome') >= 0 ? 'chrome' : 'generic' : 'ansi' : _ref9$engine,
            _ref9$engines = _ref9.engines,
            engines = _ref9$engines === undefined ? {/* configurable */} : _ref9$engines,
            _ref9$consoleMethod = _ref9.consoleMethod,
            consoleMethod = _ref9$consoleMethod === undefined ? 'log' : _ref9$consoleMethod,
            _ref9$defaults = _ref9.defaults,
            defaults = _ref9$defaults === undefined ? {

            ansi: function ansi(s) {
                return console[consoleMethod](s);
            },
            chrome: function chrome(s) {
                var _console;

                return (_console = console)[consoleMethod].apply(_console, _toConsumableArray(ansi.parse(s).asChromeConsoleLogArguments));
            },
            generic: function generic(s) {
                return console[consoleMethod](ansi.strip(s));
            }
        } : _ref9$defaults;
        return text && O.assign(defaults, engines)[engine](text), text;
    },

    returnValue: function returnValue(__, _ref10) {
        var _ref10$initialArgumen = _slicedToArray(_ref10.initialArguments, 1),
            firstArgument = _ref10$initialArgumen[0];

        return firstArgument;
    }

    /*  ------------------------------------------------------------------------ */

}).configure({

    time: false // disables 'time' step (until enabled back explicitly)

    /*  ------------------------------------------------------------------------ */

}).methods({

    get null() {
        return pipez({ returnValue: function returnValue(args) {
                return args[0];
            } }).methods(this.methods_);
    },

    indent: function indent(level) {
        return this.configure({ indent: { level: level } });
    },


    get error() {
        return this.configure({ render: { consoleMethod: 'error' } });
    },
    get warn() {
        return this.configure({ render: { consoleMethod: 'warn' } });
    },
    get info() {
        return this.configure({ render: { consoleMethod: 'info' } });
    },

    maxArrayLength: function maxArrayLength(n) {
        return this.configure({ stringify: { maxArrayLength: n } });
    },
    maxDepth: function maxDepth(n) {
        return this.configure({ stringify: { maxDepth: n } });
    },
    maxLength: function maxLength(n) {
        return this.configure({ stringify: { maxLength: n } });
    },


    get unlimited() {
        return this.configure({ stringify: { maxArrayLength: Number.MAX_VALUE, maxDepth: Number.MAX_VALUE } });
    },
    get noPretty() {
        return this.configure({ stringify: { pretty: false } });
    },
    precision: function precision(n) {
        return this.configure({ stringify: { precision: n } });
    },


    get serialize() {
        return this.before('render');
    },
    get deserialize() {
        return this.from('render');
    },

    newline: function newline() {
        return this.from('join')(['']);
    }
});

/*  ------------------------------------------------------------------------ */

ansi.names.forEach(function (color) {
    var _log$methods, _mutatorMap;

    log.methods((_log$methods = {}, _mutatorMap = {}, _mutatorMap[color] = _mutatorMap[color] || {}, _mutatorMap[color].get = function () {
        return this.configure({ 'concat+': function concat(lines) {
                return lines.map(ansi[color]);
            } });
    }, _defineEnumerableProperties(_log$methods, _mutatorMap), _log$methods));
});

/*  ------------------------------------------------------------------------ */

module.exports = log;

/*  ------------------------------------------------------------------------ */

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5jb25zdCBPICAgICAgICAgICAgICAgICA9IE9iamVjdFxuICAgICwgU3RhY2tUcmFjZXkgICAgICAgPSByZXF1aXJlICgnc3RhY2t0cmFjZXknKVxuICAgICwgYW5zaSAgICAgICAgICAgICAgPSByZXF1aXJlICgnYW5zaWNvbG9yJylcbiAgICAsIGJ1bGxldCAgICAgICAgICAgID0gcmVxdWlyZSAoJ3N0cmluZy5idWxsZXQnKVxuICAgICwgcGlwZXogICAgICAgICAgICAgPSByZXF1aXJlICgncGlwZXonKVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbmNvbnN0IHN0cmluZ2lmeSA9IHJlcXVpcmUgKCdzdHJpbmcuaWZ5JykuY29uZmlndXJlICh7XG5cbiAgICBmb3JtYXR0ZXIgKHgpIHtcblxuICAgICAgICBpZiAoKHggaW5zdGFuY2VvZiBFcnJvcikgJiYgISh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiB4W1N5bWJvbC5mb3IgKCdTdHJpbmcuaWZ5JyldKSkge1xuXG4gICAgICAgICAgICBjb25zdCB3aHkgICAgICAgICAgID0gc3RyaW5naWZ5LmxpbWl0ICgoeC5tZXNzYWdlIHx8ICcnKS5yZXBsYWNlICgvXFxyfFxcbi9nLCAnJykudHJpbSAoKSwgMTIwKSxcbiAgICAgICAgICAgICAgICAgIHN0YWNrICAgICAgICAgPSBuZXcgU3RhY2tUcmFjZXkgKHgpLnByZXR0eSxcbiAgICAgICAgICAgICAgICAgIHN0YWNrSW5kZW50ZWQgPSBzdGFjay5zcGxpdCAoJ1xcbicpLm1hcCAoeCA9PiAnICAgICcgKyB4KS5qb2luICgnXFxuJylcblxuICAgICAgICAgICAgcmV0dXJuIGBbRVhDRVBUSU9OXSAke3doeX1cXG5cXG4ke3N0YWNrSW5kZW50ZWR9XFxuYFxuICAgICAgICB9XG4gICAgfVxufSlcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5jb25zdCB7IGlzQmxhbmssIGJsYW5rIH0gPSByZXF1aXJlICgncHJpbnRhYmxlLWNoYXJhY3RlcnMnKVxuXG4gICAgLCBjaGFuZ2VMYXN0Tm9uZW1wdHlMaW5lID0gKGxpbmVzLCBmbikgPT4ge1xuXG4gICAgICAgIGZvciAobGV0IGkgPSBsaW5lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXG4gICAgICAgICAgICBpZiAoKGkgPT09IDApIHx8ICFpc0JsYW5rIChsaW5lc1tpXSkpIHtcblxuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gZm4gKGxpbmVzW2ldKVxuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGluZXNcbiAgICB9XG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuY29uc3QgbG9nID0gcGlwZXogKHtcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gICAgc3RyaW5naWZ5OiAoYXJncywgY2ZnLCBwcmludCA9IHN0cmluZ2lmeS5jb25maWd1cmUgKGNmZykpID0+IGFyZ3MubWFwIChhcmcgPT4gKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnKSA/IGFyZyA6IHByaW50IChhcmcpKSxcbiAgICBcbiAgICB0cmltOiAodG9rZW5zLCB7IG1heCA9IHVuZGVmaW5lZCB9KSA9PiAhbWF4ID8gdG9rZW5zIDogdG9rZW5zLm1hcCAodCA9PiBzdHJpbmdpZnkubGltaXQgKHQsIG1heCkpLFxuXG4gICAgbGluZXM6ICh0b2tlbnMsIHsgbGluZWJyZWFrID0gJ1xcbicgfSkgPT4ge1xuXG4gICAgICAgIGxldCBsaW5lcyA9IFtbXV1cblxuICAgICAgICBsZXQgbGVmdFBhZCA9IFtdXG5cbiAgICAgICAgZm9yIChjb25zdCB0IG9mIHRva2Vucykge1xuXG4gICAgICAgICAgICBjb25zdCBbZmlyc3QsIC4uLnJlc3RdID0gdC5zcGxpdCAobGluZWJyZWFrKVxuXG4gICAgICAgICAgICBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5wdXNoIChmaXJzdClcbiAgICAgICAgICAgIGxpbmVzID0gWy4uLmxpbmVzLCAuLi5yZXN0Lm1hcCAodCA9PiB0ID8gWy4uLmxlZnRQYWQsIHRdIDogW10pXVxuXG4gICAgICAgICAgICBjb25zdCBwYWQgPSBibGFuayAoIXJlc3QubGVuZ3RoID8gdCA6IHJlc3RbcmVzdC5sZW5ndGggLSAxXSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHBhZCkgeyBsZWZ0UGFkLnB1c2ggKHBhZCkgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpbmVzXG4gICAgfSxcblxuICAgIGNvbmNhdDogKGxpbmVzLCB7IHNlcGFyYXRvciA9ICcgJyB9KSA9PiBsaW5lcy5tYXAgKHRva2VucyA9PiB0b2tlbnMuam9pbiAoc2VwYXJhdG9yKSksXG5cbiAgICBpbmRlbnQ6IChsaW5lcywgeyBsZXZlbCA9IDAsIHBhdHRlcm4gPSAnXFx0JyB9KSA9PiBsaW5lcy5tYXAgKGxpbmUgPT4gcGF0dGVybi5yZXBlYXQgKGxldmVsKSArIGxpbmUpLFxuICAgIFxuICAgIHRpbWU6IChsaW5lcywgeyB3aGVuICA9IG5ldyBEYXRlICgpLFxuICAgICAgICAgICAgICAgICAgICBwcmludCA9IHdoZW4gPT4gYW5zaS5kYXJrR3JheSAod2hlbi50b0lTT1N0cmluZyAoKSkgKyAnXFx0JyB9KSA9PiBidWxsZXQgKHByaW50ICh3aGVuKSwgbGluZXMpLFxuXG4gICAgbG9jYXRlOiAobGluZXMsIHtcblxuICAgICAgICAgICAgICAgICAgICBzaGlmdCA9IDAsXG4gICAgICAgICAgICAgICAgICAgIHdoZXJlID0gKG5ldyBTdGFja1RyYWNleSAoKS5jbGVhbi5hdCAoMiArIHNoaWZ0KSksXG4gICAgICAgICAgICAgICAgICAgIGpvaW4gID0gKChhLCBzZXAsIGIpID0+IChhICYmIGIpID8gKGEgKyBzZXAgKyBiKSA6IChhIHx8IGIpKSxcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQgPSAoeyBjYWxsZWVTaG9ydCwgZmlsZU5hbWUgPSBbXSwgbGluZSA9IFtdIH0pID0+IGFuc2kuZGFya0dyYXkgKCcoJyArIGpvaW4gKGNhbGxlZVNob3J0LCAnIEAgJywgam9pbiAoZmlsZU5hbWUsICc6JywgbGluZSkpICsgJyknKVxuXG4gICAgICAgICAgICAgICAgfSkgPT4gY2hhbmdlTGFzdE5vbmVtcHR5TGluZSAobGluZXMsIGxpbmUgPT4gam9pbiAobGluZSwgJyAnLCBwcmludCAod2hlcmUpKSksXG5cbiAgICBqb2luOiAobGluZXMsIHsgbGluZWJyZWFrID0gJ1xcbicgfSkgPT4gbGluZXMuam9pbiAobGluZWJyZWFrKSxcblxuICAgIHJlbmRlcjogKHRleHQsIHtcblxuICAgICAgICBlbmdpbmUgPSAoKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSAmJiAod2luZG93LndpbmRvdyA9PT0gd2luZG93KSAmJiB3aW5kb3cubmF2aWdhdG9yKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mICgnQ2hyb21lJykgPj0gMClcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdjaHJvbWUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2dlbmVyaWMnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdhbnNpJyxcblxuICAgICAgICBlbmdpbmVzID0geyAvKiBjb25maWd1cmFibGUgKi8gfSxcblxuICAgICAgICBjb25zb2xlTWV0aG9kID0gJ2xvZycsXG5cbiAgICAgICAgZGVmYXVsdHMgPSB7XG5cbiAgICAgICAgICAgIGFuc2k6ICAgIHMgPT4gY29uc29sZVtjb25zb2xlTWV0aG9kXSAocyksXG4gICAgICAgICAgICBjaHJvbWU6ICBzID0+IGNvbnNvbGVbY29uc29sZU1ldGhvZF0gKC4uLmFuc2kucGFyc2UgKHMpLmFzQ2hyb21lQ29uc29sZUxvZ0FyZ3VtZW50cyksXG4gICAgICAgICAgICBnZW5lcmljOiBzID0+IGNvbnNvbGVbY29uc29sZU1ldGhvZF0gKGFuc2kuc3RyaXAgKHMpKVxuICAgICAgICB9XG5cbiAgICB9KSA9PiAoKHRleHQgJiYgTy5hc3NpZ24gKGRlZmF1bHRzLCBlbmdpbmVzKVtlbmdpbmVdICh0ZXh0KSwgdGV4dCkpLFxuXG4gICAgcmV0dXJuVmFsdWU6IChfXywgeyBpbml0aWFsQXJndW1lbnRzOiBbZmlyc3RBcmd1bWVudF0gfSkgPT4gZmlyc3RBcmd1bWVudFxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbn0pLmNvbmZpZ3VyZSAoe1xuXG4gICAgdGltZTogZmFsc2UgLy8gZGlzYWJsZXMgJ3RpbWUnIHN0ZXAgKHVudGlsIGVuYWJsZWQgYmFjayBleHBsaWNpdGx5KVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbn0pLm1ldGhvZHMgKHtcblxuICAgIGdldCBudWxsICgpIHsgcmV0dXJuIHBpcGV6ICh7IHJldHVyblZhbHVlOiBhcmdzID0+IGFyZ3NbMF0gfSkubWV0aG9kcyAodGhpcy5tZXRob2RzXykgfSxcblxuICAgIGluZGVudCAobGV2ZWwpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IGluZGVudDogeyBsZXZlbDogbGV2ZWwgfX0pIH0sXG5cbiAgICBnZXQgZXJyb3IgKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgcmVuZGVyOiB7IGNvbnNvbGVNZXRob2Q6ICdlcnJvcicgfSB9KSB9LFxuICAgIGdldCB3YXJuICgpICB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyByZW5kZXI6IHsgY29uc29sZU1ldGhvZDogJ3dhcm4nIH0gfSkgfSxcbiAgICBnZXQgaW5mbyAoKSAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgcmVuZGVyOiB7IGNvbnNvbGVNZXRob2Q6ICdpbmZvJyB9IH0pIH0sXG5cbiAgICBtYXhBcnJheUxlbmd0aCAobikgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heEFycmF5TGVuZ3RoOiBuIH0gfSkgfSxcbiAgICBtYXhEZXB0aCAobikgICAgICAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heERlcHRoOiBuIH0gfSkgfSxcbiAgICBtYXhMZW5ndGggKG4pICAgICAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heExlbmd0aDogbiB9IH0pIH0sXG4gICAgXG4gICAgZ2V0IHVubGltaXRlZCAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgbWF4QXJyYXlMZW5ndGg6IE51bWJlci5NQVhfVkFMVUUsIG1heERlcHRoOiBOdW1iZXIuTUFYX1ZBTFVFIH0gfSkgfSxcbiAgICBnZXQgbm9QcmV0dHkgKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IHByZXR0eTogZmFsc2UgfSB9KSB9LFxuICAgIHByZWNpc2lvbiAobikgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IHByZWNpc2lvbjogbiB9IH0pIH0sXG5cbiAgICBnZXQgc2VyaWFsaXplICgpIHsgcmV0dXJuIHRoaXMuYmVmb3JlICgncmVuZGVyJykgfSxcbiAgICBnZXQgZGVzZXJpYWxpemUgKCkgeyByZXR1cm4gdGhpcy5mcm9tICgncmVuZGVyJykgfSxcblxuICAgIG5ld2xpbmUgKCkgeyByZXR1cm4gdGhpcy5mcm9tICgnam9pbicpKFsnJ10pIH1cbn0pXG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuYW5zaS5uYW1lcy5mb3JFYWNoIChjb2xvciA9PiB7XG5cbiAgICBsb2cubWV0aG9kcyAoe1xuXG4gICAgICAgIGdldCBbY29sb3JdICgpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7ICdjb25jYXQrJzogbGluZXMgPT4gbGluZXMubWFwIChhbnNpW2NvbG9yXSkgfSkgfVxuICAgIH0pXG59KVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbm1vZHVsZS5leHBvcnRzID0gbG9nXG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuXG4iXX0=