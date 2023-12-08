var test = require('tape');
var luggite = require('../');

test('luggite.<LEVEL>', function (t) {
    t.ok(luggite.TRACE, 'TRACE');
    t.ok(luggite.DEBUG, 'DEBUG');
    t.ok(luggite.INFO, 'INFO');
    t.ok(luggite.WARN, 'WARN');
    t.ok(luggite.ERROR, 'ERROR');
    t.ok(luggite.FATAL, 'FATAL');
    t.end();
});

test('luggite.resolveLevel()', function (t) {
    t.equal(luggite.resolveLevel('trace'), luggite.TRACE, 'TRACE');
    t.equal(luggite.resolveLevel('TRACE'), luggite.TRACE, 'TRACE');
    t.equal(luggite.resolveLevel('debug'), luggite.DEBUG, 'DEBUG');
    t.equal(luggite.resolveLevel('DEBUG'), luggite.DEBUG, 'DEBUG');
    t.equal(luggite.resolveLevel('info'), luggite.INFO, 'INFO');
    t.equal(luggite.resolveLevel('INFO'), luggite.INFO, 'INFO');
    t.equal(luggite.resolveLevel('warn'), luggite.WARN, 'WARN');
    t.equal(luggite.resolveLevel('WARN'), luggite.WARN, 'WARN');
    t.equal(luggite.resolveLevel('error'), luggite.ERROR, 'ERROR');
    t.equal(luggite.resolveLevel('ERROR'), luggite.ERROR, 'ERROR');
    t.equal(luggite.resolveLevel('fatal'), luggite.FATAL, 'FATAL');
    t.equal(luggite.resolveLevel('FATAL'), luggite.FATAL, 'FATAL');
    t.end();
});
