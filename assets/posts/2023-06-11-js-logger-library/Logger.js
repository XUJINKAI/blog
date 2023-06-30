/* 
Simple Logger Wrapper
Author: XUJINKAI
*/
var Logger = (function (undefined) {
    'use strict';
    var _LogLevel = {
        FATAL: 0,
        ERROR: 1,
        WARN: 2,
        INFO: 3,
        DEBUG: 4,
        TRACE: 5,
    };
    var _LogDateTime = function () { };
    _LogDateTime.toString = function () {
        return (new Date).toLocaleString();
    };

    var Logger = function () {
        if (!(this instanceof Logger)) {
            throw new Error(`Please use the 'new' operator, this constructor function cannot be called as a function.`);
        }
        return this.init.apply(this, arguments);
    };
    Logger.prototype = {
        constructor: Logger,
        init: function (title, level) {
            this._title = title;
            this.level = level || this.LEVEL.INFO;
            this._freshFunctions();
            return this;
        },

        canLog(level) {
            return this.level >= level;
        },

        get level() {
            return this._level;
        },
        set level(value) {
            if (typeof value === 'string') {
                value = this.LEVEL[value.toUpperCase()];
            }
            if (typeof value !== 'number') {
                throw new Error('level must be number or string');
            }
            if (value < 0 || value > this.LEVEL.TRACE) {
                throw new Error(`level must be between 0 and ${this.LEVEL.TRACE}`);
            }
            this._level = value;
        },
        get title() {
            return this._title;
        },
        set title(value) {
            this._title = value;
            this._freshFunctions();
        },

        get fatal() {
            return this.level >= this.LEVEL.FATAL ? this._fatal : this._empty;
        },
        get error() {
            return this.level >= this.LEVEL.ERROR ? this._error : this._empty;
        },
        get warn() {
            return this.level >= this.LEVEL.WARN ? this._warn : this._empty;
        },
        get info() {
            return this.level >= this.LEVEL.INFO ? this._info : this._empty;
        },
        get debug() {
            return this.level >= this.LEVEL.DEBUG ? this._debug : this._empty;
        },
        get trace() {
            return this.level >= this.LEVEL.TRACE ? this._trace : this._empty;
        },

        _empty() { },
        _freshFunctions() {
            var title = this.title ? '[' + this.title + ']' : '';
            this._fatal = console.error.bind(console, '%c%s[%s][FATAL]', 'font-weight:bold;', title, _LogDateTime);
            this._error = console.error.bind(console, '%s[%s][ERROR]', title, _LogDateTime);
            this._warn = console.warn.bind(console, '%s[%s][WARN]', title, _LogDateTime);
            this._info = console.log.bind(console, '%c%s[%s][INFO]', 'color:blue', title, _LogDateTime);
            this._debug = console.log.bind(console, '%c%s[%s][DEBUG]', "color:green", title, _LogDateTime);
            this._trace = console.trace.bind(console, '%c%s[%s][TRACE]', "color:purple", title, _LogDateTime);
        },
    };
    Object.defineProperty(Logger, 'LEVEL', { value: Object.freeze(_LogLevel), writable: false });
    Object.defineProperty(Logger.prototype, 'LEVEL', { value: Object.freeze(_LogLevel), writable: false });
    return Logger;
})();
