#!/bin/bash
BACKUP_DIR=/var/backups/albatross
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M)
cp /var/www/albatross/genplan.db $BACKUP_DIR/genplan_$DATE.db
cp /var/www/albatross/.env $BACKUP_DIR/env_$DATE
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/www/albatross/static uploads 2>/dev/null || true
# Keep only last 14 days
find $BACKUP_DIR -type f -mtime +14 -delete

