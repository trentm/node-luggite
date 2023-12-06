#!/usr/bin/env bash
#
# Usage:   ./scripts/test-with-node-vers.sh [VERS...]
# Examples:
#     ./scripts/test-with-node-vers.sh 10
#     ./scripts/test-with-node-vers.sh 10 14.0

if [[ -n "$TRACE" ]]; then
    export PS4='${BASH_SOURCE}:${LINENO}: ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'
    set -o xtrace
fi
set -o errexit
set -o pipefail

TOP=$(unset CDPATH; cd $(dirname $0)/../; pwd)
NVM_DIR=$HOME/.nvm

VERS="$*"
for ver in $VERS; do
    NODE_PREFIX=$(ls -d $NVM_DIR/versions/node/v${ver}* | sort -V | tail -1)
    echo -n "> node "
    $NODE_PREFIX/bin/node --version
    PATH="$NODE_PREFIX/bin:$PATH" npm test
done
