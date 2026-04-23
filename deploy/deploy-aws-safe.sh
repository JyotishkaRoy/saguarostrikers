#!/usr/bin/env bash

# Safe AWS deployment script for Production branch.
# This script NEVER updates the local data/ directory from git.

set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/saguarostrikers/.git}"
BRANCH="${BRANCH:-Production}"
PM2_APP="${PM2_APP:-saguaro-backend}"
DEPLOY_FRONTEND="${DEPLOY_FRONTEND:-false}"

echo "Starting safe AWS deployment"
echo "Repo: ${REPO_DIR}"
echo "Branch: ${BRANCH}"
echo "PM2 app: ${PM2_APP}"

cd "${REPO_DIR}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: ${REPO_DIR} is not a git working tree"
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "${CURRENT_BRANCH}" != "${BRANCH}" ]]; then
  echo "Switching branch from ${CURRENT_BRANCH} to ${BRANCH}"
  git checkout "${BRANCH}"
fi

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

if [[ -d "data" ]]; then
  echo "Backing up runtime data directory"
  cp -a data "${TMP_DIR}/data-backup"
fi

# Ensure runtime data files are never updated by git operations.
if git ls-files --error-unmatch data >/dev/null 2>&1 || git ls-files "data/*" >/dev/null 2>&1; then
  echo "Marking tracked data files as skip-worktree"
  git ls-files "data/*" | xargs -r git update-index --skip-worktree
fi

echo "Fetching latest ${BRANCH}"
git fetch origin "${BRANCH}"

echo "Updating tracked files from origin/${BRANCH}, excluding data/"
git restore --source="origin/${BRANCH}" --staged --worktree . ':(exclude)data/**'

if [[ -d "${TMP_DIR}/data-backup" ]]; then
  if ! diff -qr data "${TMP_DIR}/data-backup" >/dev/null 2>&1; then
    echo "WARNING: data directory changed during deploy; restoring backup"
    rm -rf data
    cp -a "${TMP_DIR}/data-backup" data
  fi

  echo "Restoring runtime data directory backup"
  rm -rf data
  cp -a "${TMP_DIR}/data-backup" data
fi

echo "Building backend"
cd backend
npm ci
npm run build

echo "Restarting backend process"
bash -lc "pm2 restart ${PM2_APP}"

if [[ "${DEPLOY_FRONTEND}" == "true" ]]; then
  echo "Building frontend"
  cd ../frontend
  npm ci
  npm run build
fi

echo "Deployment completed successfully"
