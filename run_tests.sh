#!/bin/bash
# Helper script to run tests with correct PYTHONPATH

cd "$(dirname "$0")"
export PYTHONPATH="$(pwd)"
pytest -v "$@"

