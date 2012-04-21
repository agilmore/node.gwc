#!/bin/bash
svn update --accept 'theirs-full'
if [ -f node.gwc.pid ]; then
	kill `cat ./node.gwc.pid`
	rm node.gwc.pid
fi
nodejs index.js >> /tmp/node.gwc.log 2>&1 &
echo $! > node.gwc.pid
