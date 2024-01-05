A Node.js logger for luddites.

More seriously this is me playing with a Node.js logger that is as simple as
possible, but good enough for what I want.

# Design notes

Goal: A small and simple logging library that is reasonably performant without
the cost of complexity. It targets structured (JSON) logging. It should almost
always be usable, which implies: support for old Node.js versions, eventually
other runtimes, minimal deps, easy to start using, understand and debug.

To start I'm stripping down Bunyan to the bare minimum, perhaps with some
lessons from my failed maintenance of it.

- Can we have no deps?
- No CLI as part of this. Would be nice to have a blessed separate CLI: bunyan,
  pino-pretty, ecslog?
- No dtrace.
- Same levels. Should eventually have pointers to docs (OTel logging data model?)
  comparing with other loggers.
- Drop serializers? Re-evaluate.
- Drop most/all default fields from log records, including 'name'. I.e. it is
  less opinionated. Only base fields will be: `level, `time`, `msg`.
- No file-writing built-in streams. However, should eventually have pluggable
  streams; though perhaps with a different name/design.


# Luddite currently sucks because ...

This section tries to (nicely) describe why Luddite might not (at least
currently) be for you:

- `bunyan` and `ecslog` CLIs do not render its output. `pino-pretty` does, but
  that CLI is comparatively limited.
- No special serialization of -- and hence no nice pretty CLI rendering of --
  `req` and `res`.
- No customizable output (a.k.a. streams, appenders). Currently output is to
  stdout.
- It is only tested with Node.js currently; no browser, deno, etc. support.


# Differences with Pino

- `createLogger`: The following pino constructor fields are not supported:
  customLevels, useOnlyCustomLevels, depthLimit, edgeLimit, mixin,
  mixinMergeStrategy, redact, hooks, formatters, serializers (though this
  will come back after first pass, I suspect), msgPrefix, base (equivalent
  is `fields` but without a default), enabled (why have this and 'silent'
  level?), crlf, timestamp (though this is interesting), messageKey, errorKey,
  nestedKey (though sounds possibly helpful), browser, transport, onChild.

# Differences with Bunyan

- `createLogger`:
    - `name` is optional
    - extra static fields for log records go in `fields` instead of "other"
      keys at top-level. E.g. this allows adding a field named `stream` that
      collides with a top-level option.
    - no 'stream' or 'streams' for now.
- fields:
    - no defaults (i.e. no "hostname" and "pid" fields by default)
    - 'name' optional
    - 'time' format might change (TODO)
- `err` serializer:
    - It no longer handles an `err.cause()` *function* which was a node-verror
      thing. Much later came https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause for which support will be added.
      (TODO: does this break/surprise Restify users?)

# API

## ctor

```js
var log = createLogger();
var log = createLogger({
    name: 'myapp',    // Common enough in Bunyan and Pino to allow here. Can also be in `fields.name`.
    level: '...',
    fields: {...},    // Static fields to include on all log records.
})

// Close equivalent to a Bunyan logger is:
var log = createLogger({
    name: '...',
    fields: { pid: process.pid, hostname: os.hostname() }
});
```

## log methods

```
// log.info([recordFields], [message], [...args])

log.info()
log.info(err)
log.info({foo: 'bar'})
log.info({foo: 'bar'}, 'a message')
log.info({foo: 'bar'}, 'hello %s', 'world')
log.info('hello %s', 'world', someVar)
```

Dev Notes:
- pino v6 dropped support for trailing arguments that don't have a '%s' or similar
  formatting directive in the message string/template. I'm curious why. Speed?
  The `hooks.logMethod` ctor option can be used to restore this.
- I like the Bunyan behaviour keeping the trailing args support being formatted
  with `util.format` because it is console.log-like, and I think less surprising
  the users.
- *Guidance* should perhaps suggest static key-like messages and have variable
  data in the "merging object". Let's call them "fields" or "record fields".

## log.level

- pino has getter/setter; separate logger.isLevelEnabled(level),
  log.levels (diff from Bunyan), logger.levelVal,
  Pino doesn't really have multiple dests/streams
  so doesn't need Bunyan's `log.levels(...)`.

## Core fields

- level
- time
    My inclination is to consider ms since epoch (JS's native Date.now(), but
    grok/consider performance.now()ish high res timing.

    Pros for NOT using ISO-time:
    - Faster than `Date().toISOTime()`.

    Pros for ISO-time:
    - Comparing the time of log lines without a pretty-printing is easier.
    - We *could* include TZ info, though we don't currently. Also hasn't
      come up as helpful IME.
    - There isn't an overflow issue.

    What does a browser/chrome trace use?
    - ecs-logging: `@timestamp`, ISO time
    - pino: `time`, ms since epoch, for speed
    - winston: ???
    - bunyan: `time`, ISO time
    - OTel Logging (SDK? Data Model?) uses *nanoseconds* I think. Requires int?
    - Is including TZ info important? Where did I see an argument for them?
    - How expensive is the toISOString'ing? Possibly very. TODO: measure it
    - Is ns resolution important? If so, can we use decimals on ms values?
    - How does hrTime fit in here? Perf issue with that?
    - If number, then need to worry about overflow? ns -> bigint issue
- msg:
    - pino: `msg`, `messageKey` config opt
    - bunyan: `msg`
    - ecs-logging: `message`
    - winston json: ???

## log.child()

NYI. Planned for M2.

Notes:
- pino supports second `options` arg:
  https://getpino.io/#/docs/api?id=loggerchildbindings-options-gt-logger with
  many of the ctor options: level, msgPrefix, redact, serializers,

## streams / destinations

NYI. Planned for M3.

Notes:
- stream / streams options? Or separate pino-like `destination` first/second
  arg to ctor? I don't want to get into file writing, just want the API.
- What about support pino.destination(...) values directly. Is there a clear
  API for this? Is it just `.write()`?

# Minimum supported Node.js

I'd love to support earlier than Node.js v10, but I'm using
`safe-stable-stringify` and there isn't a demonstrated need to support earlier
than v10.

- deps:
  - `safe-stable-stringify` has `"node": ">=10"`

Features and the Node.js version required for them
- `class`, node 6
- arrow functions, node 4
- Object.assign, node 4
- `const`, basic support was in node 0.10. Good enough?
- object destructuring, something newer than node 0.10
- object property shorthard (`exports = { TRACE }`), something new than node 0.10


# TODO

## M2 - `.child()`, perf/benchmarking, time format, `log.level` API change

- simplify the `log.info(err, msg)` case to just have `{err: err}` and pass to
  later code? Can that obsolete the second arg to _applySerializers?
- switch to pino's `log.level`  setter/getter? rather than overloaded `log.level([level])`? I think pino's is cleaner. Some subtlety when have multiple streams. Should it change all of them? Hrm.
- perhaps change `log.info()` no args to a separate API call? Not sure. How
  much of a perf gain is not having that boolean check?  Typing is a PITA with
  this call signature. I'm inclined to change to isEnabledFor() or equiv.
  What do others do?
- perf: pino sets `.debug` et al to function noop if Logger level is higher. That
  might help with perf. That means setting those attributes on the instance
  rather than on the prototype, FWIW.
  This also might help with autocomplete.
- decide on time field:
  - perf call?
  - care about overflow if ms-since-epoch?
  - what about hrtime? Could that be allowed?
- `.child()` ?
    ```js
        if (parent && opts.name) {
            // TODO does pino.child allow changing 'name'? Is there a strong reason we don't allow this?
            throw new TypeError('invalid options.name: child cannot set logger name');
        }
    ```
- moar tests

## M3 - custom and multiple streams

- browser handling:
  - by default use process.stdout if that exists, otherwise fallback to the
    `console.log` usage. I.e. we feature-check for node.js. Default to lowest
    common denominator JS: console.
- think through streams and whether to have multiple, b/c it impacts design a lot
  - Just a single hardcoded stdout stream would be very simple, but limited: no
    plugins. Perhaps an MVP? Time to sort out other design things, without
    getting into other dest types, multiple dests, etc.
  - Change name to outputs, appenders, destinations? No need to use "streams".
    It isn't a great name.  Could still stick to "it is a thing with a .write()".
  - TODO: what is the pino API for destinations?
  - TODO: review the winston design
  - A Bunyan stream is a combo of the actual output stream and the level
    (plus: `closeOnExit` never used; `type` which really was just a boolean
    for raw or stringified, i.e. the equivalent of Node.js "objectMode".)
  - TODO: think through how plugins will work for adding and creating streams.
  - Do we add the complexity of pre-rendered static fields?
- How to disable the default stream and have *no* stream? Granted it is a weird case.

## M4 - custom serializers? pretty-printing CLI

## later

- levels: pino adds "silent". elastic APM has "off".
- types
- CLI for pretty printing

* * *

- Are there enough core fields to identify this for rendering? E.g. to know
  that `"level":30,` is a particular level? If close to bunyan and pino, then
  check to see we have the same numeric values.
    - `bunyan` CLI isn't going to work. It requires its whole suite of fields.
      Will need a new one. Perhaps based on a ecslog? I'm sad about the `less`
      handling not being there for ecslog, however. :/
      Perhaps a @luddite/lug CLI, pre-1.0 implemented in node for now, could
      move to Go or Rust for speed/distribution.
- Support embedding (e.g. in etel). Single file is helpful. Doc section mentioning
  hopefully only single dep.
- What to support formatting (a la pino `formatters.`) for other output formats?
  E.g. could this have canned for pino, bunyan, ecs-logging, otel-ish?
- Exporting a `NoopLogger` useful? Or use `enabled` field a la pino?
- Import 'redact' from pino. That seems useful. Should that live on a raw
  stream, however?
- otel suggested mappings? Not sure if useful, because cannot impact Resource
  attributes in Logs Bridge API.
- All 're-evals' from above.
- Clarify why this exists and not just use pino. If I can't, then drop this.
- perf: Incorporate into pino benchmarks. Do I do the pre-serialized bindings
  thing?
- Would a customization of the json stringify dep to support serialization order
  be justified? At least within some limits -- e.g. pre-serialized bindings.
- configurable how to serialize bigints? pluggable serializer?
- how low can I make "engines"
- Re-eval pluggable streams:
    - note the reemitErrorEvents that is in Bunyan (just for file streams?)
    - find the old Bunyan 2 notes I had on this (or perhaps in some issue
      about the separate RotatingFileStream from years ago)
- Re-add serializers?
- restore 'src' option?
- log fn signature: Compare bunyan and pino edge cases. Are ther other diffs than
  this first one?
  - In pino v6 (?), pino dropped the `...args` passing to `util.format`. I
    don't know the main motivation for that, but I'd like to keep it.
- Browser support? That would fit with the "always usable" theme.
    - Re-add the `runtimeEnv` stuff from Bunyan in some form. The default
      ConsoleRawStream() for the browser.
    - See https://getpino.io/#/docs/browser
- log.close()? Bunyan never quite had this. Do pino and/or winston? Or
  does pino rely on FinalizationRegistry?
- log.flush()  https://getpino.io/#/docs/api?id=loggerflushcb
  Only useful if allowing non-sync writing.
- perhaps could have separate `createFooLogger()` creators for separate use
  cases. createServiceLogger(...) requires "service.name", createCliLogger().
  Helpful, or no? Could be solved by docs.


## Someday / Maybe

- Restore sourcemap support to the captured stack trace in getCaller3Info.
  This is only relevant if `getCaller3Info` is used for functionality like
  Bunyan's `src: true`. The sourcemap support was originally added as
  interesting for *CoffeeScript* users. Need a modern use case; TypeScript
  and bundling seem more likely.
  (The source-map usage was removed in commit ec35812.)
- commit 8cc03b8 `s/objCopy/Object.assign/`. Can one break luggite with
  weird non-objects that make it to Object.assign calls? Try it. The reason
  to use Object.assign was an unmeasured assumption that it would be more
  robust and faster.


