var {format} = require('util');
var test = require('tape');
var luggite = require('../');

test('log.LEVEL() -> boolean', function (t) {
    var log1 = luggite.createLogger();
    t.equal(log1.trace(), false, 'log1.trace() is false');
    t.equal(log1.debug(), false);
    t.equal(log1.info(), true);
    t.equal(log1.warn(), true);
    t.equal(log1.error(), true);
    t.equal(log1.fatal(), true);

    var log2 = luggite.createLogger({level: 'debug'});
    t.equal(log2.trace(), false);
    t.equal(log2.debug(), true);
    t.equal(log2.info(), true);
    t.equal(log2.warn(), true);
    t.equal(log2.error(), true);
    t.equal(log2.fatal(), true);

    t.end();
});

// ---- test `log.<level>(...)` calls which various input types

class Catcher {
    constructor() {
        this.clear();
    }
    write(rec) {
        this.records.push(rec);
    }
    clear() {
        this.records = [];
    }
}
var catcher = new Catcher();

var log = luggite.createLogger();
// For now we cheat and use an internal API to capture log output for testing.
log._streams = [];
log._addStream({type: 'raw', stream: catcher, level: 'info'});

var fields = {one: 'un'};

test('log.info(<str>)', function (t) {
    catcher.clear();
    log.info('hi');
    var rec = catcher.records[0];
    t.strictEqual(rec.level, 30, 'rec.level');
    t.strictEqual(rec.msg, 'hi', 'rec.msg');
    t.ok(rec.time instanceof Date, 'rec.time');
    t.strictEqual(Object.keys(rec).length, 3, 'only these three fields');
    t.end();
});

test('log.info(undefined, <msg>)', function (t) {
    catcher.clear();
    log.info(undefined, 'hi');
    // https://github.com/nodejs/node/pull/23162 (starting in node v12) changed
    // util.format() handling such that this test case expected string differs.
    var expectedMsg =
        Number(process.versions.node.split('.')[0]) >= 12
            ? 'undefined hi'
            : "undefined 'hi'";
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, expectedMsg, 'rec.msg');
    t.end();
});

test('log.info(<fields>, undefined)', function (t) {
    catcher.clear();
    log.info(fields, undefined);
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, 'undefined', 'rec.msg');
    t.strictEqual(rec.one, 'un', 'rec.one');
    t.end();
});

test('log.info(null, <msg>)', function (t) {
    catcher.clear();
    log.info(null, 'hi');
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, 'hi', 'rec.msg');
    t.end();
});

test('log.info(<fields>, null)', function (t) {
    catcher.clear();
    log.info(fields, null);
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, 'null', 'rec.msg');
    t.strictEqual(rec.one, 'un', 'rec.one');
    t.end();
});

test('log.info(<fields>, <str>)', function (t) {
    catcher.clear();
    log.info(fields, 'hi');
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, 'hi', 'rec.msg');
    t.strictEqual(rec.one, 'un', 'rec.one');
    t.end();
});

test('log.info(<bool>)', function (t) {
    catcher.clear();
    log.info(true);
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, 'true', 'rec.msg');
    t.end();
});

test('log.info(<fields>, <bool>)', function (t) {
    catcher.clear();
    log.info(fields, true);
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, 'true', 'rec.msg');
    t.strictEqual(rec.one, 'un', 'rec.one');
    t.end();
});

test('log.info(<num>)', function (t) {
    catcher.clear();
    log.info(42);
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, '42', 'rec.msg');
    t.end();
});

test('log.info(<fields>, <num>)', function (t) {
    catcher.clear();
    log.info(fields, 42);
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, '42', 'rec.msg');
    t.strictEqual(rec.one, 'un', 'rec.one');
    t.end();
});

test('log.info(<function>)', function (t) {
    catcher.clear();
    var func = function func1() {};
    log.info(func);
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, '[Function: func1]', 'rec.msg');
    t.end();
});

test('log.info(<fields>, <function>)', function (t) {
    catcher.clear();
    var func = function func2() {};
    log.info(fields, func);
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, '[Function: func2]', 'rec.msg');
    t.strictEqual(rec.one, 'un', 'rec.one');
    t.end();
});

test('log.info(<array>)', function (t) {
    catcher.clear();
    var arr = ['a', 1, {two: 'deux'}];
    log.info(arr);
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, format(arr), 'rec.msg');
    t.end();
});

test('log.info(<fields>, <array>)', function (t) {
    catcher.clear();
    var arr = ['a', 1, {two: 'deux'}];
    log.info(fields, arr);
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, format(arr), 'rec.msg');
    t.strictEqual(rec.one, 'un', 'rec.one');
    t.end();
});

test('log.info(null)', function (t) {
    catcher.clear();
    log.info(null);
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, '', 'rec.msg');
    t.end();
});

test('log.info(null, <msg>)', function (t) {
    catcher.clear();
    log.info(null, 'hi');
    var rec = catcher.records[0];
    t.strictEqual(rec.msg, 'hi', 'rec.msg');
    t.end();
});
