#!/bin/bash
# Run Bharat Textiles Web-based Billing Software
# Make executable: chmod +x run.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Python 3 is available
if ! command -v python3 &>/dev/null; then
    echo "ERROR: Python 3 not found. Please install Python 3."
    exit 1
fi

# Use virtual environment if it exists
if [ -d "venv" ]; then
    PYTHON_EXE="./venv/bin/python"
else
    PYTHON_EXE="python3"
fi

# Install requirements if not already installed
echo "Checking dependencies..."
$PYTHON_EXE -m pip install -r requirements.txt

echo "Starting Bharat Textiles Web Billing Software..."
echo "Open http://127.0.0.1:8000 in your browser."
$PYTHON_EXE server.py


