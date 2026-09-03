#!/usr/bin/env bash
# Overnight unattended build runner.
#
# Runs the `build-next` skill repeatedly against BUILD_PLAN.md until either
# the plan is complete, a task fails, or MAX_TASKS is hit — whichever first.
# Every run is logged and committed one task at a time on a `nightly` branch,
# so a human reviews and merges in the morning. Never touches `main`.
#
# USAGE
#   cd /path/to/your/repo
#   ./scripts/overnight-run.sh
#
# SCHEDULING (macOS launchd is more reliable than cron for laptops that
# sleep — cron won't fire if the machine is asleep at the scheduled time).
#
#   Quick option — crontab (works if the Mac stays awake overnight):
#     crontab -e
#     0 1 * * *  cd /path/to/your/repo && ./scripts/overnight-run.sh >> ~/overnight.log 2>&1
#
#   Better option — launchd (create ~/Library/LaunchAgents/com.you.overnightbuild.plist,
#   set ProgramArguments to this script, StartCalendarInterval hour=1 minute=0,
#   then `launchctl load ~/Library/LaunchAgents/com.you.overnightbuild.plist`).
#   Ask Claude Code to generate the exact plist for your repo path if you want
#   this option — it's a few lines of XML.

set -euo pipefail

MAX_TASKS="${MAX_TASKS:-8}"
LOG_DIR="logs/overnight"
BRANCH="nightly"

mkdir -p "$LOG_DIR"
STAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="$LOG_DIR/$STAMP.log"

echo "=== Overnight run started $STAMP ===" | tee -a "$LOG_FILE"

# Make sure we're never on main.
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" = "main" ]; then
  git checkout -B "$BRANCH" | tee -a "$LOG_FILE"
fi

for i in $(seq 1 "$MAX_TASKS"); do
  if ! grep -q '^\- \[ \]' BUILD_PLAN.md; then
    echo "No unchecked tasks remain. Stopping." | tee -a "$LOG_FILE"
    break
  fi

  echo "--- Task run $i/$MAX_TASKS ---" | tee -a "$LOG_FILE"

  # acceptEdits auto-approves file writes; it does NOT auto-approve pushes,
  # and the skill itself is instructed never to push to main.
  if ! claude -p "/build-next" \
      --permission-mode acceptEdits \
      --allowedTools "Read,Edit,Write,Bash,Glob,Grep" \
      2>&1 | tee -a "$LOG_FILE"; then
    echo "Task run $i failed — stopping the queue for manual review." | tee -a "$LOG_FILE"
    break
  fi
done

echo "=== Overnight run finished $(date +%Y%m%d-%H%M%S) ===" | tee -a "$LOG_FILE"
echo "Review the '$BRANCH' branch and this log before merging: $LOG_FILE"
