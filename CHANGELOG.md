# node-luggite Changelog

## Unreleased

## v0.2.1

- Some minor jsdoc type improvements.

## v0.2.0

- Added jsdoc-based types. This is a *start* at supporting types for IDE
  completion TypeScript users.

## v0.1.0

This is a first milestone (M1). It is still private: I'm tagging, but not
publishing this to npm yet.

It is mostly a stripped down Bunyan. Some notable differences (see "Differences
with Bunyan" in the README):

- No 'hostname' and 'pid' fields by default. Easy to add via:
    ```js
    var log = createLogger({
        name: '...',
        fields: { pid: process.pid, hostname: os.hostname() }
    });
    ```
- The 'name' field/config option is no longer required.

Some current limitations in this version:

- stdout output only, no user-customizable streams (yet)
- no user-definable serializers; the built-in "err" serializer is enabled
- there is no CLI pretty-printer

WARNING: Some API (e.g. `log.level`) and field formats (e.g. `time) might
change in subsequent versions.

