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

                var actual = bullet(indent + 'actual:   ', stringify(x.actual)),
                    expected = bullet(indent + 'expected: ', stringify(x.expected));

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QWdCLEVBQUUsUUFBUSxLQUFWLEVBQWhCLENBQVA7QUFBMkMsS0FoQnJEO0FBaUJSLGFBakJRLHFCQWlCRyxDQWpCSCxFQWlCTTtBQUFFLGVBQU8sS0FBSyxTQUFMLENBQWdCLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBYixFQUFiLEVBQWhCLENBQVA7QUFBeUQsS0FqQmpFOzs7QUFtQlIsUUFBSSxTQUFKLEdBQWlCO0FBQUUsZUFBTyxLQUFLLE1BQUwsQ0FBYSxRQUFiLENBQVA7QUFBK0IsS0FuQjFDO0FBb0JSLFFBQUksV0FBSixHQUFtQjtBQUFFLGVBQU8sS0FBSyxJQUFMLENBQVcsUUFBWCxDQUFQO0FBQTZCLEtBcEIxQzs7QUFzQlIsV0F0QlEscUJBc0JHO0FBQUUsZUFBTyxLQUFLLElBQUwsQ0FBVyxNQUFYLEVBQW1CLENBQUMsRUFBRCxDQUFuQixDQUFQO0FBQWlDO0FBdEJ0QyxDQWhGQSxDQUFaOztBQXlHQTs7QUFFQSxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW9CLGlCQUFTO0FBQUE7O0FBRXpCLFFBQUksT0FBSixtREFFUyxLQUZULGdCQUVTLEtBRlQscUJBRVMsS0FGVCxvQkFFbUI7QUFBRSxlQUFPLEtBQUssU0FBTCxDQUFnQixFQUFFLFdBQVc7QUFBQSx1QkFBUyxNQUFNLEdBQU4sQ0FBVyxLQUFLLEtBQUwsQ0FBWCxDQUFUO0FBQUEsYUFBYixFQUFoQixDQUFQO0FBQXlFLEtBRjlGO0FBSUgsQ0FORDs7QUFRQTs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsR0FBakI7O0FBRUEiLCJmaWxlIjoib2xvbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuY29uc3QgTyAgICAgICAgICAgICAgICAgPSBPYmplY3RcbiAgICAsIFN0YWNrVHJhY2V5ICAgICAgID0gcmVxdWlyZSAoJ3N0YWNrdHJhY2V5JylcbiAgICAsIGFuc2kgICAgICAgICAgICAgID0gcmVxdWlyZSAoJ2Fuc2ljb2xvcicpXG4gICAgLCBidWxsZXQgICAgICAgICAgICA9IHJlcXVpcmUgKCdzdHJpbmcuYnVsbGV0JylcbiAgICAsIHBpcGV6ICAgICAgICAgICAgID0gcmVxdWlyZSAoJ3BpcGV6JylcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5cbmNvbnN0IHN0cmluZ2lmeSA9IHJlcXVpcmUgKCdzdHJpbmcuaWZ5JykuY29uZmlndXJlICh7XG5cbiAgICBmb3JtYXR0ZXIgKHgsIHN0cmluZ2lmeSkge1xuXG4gICAgICAgIGlmICgoeCBpbnN0YW5jZW9mIEVycm9yKSAmJiAhKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIHhbU3ltYm9sLmZvciAoJ1N0cmluZy5pZnknKV0pKSB7XG5cbiAgICAgICAgICAgIGlmIChzdHJpbmdpZnkuc3RhdGUuZGVwdGggPiAwKSByZXR1cm4gYDxFcnJvcjogJHt4Lm1lc3NhZ2V9PmAgLy8gcHJldmVudHMgdW53YW50ZWQgcHJldHR5IHByaW50aW5nIGZvciBFcnJvcnMgdGhhdCBhcmUgcHJvcGVydGllcyBvZiBjb21wbGV4IG9iamVjdHNcblxuICAgICAgICAgICAgY29uc3QgaW5kZW50ICAgICAgICA9ICcgICAgJ1xuICAgICAgICAgICAgICAgICwgd2h5ICAgICAgICAgICA9IHN0cmluZ2lmeS5saW1pdCAoKHgubWVzc2FnZSB8fCAnJykucmVwbGFjZSAoL1xccnxcXG4vZywgJycpLnRyaW0gKCksIDEyMClcbiAgICAgICAgICAgICAgICAsIHN0YWNrICAgICAgICAgPSBuZXcgU3RhY2tUcmFjZXkgKHgpLnByZXR0eVxuICAgICAgICAgICAgICAgICwgc3RhY2tJbmRlbnRlZCA9IHN0YWNrLnNwbGl0ICgnXFxuJykubWFwICh4ID0+IGluZGVudCArIHgpLmpvaW4gKCdcXG4nKVxuICAgICAgICAgICAgICAgICwgaXNBc3NlcnRpb24gPSAoJ2FjdHVhbCcgaW4geCkgJiYgKCdleHBlY3RlZCcgaW4geClcbiAgICAgICAgICAgICAgICAsIHR5cGUgICAgICAgID0geC5jb25zdHJ1Y3Rvci5uYW1lIHx8ICdFcnJvcidcblxuICAgICAgICAgICAgaWYgKGlzQXNzZXJ0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgYWN0dWFsICAgPSBidWxsZXQgKGluZGVudCArICdhY3R1YWw6ICAgJywgc3RyaW5naWZ5ICh4LmFjdHVhbCkpXG4gICAgICAgICAgICAgICAgICAsIGV4cGVjdGVkID0gYnVsbGV0IChpbmRlbnQgKyAnZXhwZWN0ZWQ6ICcsIHN0cmluZ2lmeSAoeC5leHBlY3RlZCkpXG5cbiAgICAgICAgICAgICAgICBpZiAoKGFjdHVhbC5zcGxpdCAoJ1xcbicpLmxlbmd0aCA+IDEpIHx8IChleHBlY3RlZC5zcGxpdCAoJ1xcbicpLmxlbmd0aCA+IDEpKSAvLyBpZiBtdWx0aWxpbmUgYWN0dWFsL2V4cGVjdGVkLCBuZWVkIGV4dHJhIHdoaXRlc3BhY2UgaW5iZXR3ZWVuXG4gICAgICAgICAgICAgICAgICAgIGFjdHVhbCArPSAnXFxuJ1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGBbJHt0eXBlfV0gJHt3aHl9XFxuXFxuJHthbnNpLnJlZCAoYWN0dWFsKX1cXG4ke2Fuc2kuZ3JlZW4gKGV4cGVjdGVkKX1cXG5cXG4ke3N0YWNrSW5kZW50ZWR9XFxuYFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYFske3R5cGV9XSAke3doeX1cXG5cXG4ke3N0YWNrSW5kZW50ZWR9XFxuYFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSlcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5jb25zdCB7IGlzQmxhbmssIGJsYW5rIH0gPSByZXF1aXJlICgncHJpbnRhYmxlLWNoYXJhY3RlcnMnKVxuXG4gICAgLCBjaGFuZ2VMYXN0Tm9uZW1wdHlMaW5lID0gKGxpbmVzLCBmbikgPT4ge1xuXG4gICAgICAgIGZvciAobGV0IGkgPSBsaW5lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoKGkgPT09IDApIHx8ICFpc0JsYW5rIChsaW5lc1tpXSkpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBsaW5lc1tpXSA9IGZuIChsaW5lc1tpXSlcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGluZXNcbiAgICB9XG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuY29uc3QgbG9nID0gcGlwZXogKHtcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4gICAgc3RyaW5naWZ5OiAoYXJncywgY2ZnLCBwcmludCA9IHN0cmluZ2lmeS5jb25maWd1cmUgKGNmZykpID0+IGFyZ3MubWFwIChhcmcgPT4gKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnKSA/IGFyZyA6IHByaW50IChhcmcpKSxcbiAgICBcbiAgICB0cmltOiAodG9rZW5zLCB7IG1heCA9IHVuZGVmaW5lZCB9KSA9PiAhbWF4ID8gdG9rZW5zIDogdG9rZW5zLm1hcCAodCA9PiBzdHJpbmdpZnkubGltaXQgKHQsIG1heCkpLFxuXG4gICAgbGluZXM6ICh0b2tlbnMsIHsgbGluZWJyZWFrID0gJ1xcbicgfSkgPT4ge1xuXG4gICAgICAgIGxldCBsaW5lcyA9IFtbXV1cbiAgICAgICAgbGV0IGxlZnRQYWQgPSBbXVxuXG4gICAgICAgIGZvciAoY29uc3QgdCBvZiB0b2tlbnMpIHtcblxuICAgICAgICAgICAgY29uc3QgW2ZpcnN0LCAuLi5yZXN0XSA9IHQuc3BsaXQgKGxpbmVicmVhaylcblxuICAgICAgICAgICAgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ucHVzaCAoZmlyc3QpXG4gICAgICAgICAgICBsaW5lcyA9IFsuLi5saW5lcywgLi4ucmVzdC5tYXAgKHQgPT4gdCA/IFsuLi5sZWZ0UGFkLCB0XSA6IFtdKV1cblxuICAgICAgICAgICAgY29uc3QgcGFkID0gYmxhbmsgKCFyZXN0Lmxlbmd0aCA/IHQgOiByZXN0W3Jlc3QubGVuZ3RoIC0gMV0pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChwYWQpIHsgbGVmdFBhZC5wdXNoIChwYWQpIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsaW5lc1xuICAgIH0sXG5cbiAgICBjb25jYXQ6IChsaW5lcywgeyBzZXBhcmF0b3IgPSAnICcgfSkgPT4gbGluZXMubWFwICh0b2tlbnMgPT4gdG9rZW5zLmpvaW4gKHNlcGFyYXRvcikpLFxuXG4gICAgaW5kZW50OiAobGluZXMsIHsgbGV2ZWwgPSAwLCBwYXR0ZXJuID0gJ1xcdCcgfSkgPT4gbGluZXMubWFwIChsaW5lID0+IHBhdHRlcm4ucmVwZWF0IChsZXZlbCkgKyBsaW5lKSxcbiAgICBcbiAgICB0aW1lOiAobGluZXMsIHsgd2hlbiAgPSBuZXcgRGF0ZSAoKSxcbiAgICAgICAgICAgICAgICAgICAgcHJpbnQgPSB3aGVuID0+IGFuc2kuZGFya0dyYXkgKHdoZW4udG9JU09TdHJpbmcgKCkpICsgJ1xcdCcgfSkgPT4gYnVsbGV0IChwcmludCAod2hlbiksIGxpbmVzKSxcblxuICAgIGxvY2F0ZTogKGxpbmVzLCB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2hpZnQgPSAwLFxuICAgICAgICAgICAgICAgICAgICB3aGVyZSA9IChuZXcgU3RhY2tUcmFjZXkgKCkuY2xlYW4uYXQgKDIgKyBzaGlmdCkpLFxuICAgICAgICAgICAgICAgICAgICBqb2luICA9ICgoYSwgc2VwLCBiKSA9PiAoYSAmJiBiKSA/IChhICsgc2VwICsgYikgOiAoYSB8fCBiKSksXG4gICAgICAgICAgICAgICAgICAgIHByaW50ID0gKHsgY2FsbGVlU2hvcnQsIGZpbGVOYW1lID0gW10sIGxpbmUgPSBbXSB9KSA9PiBhbnNpLmRhcmtHcmF5ICgnKCcgKyBqb2luIChjYWxsZWVTaG9ydCwgJyBAICcsIGpvaW4gKGZpbGVOYW1lLCAnOicsIGxpbmUpKSArICcpJylcblxuICAgICAgICAgICAgICAgIH0pID0+IGNoYW5nZUxhc3ROb25lbXB0eUxpbmUgKGxpbmVzLCBsaW5lID0+IGpvaW4gKGxpbmUsICcgJywgcHJpbnQgKHdoZXJlKSkpLFxuXG4gICAgam9pbjogKGxpbmVzLCB7IGxpbmVicmVhayA9ICdcXG4nIH0pID0+IGxpbmVzLmpvaW4gKGxpbmVicmVhayksXG5cbiAgICByZW5kZXI6ICh0ZXh0LCB7XG5cbiAgICAgICAgZW5naW5lID0gKCh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgJiYgKHdpbmRvdy53aW5kb3cgPT09IHdpbmRvdykgJiYgd2luZG93Lm5hdmlnYXRvcilcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZiAoJ0Nocm9tZScpID49IDApXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnY2hyb21lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdnZW5lcmljJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnYW5zaScsXG5cbiAgICAgICAgZW5naW5lcyA9IHsgLyogY29uZmlndXJhYmxlICovIH0sXG5cbiAgICAgICAgY29uc29sZU1ldGhvZCA9ICdsb2cnLFxuXG4gICAgICAgIGRlZmF1bHRzID0ge1xuXG4gICAgICAgICAgICBhbnNpOiAgICBzID0+IGNvbnNvbGVbY29uc29sZU1ldGhvZF0gKHMpLFxuICAgICAgICAgICAgY2hyb21lOiAgcyA9PiBjb25zb2xlW2NvbnNvbGVNZXRob2RdICguLi5hbnNpLnBhcnNlIChzKS5hc0Nocm9tZUNvbnNvbGVMb2dBcmd1bWVudHMpLFxuICAgICAgICAgICAgZ2VuZXJpYzogcyA9PiBjb25zb2xlW2NvbnNvbGVNZXRob2RdIChhbnNpLnN0cmlwIChzKSlcbiAgICAgICAgfVxuXG4gICAgfSkgPT4gKCh0ZXh0ICYmIE8uYXNzaWduIChkZWZhdWx0cywgZW5naW5lcylbZW5naW5lXSAodGV4dCksIHRleHQpKSxcblxuICAgIHJldHVyblZhbHVlOiAoX18sIHsgaW5pdGlhbEFyZ3VtZW50czogW2ZpcnN0QXJndW1lbnRdIH0pID0+IGZpcnN0QXJndW1lbnRcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG59KS5jb25maWd1cmUgKHtcblxuICAgIHRpbWU6IGZhbHNlIC8vIGRpc2FibGVzICd0aW1lJyBzdGVwICh1bnRpbCBlbmFibGVkIGJhY2sgZXhwbGljaXRseSlcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG59KS5tZXRob2RzICh7XG5cbiAgICBnZXQgbnVsbCAoKSB7IHJldHVybiBwaXBleiAoeyByZXR1cm5WYWx1ZTogYXJncyA9PiBhcmdzWzBdIH0pLm1ldGhvZHMgKHRoaXMubWV0aG9kc18pIH0sXG5cbiAgICBpbmRlbnQgKGxldmVsKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBpbmRlbnQ6IHsgbGV2ZWw6IGxldmVsIH19KSB9LFxuXG4gICAgZ2V0IGVycm9yICgpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHJlbmRlcjogeyBjb25zb2xlTWV0aG9kOiAnZXJyb3InIH0gfSkgfSxcbiAgICBnZXQgd2FybiAoKSAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgcmVuZGVyOiB7IGNvbnNvbGVNZXRob2Q6ICd3YXJuJyB9IH0pIH0sXG4gICAgZ2V0IGluZm8gKCkgIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHJlbmRlcjogeyBjb25zb2xlTWV0aG9kOiAnaW5mbycgfSB9KSB9LFxuXG4gICAgbWF4QXJyYXlMZW5ndGggKG4pIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHN0cmluZ2lmeTogeyBtYXhBcnJheUxlbmd0aDogbiB9IH0pIH0sXG4gICAgbWF4RGVwdGggKG4pICAgICAgIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHN0cmluZ2lmeTogeyBtYXhEZXB0aDogbiB9IH0pIH0sXG4gICAgbWF4TGVuZ3RoIChuKSAgICAgIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHN0cmluZ2lmeTogeyBtYXhMZW5ndGg6IG4gfSB9KSB9LFxuICAgIFxuICAgIGdldCB1bmxpbWl0ZWQgKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IG1heFN0cmluZ0xlbmd0aDogTnVtYmVyLk1BWF9WQUxVRSwgbWF4QXJyYXlMZW5ndGg6IE51bWJlci5NQVhfVkFMVUUsIG1heERlcHRoOiBOdW1iZXIuTUFYX1ZBTFVFIH0gfSkgfSxcbiAgICBnZXQgbm9QcmV0dHkgKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IHByZXR0eTogZmFsc2UgfSB9KSB9LFxuICAgIGdldCBub0xvY2F0ZSAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBsb2NhdGU6IGZhbHNlIH0pIH0sXG4gICAgcHJlY2lzaW9uIChuKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgcHJlY2lzaW9uOiBuIH0gfSkgfSxcblxuICAgIGdldCBzZXJpYWxpemUgKCkgeyByZXR1cm4gdGhpcy5iZWZvcmUgKCdyZW5kZXInKSB9LFxuICAgIGdldCBkZXNlcmlhbGl6ZSAoKSB7IHJldHVybiB0aGlzLmZyb20gKCdyZW5kZXInKSB9LFxuXG4gICAgbmV3bGluZSAoKSB7IHJldHVybiB0aGlzLmZyb20gKCdqb2luJykoWycnXSkgfVxufSlcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5hbnNpLm5hbWVzLmZvckVhY2ggKGNvbG9yID0+IHtcblxuICAgIGxvZy5tZXRob2RzICh7XG5cbiAgICAgICAgZ2V0IFtjb2xvcl0gKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgJ2NvbmNhdCsnOiBsaW5lcyA9PiBsaW5lcy5tYXAgKGFuc2lbY29sb3JdKSB9KSB9XG4gICAgfSlcbn0pXG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBsb2dcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5cbiJdfQ==