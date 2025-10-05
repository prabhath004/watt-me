#!/bin/bash
# Helper script to run single-home simulation with correct PYTHONPATH

cd "$(dirname "$0")"
export PYTHONPATH="$(pwd)"
python3 -m neighborgrid.src.run_single "$@"

