var {inspect} = require('util');
var test = require('tape');
var luggite = require('../');

function Catcher() {
    this.records = [];
}
Catcher.prototype.write = function (record) {
    this.records.push(record);
};

var catcher = new Catcher();
var log = luggite.createLogger();
// For now we cheat and use an internal API to capture log output for testing.
log._streams = [];
log._addStream({type: 'raw', stream: catcher, level: 'trace'});

test('log.info(BUFFER)', function (t) {
    var b = Buffer.from('foo');

    ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].forEach(
        function (lvl) {
            log[lvl].call(log, b);
            var rec = catcher.records[catcher.records.length - 1];
            t.equal(rec.msg, inspect(b), `log.${lvl} msg is inspect(BUFFER)`);
            t.ok(
                rec['0'] === undefined,
                'no "0" array index key in record: ' + inspect(rec['0'])
            );
            t.ok(
                rec['parent'] === undefined,
                'no "parent" array index key in record: ' +
                    inspect(rec['parent'])
            );

            log[lvl].call(log, b, 'bar');
            rec = catcher.records[catcher.records.length - 1];
            t.equal(
                rec.msg,
                inspect(b) + ' bar',
                `log.${lvl}(BUFFER, "bar") msg is inspect(BUFFER) + " bar"`
            );
        }
    );

    t.end();
});

//test('log.info({buf: BUFFER})', function (t) {
//  var b = Buffer.from ? Buffer.from('foo') : new Buffer('foo');
//
//  // Really there isn't much Bunyan can do here. See
//  // <https://github.com/joyent/node/issues/3905>. An unwelcome hack would
//  // be to monkey-patch in Buffer.toJSON. Bletch.
//  log.info({buf: b}, 'my message');
//  var rec = catcher.records[catcher.records.length - 1];
//
//  t.end();
//});
