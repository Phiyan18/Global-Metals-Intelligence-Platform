"""
Run complete metals platform workflow
"""
import subprocess
import sys

scripts = [
    "scripts/data_processor.py",
    "scripts/market_commentary.py",
    "scripts/trade_backtester.py",
    "scripts/excel_pricing_model.py",
    "scripts/trade_management.py"
]

print("="*70)
print("RUNNING METALS INTELLIGENCE PLATFORM")
print("="*70)

for script in scripts:
    print(f"\n▶ Running {script}...")
    try:
        subprocess.run([sys.executable, script], check=True)
        print(f"✓ {script} completed successfully\n")
    except subprocess.CalledProcessError as e:
        print(f"✗ {script} failed: {e}\n")

print("="*70)
print("ALL MODULES COMPLETED")
print("="*70)
print("\nCheck the following outputs:")
print("  • metals_master_data.csv")
print("  • daily_market_report.pdf")
print("  • backtest_performance.png")
print("  • metals_pricing_models.xlsx")
print("  • trades_export.csv")