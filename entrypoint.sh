#! /bin/bash

mkdir -p /oppia/.git/hooks/
cd /oppia/.git/hooks/

if [ ! -L pre-commit ]; then
	ln -s /oppia/scripts/pre_commit_hook.py pre-commit
fi

cd /oppia
echo "Starting $@"
exec $@