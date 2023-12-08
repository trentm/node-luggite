// For now this can be used to play with comparing luggite, bunyan, and pino.
var framework = process.argv[2] || 'luggite';
var createLogger;
var minimalCreateOpts = {};
switch (framework) {
    case 'luggite':
        var luggite = require('./');
        createLogger = luggite.createLogger;
        break;
    case 'bunyan':
        var bunyan = require('bunyan'); // npm install --no-save bunyan pino
        createLogger = bunyan.createLogger;
        minimalCreateOpts = {name: 'example'};
        break;
    case 'pino':
        var pino = require('pino'); // npm install --no-save pino bunyan
        createLogger = pino;
        break;
    default:
        throw new Error('unknown logging framework:' + framework);
}

// Minimal logger.
var minLog = createLogger(minimalCreateOpts);
minLog.info('minLog hi');

const log = createLogger({
    name: 'example',
    level: 'trace',
    fields: {aStaticField: 'blah'},
});

console.log('\n# levels');
log.trace('trace');
log.debug('debug');
log.info('info');
log.warn('warn');
log.error('error');
log.fatal('fatal');

console.log('\n# record fields');
log.info(
    {bool: true, str: 'string', array: ['one', 2], obj: {foo: 'bar'}},
    'record field types'
);

console.log('\n# errors');
var cause = new Error('the cause');
var err = new Error('boom', {cause: cause}); // err.cause in Node.js 16
err.code = 42;
err.eggs = 'spam';
// TODO clarity on 'cause' handling
// TODO clarity on `.eggs` extra fields
log.info(err, 'an error');
log.info({err: err}, 'an error2');

// ---- M2

// Child
// const child = log.child({ module: 'foo' })
// child.warn('From child')
// child.error({err: new Error('boom'), spam: 'eggs', by: 'Dr.\nSeuss'}, 'oops')
