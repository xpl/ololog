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
    formatter: function formatter(x, stringify) {

        if (x instanceof Error && !(typeof Symbol !== 'undefined' && x[Symbol.for('String.ify')])) {

            if (stringify.state.depth > 0) return '<Error: ' + x.message + '>'; // prevents unwanted pretty printing for Errors that are properties of complex objects

            var indent = '    ',
                why = stringify.limit((x.message || '').replace(/\r|\n/g, '').trim(), 120),
                stack = new StackTracey(x).pretty,
                stackIndented = stack.split('\n').map(function (x) {
                return indent + x;
            }).join('\n'),
                isAssertion = 'actual' in x && 'expected' in x,
                type = x.constructor.name || 'Error';

            if (isAssertion) {

                var str = stringify.configure({ maxStringLength: Number.MAX_VALUE, maxDepth: 8 });

                var actual = bullet(indent + 'actual:   ', str(x.actual)),
                    expected = bullet(indent + 'expected: ', str(x.expected));

                if (actual.split('\n').length > 1 || expected.split('\n').length > 1) // if multiline actual/expected, need extra whitespace inbetween
                    actual += '\n';

                return '[' + type + '] ' + why + '\n\n' + ansi.red(actual) + '\n' + ansi.green(expected) + '\n\n' + stackIndented + '\n';
            } else {
                return '[' + type + '] ' + why + '\n\n' + stackIndented + '\n';
            }
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
            where = _ref6$where === undefined ? new StackTracey().clean.at(1 + shift) : _ref6$where,
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
        return this.configure({ stringify: { maxStringLength: Number.MAX_VALUE, maxArrayLength: Number.MAX_VALUE, maxDepth: Number.MAX_VALUE } });
    },
    get noPretty() {
        return this.configure({ stringify: { pretty: false } });
    },
    get noLocate() {
        return this.configure({ locate: false });
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
    },
    handleNodeErrors: function handleNodeErrors() {
        var _this = this;

        process.on('uncaughtException', function (e) {
            _this.bright.red.error.noLocate(e);process.exit(1);
        });
        process.on('unhandledRejection', function (e) {
            _this.bright.red.error.noLocate(e);process.exit(1);
        });
        return this;
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QkFFUyxLQUZULG9CQUVtQjtBQUFFLGVBQU8sS0FBSyxTQUFMLENBQWdCLEVBQUUsV0FBVztBQUFBLHVCQUFTLE1BQU0sR0FBTixDQUFXLEtBQUssS0FBTCxDQUFYLENBQVQ7QUFBQSxhQUFiLEVBQWhCLENBQVA7QUFBeUUsS0FGOUY7QUFJSCxDQU5EOztBQVFBOztBQUVBLE9BQU8sT0FBUCxHQUFpQixHQUFqQjs7QUFFQSIsImZpbGUiOiJvbG9sb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5jb25zdCBPICAgICAgICAgICAgICAgICA9IE9iamVjdFxuICAgICwgU3RhY2tUcmFjZXkgICAgICAgPSByZXF1aXJlICgnc3RhY2t0cmFjZXknKVxuICAgICwgYW5zaSAgICAgICAgICAgICAgPSByZXF1aXJlICgnYW5zaWNvbG9yJylcbiAgICAsIGJ1bGxldCAgICAgICAgICAgID0gcmVxdWlyZSAoJ3N0cmluZy5idWxsZXQnKVxuICAgICwgcGlwZXogICAgICAgICAgICAgPSByZXF1aXJlICgncGlwZXonKVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cblxuY29uc3Qgc3RyaW5naWZ5ID0gcmVxdWlyZSAoJ3N0cmluZy5pZnknKS5jb25maWd1cmUgKHtcblxuICAgIGZvcm1hdHRlciAoeCwgc3RyaW5naWZ5KSB7XG5cbiAgICAgICAgaWYgKCh4IGluc3RhbmNlb2YgRXJyb3IpICYmICEodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgeFtTeW1ib2wuZm9yICgnU3RyaW5nLmlmeScpXSkpIHtcblxuICAgICAgICAgICAgaWYgKHN0cmluZ2lmeS5zdGF0ZS5kZXB0aCA+IDApIHJldHVybiBgPEVycm9yOiAke3gubWVzc2FnZX0+YCAvLyBwcmV2ZW50cyB1bndhbnRlZCBwcmV0dHkgcHJpbnRpbmcgZm9yIEVycm9ycyB0aGF0IGFyZSBwcm9wZXJ0aWVzIG9mIGNvbXBsZXggb2JqZWN0c1xuXG4gICAgICAgICAgICBjb25zdCBpbmRlbnQgICAgICAgID0gJyAgICAnXG4gICAgICAgICAgICAgICAgLCB3aHkgICAgICAgICAgID0gc3RyaW5naWZ5LmxpbWl0ICgoeC5tZXNzYWdlIHx8ICcnKS5yZXBsYWNlICgvXFxyfFxcbi9nLCAnJykudHJpbSAoKSwgMTIwKVxuICAgICAgICAgICAgICAgICwgc3RhY2sgICAgICAgICA9IG5ldyBTdGFja1RyYWNleSAoeCkucHJldHR5XG4gICAgICAgICAgICAgICAgLCBzdGFja0luZGVudGVkID0gc3RhY2suc3BsaXQgKCdcXG4nKS5tYXAgKHggPT4gaW5kZW50ICsgeCkuam9pbiAoJ1xcbicpXG4gICAgICAgICAgICAgICAgLCBpc0Fzc2VydGlvbiA9ICgnYWN0dWFsJyBpbiB4KSAmJiAoJ2V4cGVjdGVkJyBpbiB4KVxuICAgICAgICAgICAgICAgICwgdHlwZSAgICAgICAgPSB4LmNvbnN0cnVjdG9yLm5hbWUgfHwgJ0Vycm9yJ1xuXG4gICAgICAgICAgICBpZiAoaXNBc3NlcnRpb24pIHtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHN0ciA9IHN0cmluZ2lmeS5jb25maWd1cmUgKHsgbWF4U3RyaW5nTGVuZ3RoOiBOdW1iZXIuTUFYX1ZBTFVFLCBtYXhEZXB0aDogOCB9KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBhY3R1YWwgICA9IGJ1bGxldCAoaW5kZW50ICsgJ2FjdHVhbDogICAnLCBzdHIgKHguYWN0dWFsKSlcbiAgICAgICAgICAgICAgICAgICwgZXhwZWN0ZWQgPSBidWxsZXQgKGluZGVudCArICdleHBlY3RlZDogJywgc3RyICh4LmV4cGVjdGVkKSlcblxuICAgICAgICAgICAgICAgIGlmICgoYWN0dWFsLnNwbGl0ICgnXFxuJykubGVuZ3RoID4gMSkgfHwgKGV4cGVjdGVkLnNwbGl0ICgnXFxuJykubGVuZ3RoID4gMSkpIC8vIGlmIG11bHRpbGluZSBhY3R1YWwvZXhwZWN0ZWQsIG5lZWQgZXh0cmEgd2hpdGVzcGFjZSBpbmJldHdlZW5cbiAgICAgICAgICAgICAgICAgICAgYWN0dWFsICs9ICdcXG4nXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYFske3R5cGV9XSAke3doeX1cXG5cXG4ke2Fuc2kucmVkIChhY3R1YWwpfVxcbiR7YW5zaS5ncmVlbiAoZXhwZWN0ZWQpfVxcblxcbiR7c3RhY2tJbmRlbnRlZH1cXG5gXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBgWyR7dHlwZX1dICR7d2h5fVxcblxcbiR7c3RhY2tJbmRlbnRlZH1cXG5gXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbmNvbnN0IHsgaXNCbGFuaywgYmxhbmsgfSA9IHJlcXVpcmUgKCdwcmludGFibGUtY2hhcmFjdGVycycpXG5cbiAgICAsIGNoYW5nZUxhc3ROb25lbXB0eUxpbmUgPSAobGluZXMsIGZuKSA9PiB7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICgoaSA9PT0gMCkgfHwgIWlzQmxhbmsgKGxpbmVzW2ldKSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gZm4gKGxpbmVzW2ldKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5lc1xuICAgIH1cblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5jb25zdCBsb2cgPSBwaXBleiAoe1xuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgICBzdHJpbmdpZnk6IChhcmdzLCBjZmcsIHByaW50ID0gc3RyaW5naWZ5LmNvbmZpZ3VyZSAoY2ZnKSkgPT4gYXJncy5tYXAgKGFyZyA9PiAodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycpID8gYXJnIDogcHJpbnQgKGFyZykpLFxuICAgIFxuICAgIHRyaW06ICh0b2tlbnMsIHsgbWF4ID0gdW5kZWZpbmVkIH0pID0+ICFtYXggPyB0b2tlbnMgOiB0b2tlbnMubWFwICh0ID0+IHN0cmluZ2lmeS5saW1pdCAodCwgbWF4KSksXG5cbiAgICBsaW5lczogKHRva2VucywgeyBsaW5lYnJlYWsgPSAnXFxuJyB9KSA9PiB7XG5cbiAgICAgICAgbGV0IGxpbmVzID0gW1tdXVxuICAgICAgICBsZXQgbGVmdFBhZCA9IFtdXG5cbiAgICAgICAgZm9yIChjb25zdCB0IG9mIHRva2Vucykge1xuXG4gICAgICAgICAgICBjb25zdCBbZmlyc3QsIC4uLnJlc3RdID0gdC5zcGxpdCAobGluZWJyZWFrKVxuXG4gICAgICAgICAgICBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5wdXNoIChmaXJzdClcbiAgICAgICAgICAgIGxpbmVzID0gWy4uLmxpbmVzLCAuLi5yZXN0Lm1hcCAodCA9PiB0ID8gWy4uLmxlZnRQYWQsIHRdIDogW10pXVxuXG4gICAgICAgICAgICBjb25zdCBwYWQgPSBibGFuayAoIXJlc3QubGVuZ3RoID8gdCA6IHJlc3RbcmVzdC5sZW5ndGggLSAxXSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHBhZCkgeyBsZWZ0UGFkLnB1c2ggKHBhZCkgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpbmVzXG4gICAgfSxcblxuICAgIGNvbmNhdDogKGxpbmVzLCB7IHNlcGFyYXRvciA9ICcgJyB9KSA9PiBsaW5lcy5tYXAgKHRva2VucyA9PiB0b2tlbnMuam9pbiAoc2VwYXJhdG9yKSksXG5cbiAgICBpbmRlbnQ6IChsaW5lcywgeyBsZXZlbCA9IDAsIHBhdHRlcm4gPSAnXFx0JyB9KSA9PiBsaW5lcy5tYXAgKGxpbmUgPT4gcGF0dGVybi5yZXBlYXQgKGxldmVsKSArIGxpbmUpLFxuICAgIFxuICAgIHRpbWU6IChsaW5lcywgeyB3aGVuICA9IG5ldyBEYXRlICgpLFxuICAgICAgICAgICAgICAgICAgICBwcmludCA9IHdoZW4gPT4gYW5zaS5kYXJrR3JheSAod2hlbi50b0lTT1N0cmluZyAoKSkgKyAnXFx0JyB9KSA9PiBidWxsZXQgKHByaW50ICh3aGVuKSwgbGluZXMpLFxuXG4gICAgbG9jYXRlOiAobGluZXMsIHtcblxuICAgICAgICAgICAgICAgICAgICBzaGlmdCA9IDAsXG4gICAgICAgICAgICAgICAgICAgIHdoZXJlID0gKG5ldyBTdGFja1RyYWNleSAoKS5jbGVhbi5hdCAoMSArIHNoaWZ0KSksXG4gICAgICAgICAgICAgICAgICAgIGpvaW4gID0gKChhLCBzZXAsIGIpID0+IChhICYmIGIpID8gKGEgKyBzZXAgKyBiKSA6IChhIHx8IGIpKSxcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQgPSAoeyBjYWxsZWVTaG9ydCwgZmlsZU5hbWUgPSBbXSwgbGluZSA9IFtdIH0pID0+IGFuc2kuZGFya0dyYXkgKCcoJyArIGpvaW4gKGNhbGxlZVNob3J0LCAnIEAgJywgam9pbiAoZmlsZU5hbWUsICc6JywgbGluZSkpICsgJyknKVxuXG4gICAgICAgICAgICAgICAgfSkgPT4gY2hhbmdlTGFzdE5vbmVtcHR5TGluZSAobGluZXMsIGxpbmUgPT4gam9pbiAobGluZSwgJyAnLCBwcmludCAod2hlcmUpKSksXG5cbiAgICBqb2luOiAobGluZXMsIHsgbGluZWJyZWFrID0gJ1xcbicgfSkgPT4gbGluZXMuam9pbiAobGluZWJyZWFrKSxcblxuICAgIHJlbmRlcjogKHRleHQsIHtcblxuICAgICAgICBlbmdpbmUgPSAoKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSAmJiAod2luZG93LndpbmRvdyA9PT0gd2luZG93KSAmJiB3aW5kb3cubmF2aWdhdG9yKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mICgnQ2hyb21lJykgPj0gMClcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdjaHJvbWUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2dlbmVyaWMnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdhbnNpJyxcblxuICAgICAgICBlbmdpbmVzID0geyAvKiBjb25maWd1cmFibGUgKi8gfSxcblxuICAgICAgICBjb25zb2xlTWV0aG9kID0gJ2xvZycsXG5cbiAgICAgICAgZGVmYXVsdHMgPSB7XG5cbiAgICAgICAgICAgIGFuc2k6ICAgIHMgPT4gY29uc29sZVtjb25zb2xlTWV0aG9kXSAocyksXG4gICAgICAgICAgICBjaHJvbWU6ICBzID0+IGNvbnNvbGVbY29uc29sZU1ldGhvZF0gKC4uLmFuc2kucGFyc2UgKHMpLmFzQ2hyb21lQ29uc29sZUxvZ0FyZ3VtZW50cyksXG4gICAgICAgICAgICBnZW5lcmljOiBzID0+IGNvbnNvbGVbY29uc29sZU1ldGhvZF0gKGFuc2kuc3RyaXAgKHMpKVxuICAgICAgICB9XG5cbiAgICB9KSA9PiAoKHRleHQgJiYgTy5hc3NpZ24gKGRlZmF1bHRzLCBlbmdpbmVzKVtlbmdpbmVdICh0ZXh0KSwgdGV4dCkpLFxuXG4gICAgcmV0dXJuVmFsdWU6IChfXywgeyBpbml0aWFsQXJndW1lbnRzOiBbZmlyc3RBcmd1bWVudF0gfSkgPT4gZmlyc3RBcmd1bWVudFxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbn0pLmNvbmZpZ3VyZSAoe1xuXG4gICAgdGltZTogZmFsc2UgLy8gZGlzYWJsZXMgJ3RpbWUnIHN0ZXAgKHVudGlsIGVuYWJsZWQgYmFjayBleHBsaWNpdGx5KVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbn0pLm1ldGhvZHMgKHtcblxuICAgIGdldCBudWxsICgpIHsgcmV0dXJuIHBpcGV6ICh7IHJldHVyblZhbHVlOiBhcmdzID0+IGFyZ3NbMF0gfSkubWV0aG9kcyAodGhpcy5tZXRob2RzXykgfSxcblxuICAgIGluZGVudCAobGV2ZWwpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IGluZGVudDogeyBsZXZlbDogbGV2ZWwgfX0pIH0sXG5cbiAgICBnZXQgZXJyb3IgKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgcmVuZGVyOiB7IGNvbnNvbGVNZXRob2Q6ICdlcnJvcicgfSB9KSB9LFxuICAgIGdldCB3YXJuICgpICB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyByZW5kZXI6IHsgY29uc29sZU1ldGhvZDogJ3dhcm4nIH0gfSkgfSxcbiAgICBnZXQgaW5mbyAoKSAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgcmVuZGVyOiB7IGNvbnNvbGVNZXRob2Q6ICdpbmZvJyB9IH0pIH0sXG5cbiAgICBtYXhBcnJheUxlbmd0aCAobikgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heEFycmF5TGVuZ3RoOiBuIH0gfSkgfSxcbiAgICBtYXhEZXB0aCAobikgICAgICAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heERlcHRoOiBuIH0gfSkgfSxcbiAgICBtYXhMZW5ndGggKG4pICAgICAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heExlbmd0aDogbiB9IH0pIH0sXG4gICAgXG4gICAgZ2V0IHVubGltaXRlZCAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgbWF4U3RyaW5nTGVuZ3RoOiBOdW1iZXIuTUFYX1ZBTFVFLCBtYXhBcnJheUxlbmd0aDogTnVtYmVyLk1BWF9WQUxVRSwgbWF4RGVwdGg6IE51bWJlci5NQVhfVkFMVUUgfSB9KSB9LFxuICAgIGdldCBub1ByZXR0eSAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgcHJldHR5OiBmYWxzZSB9IH0pIH0sXG4gICAgZ2V0IG5vTG9jYXRlICgpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IGxvY2F0ZTogZmFsc2UgfSkgfSxcbiAgICBwcmVjaXNpb24gKG4pIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHN0cmluZ2lmeTogeyBwcmVjaXNpb246IG4gfSB9KSB9LFxuXG4gICAgZ2V0IHNlcmlhbGl6ZSAoKSB7IHJldHVybiB0aGlzLmJlZm9yZSAoJ3JlbmRlcicpIH0sXG4gICAgZ2V0IGRlc2VyaWFsaXplICgpIHsgcmV0dXJuIHRoaXMuZnJvbSAoJ3JlbmRlcicpIH0sXG5cbiAgICBuZXdsaW5lICgpIHsgcmV0dXJuIHRoaXMuZnJvbSAoJ2pvaW4nKShbJyddKSB9LFxuXG4gICAgaGFuZGxlTm9kZUVycm9ycyAoKSB7XG4gICAgICAgIHByb2Nlc3Mub24gKCd1bmNhdWdodEV4Y2VwdGlvbicsICBlID0+IHsgdGhpcy5icmlnaHQucmVkLmVycm9yLm5vTG9jYXRlIChlKTsgcHJvY2Vzcy5leGl0ICgxKSB9KVxuICAgICAgICBwcm9jZXNzLm9uICgndW5oYW5kbGVkUmVqZWN0aW9uJywgZSA9PiB7IHRoaXMuYnJpZ2h0LnJlZC5lcnJvci5ub0xvY2F0ZSAoZSk7IHByb2Nlc3MuZXhpdCAoMSkgfSlcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG59KVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbmFuc2kubmFtZXMuZm9yRWFjaCAoY29sb3IgPT4ge1xuXG4gICAgbG9nLm1ldGhvZHMgKHtcblxuICAgICAgICBnZXQgW2NvbG9yXSAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyAnY29uY2F0Kyc6IGxpbmVzID0+IGxpbmVzLm1hcCAoYW5zaVtjb2xvcl0pIH0pIH1cbiAgICB9KVxufSlcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ1xuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cblxuIl19