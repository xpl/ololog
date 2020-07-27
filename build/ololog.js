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
                why = stringify.limit((x.message || '').replace(/\r|\n/g, '').trim(), stringify.state.maxErrorMessageLength || 120),
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
        var print = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : cfg.print || _stringify.configure(cfg);
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

    tag: function tag(lines, _ref5) {
        var _ref5$level = _ref5.level,
            level = _ref5$level === undefined ? '' : _ref5$level,
            _ref5$levelColor = _ref5.levelColor,
            levelColor = _ref5$levelColor === undefined ? {
            'info': ansi.cyan,
            'warn': ansi.yellow,
            'debug': ansi.blue,
            'error': ansi.bright.red } : _ref5$levelColor;
        return bullet((levelColor[level] || function (s) {
            return s;
        })(level.toUpperCase().padStart(6) + '\t'), lines);
    },

    time: function time(lines, _ref6) {
        var _ref6$when = _ref6.when,
            when = _ref6$when === undefined ? new Date() : _ref6$when,
            _ref6$format = _ref6.format,
            format = _ref6$format === undefined ? 'locale' : _ref6$format,
            _ref6$locale = _ref6.locale,
            locale = _ref6$locale === undefined ? [] : _ref6$locale,
            _ref6$options = _ref6.options,
            options = _ref6$options === undefined ? {} : _ref6$options,
            _ref6$print = _ref6.print,
            print = _ref6$print === undefined ? function (when) {
            return ansi.darkGray(format === 'iso' ? when.toISOString() : format === 'locale' ? when.toLocaleString(locale, options) : format === 'utc' ? when.toUTCString() : when.toString()) + '\t';
        } : _ref6$print;
        return bullet(print(when), lines);
    },

    locate: function locate(lines, _ref7) {
        var _ref7$shift = _ref7.shift,
            shift = _ref7$shift === undefined ? 0 : _ref7$shift,
            _ref7$where = _ref7.where,
            where = _ref7$where === undefined ? new StackTracey().clean.at(1 + shift) : _ref7$where,
            _ref7$join = _ref7.join,
            join = _ref7$join === undefined ? function (a, sep, b) {
            return a && b ? a + sep + b : a || b;
        } : _ref7$join,
            _ref7$print = _ref7.print,
            print = _ref7$print === undefined ? function (_ref8) {
            var calleeShort = _ref8.calleeShort,
                _ref8$fileName = _ref8.fileName,
                fileName = _ref8$fileName === undefined ? [] : _ref8$fileName,
                _ref8$line = _ref8.line,
                line = _ref8$line === undefined ? [] : _ref8$line;
            return ansi.darkGray('(' + join(calleeShort, ' @ ', join(fileName, ':', line)) + ')');
        } : _ref7$print;
        return changeLastNonemptyLine(lines, function (line) {
            return join(line, ' ', print(where));
        });
    },

    join: function join(lines, _ref9) {
        var _ref9$linebreak = _ref9.linebreak,
            linebreak = _ref9$linebreak === undefined ? '\n' : _ref9$linebreak;
        return lines.join(linebreak);
    },

    render: function render(text, _ref10) {
        var _ref10$engine = _ref10.engine,
            engine = _ref10$engine === undefined ? typeof window !== 'undefined' && window.window === window && window.navigator ? navigator.userAgent.indexOf('Chrome') >= 0 ? 'chrome' : 'generic' : 'ansi' : _ref10$engine,
            _ref10$engines = _ref10.engines,
            engines = _ref10$engines === undefined ? {/* configurable */} : _ref10$engines,
            _ref10$consoleMethod = _ref10.consoleMethod,
            consoleMethod = _ref10$consoleMethod === undefined ? 'log' : _ref10$consoleMethod,
            _ref10$defaults = _ref10.defaults,
            defaults = _ref10$defaults === undefined ? {

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
        } : _ref10$defaults;
        return text && O.assign(defaults, engines)[engine](text), text;
    },

    returnValue: function returnValue(__, _ref11) {
        var _ref11$initialArgumen = _slicedToArray(_ref11.initialArguments, 1),
            firstArgument = _ref11$initialArgumen[0];

        return firstArgument;
    }

    /*  ------------------------------------------------------------------------ */

}).configure({

    time: false, // disables some steps (until enabled back explicitly)
    tag: false

    /*  ------------------------------------------------------------------------ */

}).methods({

    get noop() {
        return pipez({ returnValue: function returnValue(args) {
                return args[0];
            } }).methods(this.methods_);
    },
    get null() {
        return this.noop;
    }, // LEGACY, DEPRECATED (left here for backward compatibility)

    indent: function indent(level) {
        return this.configure({ indent: { level: level } });
    },


    get error() {
        return this.configure({ tag: { level: 'error' }, render: { consoleMethod: 'error' } });
    },
    get warn() {
        return this.configure({ tag: { level: 'warn' }, render: { consoleMethod: 'warn' } });
    },
    get info() {
        return this.configure({ tag: { level: 'info' }, render: { consoleMethod: 'info' } });
    },
    get debug() {
        return this.configure({ tag: { level: 'debug' }, render: { consoleMethod: 'debug' } });
    },

    maxArrayLength: function maxArrayLength(n) {
        return this.configure({ stringify: { maxArrayLength: n } });
    },
    maxObjectLength: function maxObjectLength(n) {
        return this.configure({ stringify: { maxObjectLength: n } });
    },
    maxDepth: function maxDepth(n) {
        return this.configure({ stringify: { maxDepth: n } });
    },
    maxLength: function maxLength(n) {
        return this.configure({ stringify: { maxLength: n } });
    },


    get unlimited() {
        return this.configure({ stringify: { maxStringLength: Number.MAX_VALUE,
                maxObjectLength: Number.MAX_VALUE,
                maxArrayLength: Number.MAX_VALUE,
                maxDepth: Number.MAX_VALUE,
                maxErrorMessageLength: Number.MAX_VALUE } });
    },

    get noPretty() {
        return this.configure({ stringify: { pretty: false } });
    },
    get noFancy() {
        return this.configure({ stringify: { fancy: false } });
    },
    get noRightAlignKeys() {
        return this.configure({ stringify: { rightAlignKeys: false } });
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QWtDUixvQkFsQ1EsOEJBa0NZO0FBQUE7O0FBQ2hCLGdCQUFRLEVBQVIsQ0FBWSxtQkFBWixFQUFrQyxhQUFLO0FBQUUsa0JBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBc0IsUUFBdEIsQ0FBZ0MsQ0FBaEMsRUFBb0MsUUFBUSxJQUFSLENBQWMsQ0FBZDtBQUFrQixTQUEvRjtBQUNBLGdCQUFRLEVBQVIsQ0FBWSxvQkFBWixFQUFrQyxhQUFLO0FBQUUsa0JBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsS0FBaEIsQ0FBc0IsUUFBdEIsQ0FBZ0MsQ0FBaEMsRUFBb0MsUUFBUSxJQUFSLENBQWMsQ0FBZDtBQUFrQixTQUEvRjtBQUNBLGVBQU8sSUFBUDtBQUNIO0FBdENPLENBL0ZBLENBQVo7O0FBd0lBOztBQUVBLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBb0IsaUJBQVM7QUFBQTs7QUFFekIsUUFBSSxPQUFKLG1EQUVTLEtBRlQsZ0JBRVMsS0FGVCxxQkFFUyxLQUZULG9CQUVtQjtBQUFFLGVBQU8sS0FBSyxTQUFMLENBQWdCLEVBQUUsV0FBVztBQUFBLHVCQUFTLE1BQU0sR0FBTixDQUFXLEtBQUssS0FBTCxDQUFYLENBQVQ7QUFBQSxhQUFiLEVBQWhCLENBQVA7QUFBeUUsS0FGOUY7QUFJSCxDQU5EOztBQVFBOztBQUVBLE9BQU8sT0FBUCxHQUFpQixHQUFqQjs7QUFFQSIsImZpbGUiOiJvbG9sb2cuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5jb25zdCBPICAgICAgICAgICAgICAgICA9IE9iamVjdFxuICAgICwgU3RhY2tUcmFjZXkgICAgICAgPSByZXF1aXJlICgnc3RhY2t0cmFjZXknKVxuICAgICwgYW5zaSAgICAgICAgICAgICAgPSByZXF1aXJlICgnYW5zaWNvbG9yJylcbiAgICAsIGJ1bGxldCAgICAgICAgICAgID0gcmVxdWlyZSAoJ3N0cmluZy5idWxsZXQnKVxuICAgICwgcGlwZXogICAgICAgICAgICAgPSByZXF1aXJlICgncGlwZXonKVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cblxuY29uc3Qgc3RyaW5naWZ5ID0gcmVxdWlyZSAoJ3N0cmluZy5pZnknKS5jb25maWd1cmUgKHtcblxuICAgIGZvcm1hdHRlciAoeCwgc3RyaW5naWZ5KSB7XG5cbiAgICAgICAgaWYgKCh4IGluc3RhbmNlb2YgRXJyb3IpICYmICEodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgeFtTeW1ib2wuZm9yICgnU3RyaW5nLmlmeScpXSkpIHtcblxuICAgICAgICAgICAgaWYgKHN0cmluZ2lmeS5zdGF0ZS5kZXB0aCA+IDApIHJldHVybiBgPEVycm9yOiAke3gubWVzc2FnZX0+YCAvLyBwcmV2ZW50cyB1bndhbnRlZCBwcmV0dHkgcHJpbnRpbmcgZm9yIEVycm9ycyB0aGF0IGFyZSBwcm9wZXJ0aWVzIG9mIGNvbXBsZXggb2JqZWN0c1xuXG4gICAgICAgICAgICBjb25zdCBpbmRlbnQgICAgICAgID0gJyAgICAnXG4gICAgICAgICAgICAgICAgLCB3aHkgICAgICAgICAgID0gc3RyaW5naWZ5LmxpbWl0ICgoeC5tZXNzYWdlIHx8ICcnKS5yZXBsYWNlICgvXFxyfFxcbi9nLCAnJykudHJpbSAoKSwgc3RyaW5naWZ5LnN0YXRlLm1heEVycm9yTWVzc2FnZUxlbmd0aCB8fCAxMjApXG4gICAgICAgICAgICAgICAgLCBzdGFjayAgICAgICAgID0gbmV3IFN0YWNrVHJhY2V5ICh4KS5wcmV0dHlcbiAgICAgICAgICAgICAgICAsIHN0YWNrSW5kZW50ZWQgPSBzdGFjay5zcGxpdCAoJ1xcbicpLm1hcCAoeCA9PiBpbmRlbnQgKyB4KS5qb2luICgnXFxuJylcbiAgICAgICAgICAgICAgICAsIGlzQXNzZXJ0aW9uID0gKCdhY3R1YWwnIGluIHgpICYmICgnZXhwZWN0ZWQnIGluIHgpXG4gICAgICAgICAgICAgICAgLCB0eXBlICAgICAgICA9IHguY29uc3RydWN0b3IubmFtZSB8fCAnRXJyb3InXG5cbiAgICAgICAgICAgIGlmIChpc0Fzc2VydGlvbikge1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyID0gc3RyaW5naWZ5LmNvbmZpZ3VyZSAoeyBtYXhTdHJpbmdMZW5ndGg6IE51bWJlci5NQVhfVkFMVUUsIG1heERlcHRoOiA4IH0pXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IGFjdHVhbCAgID0gYnVsbGV0IChpbmRlbnQgKyAnYWN0dWFsOiAgICcsIHN0ciAoeC5hY3R1YWwpKVxuICAgICAgICAgICAgICAgICAgLCBleHBlY3RlZCA9IGJ1bGxldCAoaW5kZW50ICsgJ2V4cGVjdGVkOiAnLCBzdHIgKHguZXhwZWN0ZWQpKVxuXG4gICAgICAgICAgICAgICAgaWYgKChhY3R1YWwuc3BsaXQgKCdcXG4nKS5sZW5ndGggPiAxKSB8fCAoZXhwZWN0ZWQuc3BsaXQgKCdcXG4nKS5sZW5ndGggPiAxKSkgLy8gaWYgbXVsdGlsaW5lIGFjdHVhbC9leHBlY3RlZCwgbmVlZCBleHRyYSB3aGl0ZXNwYWNlIGluYmV0d2VlblxuICAgICAgICAgICAgICAgICAgICBhY3R1YWwgKz0gJ1xcbidcblxuICAgICAgICAgICAgICAgIHJldHVybiBgWyR7dHlwZX1dICR7d2h5fVxcblxcbiR7YW5zaS5yZWQgKGFjdHVhbCl9XFxuJHthbnNpLmdyZWVuIChleHBlY3RlZCl9XFxuXFxuJHtzdGFja0luZGVudGVkfVxcbmBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBbJHt0eXBlfV0gJHt3aHl9XFxuXFxuJHtzdGFja0luZGVudGVkfVxcbmBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pXG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuY29uc3QgeyBpc0JsYW5rLCBibGFuayB9ID0gcmVxdWlyZSAoJ3ByaW50YWJsZS1jaGFyYWN0ZXJzJylcblxuICAgICwgY2hhbmdlTGFzdE5vbmVtcHR5TGluZSA9IChsaW5lcywgZm4pID0+IHtcblxuICAgICAgICBmb3IgKGxldCBpID0gbGluZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKChpID09PSAwKSB8fCAhaXNCbGFuayAobGluZXNbaV0pKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGluZXNbaV0gPSBmbiAobGluZXNbaV0pXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmVzXG4gICAgfVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbmNvbnN0IGxvZyA9IHBpcGV6ICh7XG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAgIHN0cmluZ2lmeTogKGFyZ3MsIGNmZywgcHJpbnQgPSBjZmcucHJpbnQgfHwgc3RyaW5naWZ5LmNvbmZpZ3VyZSAoY2ZnKSkgPT4gYXJncy5tYXAgKGFyZyA9PiAodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycpID8gYXJnIDogcHJpbnQgKGFyZykpLFxuICAgIFxuICAgIHRyaW06ICh0b2tlbnMsIHsgbWF4ID0gdW5kZWZpbmVkIH0pID0+ICFtYXggPyB0b2tlbnMgOiB0b2tlbnMubWFwICh0ID0+IHN0cmluZ2lmeS5saW1pdCAodCwgbWF4KSksXG5cbiAgICBsaW5lczogKHRva2VucywgeyBsaW5lYnJlYWsgPSAnXFxuJyB9KSA9PiB7XG5cbiAgICAgICAgbGV0IGxpbmVzID0gW1tdXVxuICAgICAgICBsZXQgbGVmdFBhZCA9IFtdXG5cbiAgICAgICAgZm9yIChjb25zdCB0IG9mIHRva2Vucykge1xuXG4gICAgICAgICAgICBjb25zdCBbZmlyc3QsIC4uLnJlc3RdID0gdC5zcGxpdCAobGluZWJyZWFrKVxuXG4gICAgICAgICAgICBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5wdXNoIChmaXJzdClcbiAgICAgICAgICAgIGxpbmVzID0gWy4uLmxpbmVzLCAuLi5yZXN0Lm1hcCAodCA9PiB0ID8gWy4uLmxlZnRQYWQsIHRdIDogW10pXVxuXG4gICAgICAgICAgICBjb25zdCBwYWQgPSBibGFuayAoIXJlc3QubGVuZ3RoID8gdCA6IHJlc3RbcmVzdC5sZW5ndGggLSAxXSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHBhZCkgeyBsZWZ0UGFkLnB1c2ggKHBhZCkgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpbmVzXG4gICAgfSxcblxuICAgIGNvbmNhdDogKGxpbmVzLCB7IHNlcGFyYXRvciA9ICcgJyB9KSA9PiBsaW5lcy5tYXAgKHRva2VucyA9PiB0b2tlbnMuam9pbiAoc2VwYXJhdG9yKSksXG5cbiAgICBpbmRlbnQ6IChsaW5lcywgeyBsZXZlbCA9IDAsIHBhdHRlcm4gPSAnXFx0JyB9KSA9PiBsaW5lcy5tYXAgKGxpbmUgPT4gcGF0dGVybi5yZXBlYXQgKGxldmVsKSArIGxpbmUpLFxuICAgIFxuICAgIHRhZzogKGxpbmVzLCB7IGxldmVsID0gJycsXG4gICAgICAgICAgICAgICAgICAgbGV2ZWxDb2xvciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgJ2luZm8nOiBhbnNpLmN5YW4sXG4gICAgICAgICAgICAgICAgICAgICAgICd3YXJuJzogYW5zaS55ZWxsb3csXG4gICAgICAgICAgICAgICAgICAgICAgICdkZWJ1Zyc6IGFuc2kuYmx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgJ2Vycm9yJzogYW5zaS5icmlnaHQucmVkIH0gfSkgPT4gYnVsbGV0ICgobGV2ZWxDb2xvcltsZXZlbF0gfHwgKHMgPT4gcykpIChsZXZlbC50b1VwcGVyQ2FzZSAoKS5wYWRTdGFydCAoNikgKyAnXFx0JyksIGxpbmVzKSxcblxuICAgIHRpbWU6IChsaW5lcywgeyB3aGVuICAgPSBuZXcgRGF0ZSAoKSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0ID0gJ2xvY2FsZScsXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsZSA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zID0ge30sXG4gICAgICAgICAgICAgICAgICAgIHByaW50ICA9IHdoZW4gPT4gYW5zaS5kYXJrR3JheSAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKChmb3JtYXQgPT09ICdpc28nKSAgICA/IHdoZW4udG9JU09TdHJpbmcgKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgoZm9ybWF0ID09PSAnbG9jYWxlJykgPyB3aGVuLnRvTG9jYWxlU3RyaW5nIChsb2NhbGUsIG9wdGlvbnMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKGZvcm1hdCA9PT0gJ3V0YycpICAgID8gd2hlbi50b1VUQ1N0cmluZyAoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4udG9TdHJpbmcgKCkpKSkpICsgJ1xcdCcgfSkgPT4gYnVsbGV0IChwcmludCAod2hlbiksIGxpbmVzKSxcblxuICAgIGxvY2F0ZTogKGxpbmVzLCB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2hpZnQgPSAwLFxuICAgICAgICAgICAgICAgICAgICB3aGVyZSA9IChuZXcgU3RhY2tUcmFjZXkgKCkuY2xlYW4uYXQgKDEgKyBzaGlmdCkpLFxuICAgICAgICAgICAgICAgICAgICBqb2luICA9ICgoYSwgc2VwLCBiKSA9PiAoYSAmJiBiKSA/IChhICsgc2VwICsgYikgOiAoYSB8fCBiKSksXG4gICAgICAgICAgICAgICAgICAgIHByaW50ID0gKHsgY2FsbGVlU2hvcnQsIGZpbGVOYW1lID0gW10sIGxpbmUgPSBbXSB9KSA9PiBhbnNpLmRhcmtHcmF5ICgnKCcgKyBqb2luIChjYWxsZWVTaG9ydCwgJyBAICcsIGpvaW4gKGZpbGVOYW1lLCAnOicsIGxpbmUpKSArICcpJylcblxuICAgICAgICAgICAgICAgIH0pID0+IGNoYW5nZUxhc3ROb25lbXB0eUxpbmUgKGxpbmVzLCBsaW5lID0+IGpvaW4gKGxpbmUsICcgJywgcHJpbnQgKHdoZXJlKSkpLFxuXG4gICAgam9pbjogKGxpbmVzLCB7IGxpbmVicmVhayA9ICdcXG4nIH0pID0+IGxpbmVzLmpvaW4gKGxpbmVicmVhayksXG5cbiAgICByZW5kZXI6ICh0ZXh0LCB7XG5cbiAgICAgICAgZW5naW5lID0gKCh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgJiYgKHdpbmRvdy53aW5kb3cgPT09IHdpbmRvdykgJiYgd2luZG93Lm5hdmlnYXRvcilcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZiAoJ0Nocm9tZScpID49IDApXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnY2hyb21lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdnZW5lcmljJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnYW5zaScsXG5cbiAgICAgICAgZW5naW5lcyA9IHsgLyogY29uZmlndXJhYmxlICovIH0sXG5cbiAgICAgICAgY29uc29sZU1ldGhvZCA9ICdsb2cnLFxuXG4gICAgICAgIGRlZmF1bHRzID0ge1xuXG4gICAgICAgICAgICBhbnNpOiAgICBzID0+IGNvbnNvbGVbY29uc29sZU1ldGhvZF0gKHMpLFxuICAgICAgICAgICAgY2hyb21lOiAgcyA9PiBjb25zb2xlW2NvbnNvbGVNZXRob2RdICguLi5hbnNpLnBhcnNlIChzKS5hc0Nocm9tZUNvbnNvbGVMb2dBcmd1bWVudHMpLFxuICAgICAgICAgICAgZ2VuZXJpYzogcyA9PiBjb25zb2xlW2NvbnNvbGVNZXRob2RdIChhbnNpLnN0cmlwIChzKSlcbiAgICAgICAgfVxuXG4gICAgfSkgPT4gKCh0ZXh0ICYmIE8uYXNzaWduIChkZWZhdWx0cywgZW5naW5lcylbZW5naW5lXSAodGV4dCksIHRleHQpKSxcblxuICAgIHJldHVyblZhbHVlOiAoX18sIHsgaW5pdGlhbEFyZ3VtZW50czogW2ZpcnN0QXJndW1lbnRdIH0pID0+IGZpcnN0QXJndW1lbnRcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG59KS5jb25maWd1cmUgKHtcblxuICAgIHRpbWU6IGZhbHNlLCAvLyBkaXNhYmxlcyBzb21lIHN0ZXBzICh1bnRpbCBlbmFibGVkIGJhY2sgZXhwbGljaXRseSlcbiAgICB0YWc6ICBmYWxzZVxuXG4vKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbn0pLm1ldGhvZHMgKHtcblxuICAgIGdldCBub29wICgpIHsgcmV0dXJuIHBpcGV6ICh7IHJldHVyblZhbHVlOiBhcmdzID0+IGFyZ3NbMF0gfSkubWV0aG9kcyAodGhpcy5tZXRob2RzXykgfSxcbiAgICBnZXQgbnVsbCAoKSB7IHJldHVybiB0aGlzLm5vb3AgfSwgLy8gTEVHQUNZLCBERVBSRUNBVEVEIChsZWZ0IGhlcmUgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXG5cbiAgICBpbmRlbnQgKGxldmVsKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBpbmRlbnQ6IHsgbGV2ZWw6IGxldmVsIH19KSB9LFxuXG4gICAgZ2V0IGVycm9yICgpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHRhZzogeyBsZXZlbDogJ2Vycm9yJyB9LCByZW5kZXI6IHsgY29uc29sZU1ldGhvZDogJ2Vycm9yJyB9IH0pIH0sXG4gICAgZ2V0IHdhcm4gKCkgIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHRhZzogeyBsZXZlbDogJ3dhcm4nIH0sICByZW5kZXI6IHsgY29uc29sZU1ldGhvZDogJ3dhcm4nIH0gfSkgfSxcbiAgICBnZXQgaW5mbyAoKSAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgdGFnOiB7IGxldmVsOiAnaW5mbycgfSwgIHJlbmRlcjogeyBjb25zb2xlTWV0aG9kOiAnaW5mbycgfSB9KSB9LFxuICAgIGdldCBkZWJ1ZyAoKSAgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgdGFnOiB7IGxldmVsOiAnZGVidWcnIH0sICByZW5kZXI6IHsgY29uc29sZU1ldGhvZDogJ2RlYnVnJyB9IH0pIH0sXG5cbiAgICBtYXhBcnJheUxlbmd0aCAobikgIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHN0cmluZ2lmeTogeyBtYXhBcnJheUxlbmd0aDogbiB9IH0pIH0sXG4gICAgbWF4T2JqZWN0TGVuZ3RoIChuKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgbWF4T2JqZWN0TGVuZ3RoOiBuIH0gfSkgfSxcbiAgICBtYXhEZXB0aCAobikgICAgICAgIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHN0cmluZ2lmeTogeyBtYXhEZXB0aDogbiB9IH0pIH0sXG4gICAgbWF4TGVuZ3RoIChuKSAgICAgICB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgbWF4TGVuZ3RoOiBuIH0gfSkgfSxcbiAgICBcbiAgICBnZXQgdW5saW1pdGVkICgpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHN0cmluZ2lmeTogeyBtYXhTdHJpbmdMZW5ndGg6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4T2JqZWN0TGVuZ3RoOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heEFycmF5TGVuZ3RoOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heERlcHRoOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heEVycm9yTWVzc2FnZUxlbmd0aDogTnVtYmVyLk1BWF9WQUxVRSB9IH0pIH0sXG5cbiAgICBnZXQgbm9QcmV0dHkgKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgc3RyaW5naWZ5OiB7IHByZXR0eTogZmFsc2UgfSB9KSB9LFxuICAgIGdldCBub0ZhbmN5ICgpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHN0cmluZ2lmeTogeyBmYW5jeTogZmFsc2UgfSB9KSB9LFxuICAgIGdldCBub1JpZ2h0QWxpZ25LZXlzICgpIHsgcmV0dXJuIHRoaXMuY29uZmlndXJlICh7IHN0cmluZ2lmeTogeyByaWdodEFsaWduS2V5czogZmFsc2UgfSB9KSB9LFxuICAgIGdldCBub0xvY2F0ZSAoKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBsb2NhdGU6IGZhbHNlIH0pIH0sXG4gICAgcHJlY2lzaW9uIChuKSB7IHJldHVybiB0aGlzLmNvbmZpZ3VyZSAoeyBzdHJpbmdpZnk6IHsgcHJlY2lzaW9uOiBuIH0gfSkgfSxcblxuICAgIGdldCBzZXJpYWxpemUgKCkgeyByZXR1cm4gdGhpcy5iZWZvcmUgKCdyZW5kZXInKSB9LFxuICAgIGdldCBkZXNlcmlhbGl6ZSAoKSB7IHJldHVybiB0aGlzLmZyb20gKCdyZW5kZXInKSB9LFxuXG4gICAgbmV3bGluZSAoKSB7IHJldHVybiB0aGlzLmZyb20gKCdqb2luJykoWycnXSkgfSxcblxuICAgIGhhbmRsZU5vZGVFcnJvcnMgKCkge1xuICAgICAgICBwcm9jZXNzLm9uICgndW5jYXVnaHRFeGNlcHRpb24nLCAgZSA9PiB7IHRoaXMuYnJpZ2h0LnJlZC5lcnJvci5ub0xvY2F0ZSAoZSk7IHByb2Nlc3MuZXhpdCAoMSkgfSlcbiAgICAgICAgcHJvY2Vzcy5vbiAoJ3VuaGFuZGxlZFJlamVjdGlvbicsIGUgPT4geyB0aGlzLmJyaWdodC5yZWQuZXJyb3Iubm9Mb2NhdGUgKGUpOyBwcm9jZXNzLmV4aXQgKDEpIH0pXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxufSlcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5hbnNpLm5hbWVzLmZvckVhY2ggKGNvbG9yID0+IHtcblxuICAgIGxvZy5tZXRob2RzICh7XG5cbiAgICAgICAgZ2V0IFtjb2xvcl0gKCkgeyByZXR1cm4gdGhpcy5jb25maWd1cmUgKHsgJ2NvbmNhdCsnOiBsaW5lcyA9PiBsaW5lcy5tYXAgKGFuc2lbY29sb3JdKSB9KSB9XG4gICAgfSlcbn0pXG5cbi8qICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBsb2dcblxuLyogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5cbiJdfQ==