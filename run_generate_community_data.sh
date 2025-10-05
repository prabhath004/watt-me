#!/bin/bash
# Generate community energy data for frontend dashboard

cd "$(dirname "$0")"
export PYTHONPATH="$(pwd)"

echo "🏘️  Generating community energy data..."
echo ""

python3 -m neighborgrid.src.run_multi "$@"

echo ""
echo "✅ Data generation complete!"
echo ""
echo "📊 View the dashboard:"
echo "   1. Start dev server: npm run dev"
echo "   2. Login as admin: http://localhost:8080/login/admin"
echo "   3. Navigate to: Admin → Community Dashboard"
echo ""

