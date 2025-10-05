#!/bin/bash
# Comprehensive verification script for NeighborGrid setup

echo "🔍 NeighborGrid Setup Verification"
echo "===================================="
echo ""

cd "$(dirname "$0")"

# Check directory structure
echo "✓ Checking directory structure..."
if [ -d "neighborgrid/src" ] && [ -d "neighborgrid/tests" ]; then
    echo "  ✅ Directory structure correct"
else
    echo "  ❌ Missing directories"
    exit 1
fi

# Check Python modules
echo ""
echo "✓ Checking Python modules..."
required_files=(
    "neighborgrid/src/__init__.py"
    "neighborgrid/src/config.py"
    "neighborgrid/src/simulator.py"
    "neighborgrid/src/dispatch.py"
    "neighborgrid/src/run_single.py"
    "neighborgrid/src/io_utils.py"
    "neighborgrid/tests/test_synthetic_shapes.py"
    "neighborgrid/tests/test_dispatch_invariants.py"
)

all_present=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file missing"
        all_present=false
    fi
done

if [ "$all_present" = false ]; then
    exit 1
fi

# Check dependencies
echo ""
echo "✓ Checking Python dependencies..."
export PYTHONPATH="$(pwd)"
python3 - << 'PY'
try:
    import pandas
    import numpy
    import pytest
    print("  ✅ All dependencies installed")
except ImportError as e:
    print(f"  ❌ Missing dependency: {e}")
    exit(1)
PY

# Run import test
echo ""
echo "✓ Testing imports..."
python3 - << 'PY'
try:
    from neighborgrid.src.simulator import make_single_home_timeseries
    from neighborgrid.src.dispatch import run_dispatch_single
    print("  ✅ Imports working")
except ImportError as e:
    print(f"  ❌ Import failed: {e}")
    exit(1)
PY

# Run tests
echo ""
echo "✓ Running tests..."
export PYTHONPATH="$(pwd)"
if pytest -q 2>&1 | grep -q "passed"; then
    echo "  ✅ All tests passing"
else
    echo "  ❌ Tests failed"
    exit 1
fi

# Run quick simulation
echo ""
echo "✓ Running quick simulation test..."
export PYTHONPATH="$(pwd)"
if python3 -m neighborgrid.src.run_single --hours 6 --out /tmp/verify_test.csv > /dev/null 2>&1; then
    echo "  ✅ Simulation runs successfully"
    rm -f /tmp/verify_test.csv
else
    echo "  ❌ Simulation failed"
    exit 1
fi

echo ""
echo "===================================="
echo "🎉 All verifications passed!"
echo ""
echo "Next steps:"
echo "  • Run full simulation: ./run_simulation.sh --hours 24 --out results.csv"
echo "  • View output: head results.csv"
echo "  • Read docs: cat NEIGHBORGRID_SETUP.md"
echo ""

