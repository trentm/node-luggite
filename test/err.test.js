// Test logging an Error object.

var test = require('tape');
var luggite = require('../');

var log = luggite.createLogger();

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
// For now we cheat and use an internal API to capture log output for testing.
log._streams = [];
log._addStream({type: 'raw', stream: catcher, level: 'info'});

test('log.info(err, ...)', function (t) {
    catcher.clear();

    var theErr = new TypeError('boom');
    log.info(theErr, 'hi');
    var rec = catcher.records[0];
    t.equal(rec.err.message, theErr.message);
    t.equal(rec.err.name, theErr.name);
    t.equal(rec.err.stack, theErr.stack);

    t.end();
});

test('log.info({err: err}, ...)', function (t) {
    catcher.clear();

    var theErr = new TypeError('boom');
    log.info({err: theErr}, 'hi');
    var rec = catcher.records[0];
    t.equal(rec.err.message, theErr.message);
    t.equal(rec.err.name, theErr.name);
    t.equal(rec.err.stack, theErr.stack);

    // None of these should blow up.
    catcher.clear();
    var bogusErrs = [undefined, null, {}, 1, 'string', [1, 2, 3], {foo: 'bar'}];
    for (var i = 0; i < bogusErrs.length; i++) {
        log.info({err: bogusErrs[i]}, 'hi');
        t.equal(catcher.records[i].err, bogusErrs[i]);
    }

    t.end();
});
