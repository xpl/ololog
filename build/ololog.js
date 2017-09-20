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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFPLEtBQUssU0FBTCxDQUFnQixFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsT0FBTyxTQUF6QixFQUFvQyxVQUFVLE9BQU8sU0FBckQsRUFBYixFQUFoQixDQUFQO0FBQXlHLEtBZHBIO0FBZVIsUUFBSSxRQUFKLEdBQWdCO0FBQUUsZUFBTyxLQUFLLFNBQUwsQ0FBZ0IsRUFBRSxXQUFXLEVBQUUsUUFBUSxLQUFWLEVBQWIsRUFBaEIsQ0FBUDtBQUEwRCxLQWZwRTtBQWdCUixhQWhCUSxxQkFnQkcsQ0FoQkgsRUFnQk07QUFBRSxlQUFPLEtBQUssU0FBTCxDQUFnQixFQUFFLFdBQVcsRUFBRSxXQUFXLENBQWIsRUFBYixFQUFoQixDQUFQO0FBQXlELEtBaEJqRTs7O0FBa0JSLFFBQUksU0FBSixHQUFpQjtBQUFFLGVBQU8sS0FBSyxNQUFMLENBQWEsUUFBYixDQUFQO0FBQStCLEtBbEIxQztBQW1CUixRQUFJLFdBQUosR0FBbUI7QUFBRSxlQUFPLEtBQUssSUFBTCxDQUFXLFFBQVgsQ0FBUDtBQUE2QixLQW5CMUM7O0FBcUJSLFdBckJRLHFCQXFCRztBQUFFLGVBQU8sS0FBSyxJQUFMLENBQVcsTUFBWCxFQUFtQixDQUFDLEVBQUQsQ0FBbkIsQ0FBUDtBQUFpQztBQXJCdEMsQ0FoRkEsQ0FBWjs7QUF3R0E7O0FBRUEsS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFvQixpQkFBUztBQUFBOztBQUV6QixRQUFJLE9BQUosbURBRVMsS0FGVCxnQkFFUyxLQUZULHFCQUVTLEtBRlQsb0JBRW1CO0FBQUUsZUFBTyxLQUFLLFNBQUwsQ0FBZ0IsRUFBRSxXQUFXO0FBQUEsdUJBQVMsTUFBTSxHQUFOLENBQVcsS0FBSyxLQUFMLENBQVgsQ0FBVDtBQUFBLGFBQWIsRUFBaEIsQ0FBUDtBQUF5RSxLQUY5RjtBQUlILENBTkQ7O0FBUUE7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLEdBQWpCOztBQUVBIiwiZmlsZSI6Im9sb2xvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbmNvbnN0IE8gICAgICAgICAgICAgICAgID0gT2JqZWN0XG4gICAgLCBTdGFja1RyYWNleSAgICAgICA9IHJlcXVpcmUgKCdzdGFja3RyYWNleScpXG4gICAgLCBhbnNpICAgICAgICAgICAgICA9IHJlcXVpcmUgKCdhbnNpY29sb3InKVxuICAgICwgYnVsbGV0ICAgICAgICAgICAgPSByZXF1aXJlICgnc3RyaW5nLmJ1bGxldCcpXG4gICAgLCBwaXBleiAgICAgICAgICAgICA9IHJlcXVpcmUgKCdwaXBleicpXG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuY29uc3Qgc3RyaW5naWZ5ID0gcmVxdWlyZSAoJ3N0cmluZy5pZnknKS5jb25maWd1cmUgKHtcblxuICAgIGZvcm1hdHRlciAoeCkge1xuXG4gICAgICAgIGlmICgoeCBpbnN0YW5jZW9mIEVycm9yKSAmJiAhKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIHhbU3ltYm9sLmZvciAoJ1N0cmluZy5pZnknKV0pKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHdoeSAgICAgICAgICAgPSBzdHJpbmdpZnkubGltaXQgKCh4Lm1lc3NhZ2UgfHwgJycpLnJlcGxhY2UgKC9cXHJ8XFxuL2csICcnKS50cmltICgpLCAxMjApLFxuICAgICAgICAgICAgICAgICAgc3RhY2sgICAgICAgICA9IG5ldyBTdGFja1RyYWNleSAoeCkucHJldHR5LFxuICAgICAgICAgICAgICAgICAgc3RhY2tJbmRlbnRlZCA9IHN0YWNrLnNwbGl0ICgnXFxuJykubWFwICh4ID0+ICcgICAgJyArIHgpLmpvaW4gKCdcXG4nKVxuXG4gICAgICAgICAgICByZXR1cm4gYFtFWENFUFRJT05dICR7d2h5fVxcblxcbiR7c3RhY2tJbmRlbnRlZH1cXG5gXG4gICAgICAgIH1cbiAgICB9XG59KVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbmNvbnN0IHsgaXNCbGFuaywgYmxhbmsgfSA9IHJlcXVpcmUgKCdwcmludGFibGUtY2hhcmFjdGVycycpXG5cbiAgICAsIGNoYW5nZUxhc3ROb25lbXB0eUxpbmUgPSAobGluZXMsIGZuKSA9PiB7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICgoaSA9PT0gMCkgfHwgIWlzQmxhbmsgKGxpbmVzW2ldKSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gZm4gKGxpbmVzW2ldKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5lc1xuICAgIH1cblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5jb25zdCBsb2cgPSBwaXBleiAoe1xuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbiAgICBzdHJpbmdpZnk6IChhcmdzLCBjZmcsIHByaW50ID0gc3RyaW5naWZ5LmNvbmZpZ3VyZSAoY2ZnKSkgPT4gYXJncy5tYXAgKGFyZyA9PiAodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycpID8gYXJnIDogcHJpbnQgKGFyZykpLFxuICAgIFxuICAgIHRyaW06ICh0b2tlbnMsIHsgbWF4ID0gdW5kZWZpbmVkIH0pID0+ICFtYXggPyB0b2tlbnMgOiB0b2tlbnMubWFwICh0ID0+IHN0cmluZ2lmeS5saW1pdCAodCwgbWF4KSksXG5cbiAgICBsaW5lczogKHRva2VucywgeyBsaW5lYnJlYWsgPSAnXFxuJyB9KSA9PiB7XG5cbiAgICAgICAgbGV0IGxpbmVzID0gW1tdXVxuICAgICAgICBsZXQgbGVmdFBhZCA9IFtdXG5cbiAgICAgICAgZm9yIChjb25zdCB0IG9mIHRva2Vucykge1xuXG4gICAgICAgICAgICBjb25zdCBbZmlyc3QsIC4uLnJlc3RdID0gdC5zcGxpdCAobGluZWJyZWFrKVxuXG4gICAgICAgICAgICBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5wdXNoIChmaXJzdClcbiAgICAgICAgICAgIGxpbmVzID0gWy4uLmxpbmVzLCAuLi5yZXN0Lm1hcCAodCA9PiB0ID8gWy4uLmxlZnRQYWQsIHRdIDogW10pXVxuXG4gICAgICAgICAgICBjb25zdCBwYWQgPSBibGFuayAoIXJlc3QubGVuZ3RoID8gdCA6IHJlc3RbcmVzdC5sZW5ndGggLSAxXSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHBhZCkgeyBsZWZ0UGFkLnB1c2ggKHBhZCkgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpbmVzXG4gICAgfSxcblxuICAgIGNvbmNhdDogKGxpbmVzLCB7IHNlcGFyYXRvciA9ICcgJyB9KSA9PiBsaW5lcy5tYXAgKHRva2VucyA9PiB0b2tlbnMuam9pbiAoc2VwYXJhdG9yKSksXG5cbiAgICBpbmRlbnQ6IChsaW5lcywgeyBsZXZlbCA9IDAsIHBhdHRlcm4gPSAnXFx0JyB9KSA9PiBsaW5lcy5tYXAgKGxpbmUgPT4gcGF0dGVybi5yZXBlYXQgKGxldmVsKSArIGxpbmUpLFxuICAgIFxuICAgIHRpbWU6IChsaW5lcywgeyB3aGVuICA9IG5ldyBEYXRlICgpLFxuICAgICAgICAgICAgICAgICAgICBwcmludCA9IHdoZW4gPT4gYW5zaS5kYXJrR3JheSAod2hlbi50b0lTT1N0cmluZyAoKSkgKyAnXFx0JyB9KSA9PiBidWxsZXQgKHByaW50ICh3aGVuKSwgbGluZXMpLFxuXG4gICAgbG9jYXRlOiAobGluZXMsIHtcblxuICAgICAgICAgICAgICAgICAgICBzaGlmdCA9IDAsXG4gICAgICAgICAgICAgICAgICAgIHdoZXJlID0gKG5ldyBTdGFja1RyYWNleSAoKS5jbGVhbi5hdCAoMiArIHNoaWZ0KSksXG4gICAgICAgICAgICAgICAgICAgIGpvaW4gID0gKChhLCBzZXAsIGIpID0+IChhICYmIGIpID8gKGEgKyBzZXAgKyBiKSA6IChhIHx8IGIpKSxcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQgPSAoeyBjYWxsZWVTaG9ydCwgZmlsZU5hbWUgPSBbXSwgbGluZSA9IFtdIH0pID0+IGFuc2kuZGFya0dyYXkgKCcoJyArIGpvaW4gKGNhbGxlZVNob3J0LCAnIEAgJywgam9pbiAoZmlsZU5hbWUsICc6JywgbGluZSkpICsgJyknKVxuXG4gICAgICAgICAgICAgICAgfSkgPT4gY2hhbmdlTGFzdE5vbmVtcHR5TGluZSAobGluZXMsIGxpbmUgPT4gam9pbiAobGluZSwgJyAnLCBwcmludCAod2hlcmUpKSksXG5cbiAgICBqb2luOiAobGluZXMsIHsgbGluZWJyZWFrID0gJ1xcbicgfSkgPT4gbGluZXMuam9pbiAobGluZWJyZWFrKSxcblxuICAgIHJlbmRlcjogKHRleHQsIHtcblxuICAgICAgICBlbmdpbmUgPSAoKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSAmJiAod2luZG93LndpbmRvdyA9PT0gd2luZG93KSAmJiB3aW5kb3cubmF2aWdhdG9yKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mICgnQ2hyb21lJykgPj0gMClcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdjaHJvbWUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2dlbmVyaWMnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdhbnNpJyxcblxuICAgICAgICBlbmdpbmVzID0geyAvKiBjb25maWd1cmFibGUgKi8gfSxcblxuICAgICAgICBjb25zb2xlTWV0aG9kID0gJ2xvZycsXG5cbiAgICAgICAgZGVmYXVsdHMgPSB7XG5cbiAgICAgICAgICAgIGFuc2k6ICAgIHMgPT4gY29uc29sZVtjb25zb2xlTWV0aG9kXSAocyksXG4gICAgICAgICAgICBjaHJvbWU6ICBzID0+IGNvbnNvbGVbY29uc29sZU1ldGhvZF0gKC4uLmFuc2kucGFyc2UgKHMpLmFzQ2hyb21lQ29uc29sZUxvZ0FyZ3VtZW50cyksXG4gICAgICAgICAgICBnZW5lcmljOiBzID0+IGNvbnNvbGVbY29uc29sZU1ldGhvZF0gKGFuc2kuc3RyaXAgKHMpKVxuICAgICAgICB9XG5cbiAgICB9KSA9PiAoKHRleHQgJiYgTy5hc3NpZ24gKGRlZmF1bHRzLCBlbmdpbmVzKVtlbmdpbmVdICh0ZXh0KSwgdGV4dCkpLFxuXG4gICAgcmV0dXJuVmFsdWU6IChfXywgeyBpbml0aWFsQXJndW1lbnRzOiBbZmlyc3RBcmd1bWVudF0gfSkgPT4gZmlyc3RBcmd1bWVudFxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbn0pLmNvbmZpZ3VyZSAoe1xuXG4gICAgdGltZTogZmFsc2UgLy8gZGlzYWJsZXMgJ3RpbWUnIHN0ZXAgKHVudGlsIGVuYWJsZWQgYmFjayBleHBsaWNpdGx5KVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbn0pLm1ldGhvZHMgKHtcblxuICAgIGdldCBudWxsICgpIHsgcmV0dXJuIHBpcGV6ICh7IHJldHVyblZhbHVlOiBhcmdzID0+IGFyZ3NbMF0gfSkubWV0aG9kcyAodGhpcy5tZXRob2RzXykgfSxcblxuICAgIGluZGVudCAobGV2ZWwpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IGluZGVudDogeyBsZXZlbDogbGV2ZWwgfX0pIH0sXG5cbiAgICBnZXQgZXJyb3IgKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgcmVuZGVyOiB7IGNvbnNvbGVNZXRob2Q6ICdlcnJvcicgfSB9KSB9LFxuICAgIGdldCB3YXJuICgpICB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyByZW5kZXI6IHsgY29uc29sZU1ldGhvZDogJ3dhcm4nIH0gfSkgfSxcbiAgICBnZXQgaW5mbyAoKSAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgcmVuZGVyOiB7IGNvbnNvbGVNZXRob2Q6ICdpbmZvJyB9IH0pIH0sXG5cbiAgICBtYXhBcnJheUxlbmd0aCAobikgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heEFycmF5TGVuZ3RoOiBuIH0gfSkgfSxcbiAgICBtYXhEZXB0aCAobikgICAgICAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heERlcHRoOiBuIH0gfSkgfSxcbiAgICBtYXhMZW5ndGggKG4pICAgICAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heExlbmd0aDogbiB9IH0pIH0sXG4gICAgXG4gICAgZ2V0IHVubGltaXRlZCAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgbWF4QXJyYXlMZW5ndGg6IE51bWJlci5NQVhfVkFMVUUsIG1heERlcHRoOiBOdW1iZXIuTUFYX1ZBTFVFIH0gfSkgfSxcbiAgICBnZXQgbm9QcmV0dHkgKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IHByZXR0eTogZmFsc2UgfSB9KSB9LFxuICAgIHByZWNpc2lvbiAobikgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IHByZWNpc2lvbjogbiB9IH0pIH0sXG5cbiAgICBnZXQgc2VyaWFsaXplICgpIHsgcmV0dXJuIHRoaXMuYmVmb3JlICgncmVuZGVyJykgfSxcbiAgICBnZXQgZGVzZXJpYWxpemUgKCkgeyByZXR1cm4gdGhpcy5mcm9tICgncmVuZGVyJykgfSxcblxuICAgIG5ld2xpbmUgKCkgeyByZXR1cm4gdGhpcy5mcm9tICgnam9pbicpKFsnJ10pIH1cbn0pXG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuYW5zaS5uYW1lcy5mb3JFYWNoIChjb2xvciA9PiB7XG5cbiAgICBsb2cubWV0aG9kcyAoe1xuXG4gICAgICAgIGdldCBbY29sb3JdICgpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7ICdjb25jYXQrJzogbGluZXMgPT4gbGluZXMubWFwIChhbnNpW2NvbG9yXSkgfSkgfVxuICAgIH0pXG59KVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbm1vZHVsZS5leHBvcnRzID0gbG9nXG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuXG4iXX0=