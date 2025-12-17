#!/usr/bin/env python3
"""
Script to run Selenium tests with proper configuration
"""
import sys
import subprocess
import os


def main():
    """
    Run pytest with HTML report generation
    """
    # Set default BASE_URL if not provided
    if "BASE_URL" not in os.environ:
        os.environ["BASE_URL"] = "http://localhost"
    
    print(f"Running Selenium tests against: {os.environ['BASE_URL']}")
    print("-" * 60)
    
    # Run pytest with HTML report
    cmd = [
        "pytest",
        "-v",
        "--html=test_report.html",
        "--self-contained-html",
        "--tb=short"
    ]
    
    # Add any additional arguments passed to this script
    if len(sys.argv) > 1:
        cmd.extend(sys.argv[1:])
    
    try:
        result = subprocess.run(cmd, check=False)
        sys.exit(result.returncode)
    except FileNotFoundError:
        print("Error: pytest not found. Please install requirements:")
        print("  pip install -r requirements.txt")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nTests interrupted by user")
        sys.exit(130)


if __name__ == "__main__":
    main()
