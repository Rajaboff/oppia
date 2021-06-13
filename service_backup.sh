#!/bin/bash

set -x
LOG_FILE=/var/log/service_backup.log

BACKUP_DIR=/backups/daily
BASE_DIR=/root/appengine.None.root

create_backup() {
    local BACKUP_NAME="`date +%Y%m%dT%H%M%S`_appengine.None.root"
    local ARCHIVE_NAME="$BACKUP_NAME.tar.gz"

    cd $BASE_DIR
    mkdir -p $BACKUP_DIR
    # backup and archive
    tar cfz "$BACKUP_DIR/$ARCHIVE_NAME" ./*
}

restore_backup() {
    local ARCHIVE_NAME="$2"
    if [ -z "$ARCHIVE_NAME" ]; then
        echo "Archive name should be passed to the script, i.e. 'service_backup.sh restore /backups/daily/20210524T190415_appengine.None.root.tar.gz'"
        exit 1
    fi

    mkdir -p $BASE_DIR

    # restore
    tar xfz "$ARCHIVE_NAME" -C $BASE_DIR
}

COMMAND="$1"
{
    echo "Command: $COMMAND"
    if [ "$COMMAND" == "create" ]; then
        echo "Creating backup"
        create_backup $@
    fi
    if [ "$COMMAND" == "restore" ]; then
        echo "Restoring backup"
        restore_backup $@
    fi
} >> $LOG_FILE 2>&1
