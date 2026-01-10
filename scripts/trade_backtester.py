"""
Trade Idea Backtesting & Performance Analysis
Professional-grade backtesting for metals trading strategies
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

class TradeBacktester:
    """
    Backtest trading strategies and generate performance metrics
    """
    
    def __init__(self, data_file='metals_master_data.csv'):
        self.df = pd.read_csv(data_file)
        self.df['date'] = pd.to_datetime(self.df['date'])
        self.trades = []
        
    def momentum_strategy(self, metal='copper', lookback=20, holding=60):
        """
        Simple momentum strategy: Buy when price > MA, sell when < MA
        """
        df = self.df.copy()
        df[f'{metal}_ma'] = df[metal].rolling(lookback).mean()
        
        trades = []
        position = None
        
        for i in range(lookback, len(df) - holding):
            current_price = df.iloc[i][metal]
            ma_price = df.iloc[i][f'{metal}_ma']
            
            # Entry signal
            if position is None and current_price > ma_price:
                entry_date = df.iloc[i]['date']
                entry_price = current_price
                
                # Exit after holding period
                exit_idx = min(i + holding, len(df) - 1)
                exit_date = df.iloc[exit_idx]['date']
                exit_price = df.iloc[exit_idx][metal]
                
                pnl = (exit_price - entry_price) / entry_price * 100
                
                trades.append({
                    'entry_date': entry_date,
                    'entry_price': entry_price,
                    'exit_date': exit_date,
                    'exit_price': exit_price,
                    'return': pnl,
                    'holding_days': (exit_date - entry_date).days
                })
                
                position = None  # Reset after exit
        
        return pd.DataFrame(trades)
    
    def spread_strategy(self, metal1='copper', metal2='aluminum', 
                       threshold=0.1, holding=40):
        """
        Mean reversion spread strategy
        """
        df = self.df.copy()
        df['spread'] = df[metal1] / df[metal2]
        df['spread_ma'] = df['spread'].rolling(60).mean()
        df['spread_std'] = df['spread'].rolling(60).std()
        
        trades = []
        
        for i in range(60, len(df) - holding):
            current_spread = df.iloc[i]['spread']
            ma = df.iloc[i]['spread_ma']
            std = df.iloc[i]['spread_std']
            
            # Z-score
            z_score = (current_spread - ma) / std
            
            # Entry when spread deviates significantly
            if abs(z_score) > threshold:
                entry_date = df.iloc[i]['date']
                entry_spread = current_spread
                
                # Exit after holding period
                exit_idx = min(i + holding, len(df) - 1)
                exit_date = df.iloc[exit_idx]['date']
                exit_spread = df.iloc[exit_idx]['spread']
                
                # Long spread if z < 0, short if z > 0
                if z_score < 0:
                    pnl = (exit_spread - entry_spread) / entry_spread * 100
                else:
                    pnl = (entry_spread - exit_spread) / entry_spread * 100
                
                trades.append({
                    'entry_date': entry_date,
                    'entry_spread': entry_spread,
                    'exit_date': exit_date,
                    'exit_spread': exit_spread,
                    'z_score': z_score,
                    'return': pnl,
                    'holding_days': (exit_date - entry_date).days
                })
        
        return pd.DataFrame(trades)
    
    def calculate_performance_metrics(self, trades_df):
        """
        Calculate comprehensive performance metrics
        """
        if len(trades_df) == 0:
            return {}
        
        returns = trades_df['return'].values
        
        metrics = {
            'total_trades': len(trades_df),
            'win_rate': (returns > 0).sum() / len(returns) * 100,
            'avg_return': returns.mean(),
            'total_return': returns.sum(),
            'best_trade': returns.max(),
            'worst_trade': returns.min(),
            'sharpe_ratio': returns.mean() / returns.std() if returns.std() > 0 else 0,
            'max_drawdown': self._calculate_max_drawdown(returns),
            'profit_factor': abs(returns[returns > 0].sum() / returns[returns < 0].sum()) 
                            if (returns < 0).any() else np.inf
        }
        
        return metrics
    
    def _calculate_max_drawdown(self, returns):
        """
        Calculate maximum drawdown
        """
        cumulative = (1 + returns / 100).cumprod()
        running_max = np.maximum.accumulate(cumulative)
        drawdown = (cumulative - running_max) / running_max * 100
        return drawdown.min()
    
    def plot_performance(self, trades_df, title='Strategy Performance'):
        """
        Visualize strategy performance
        """
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle(title, fontsize=16, fontweight='bold')
        
        returns = trades_df['return'].values
        cumulative = (1 + returns / 100).cumprod()
        
        # Cumulative P&L
        axes[0, 0].plot(cumulative, linewidth=2, color='#2563eb')
        axes[0, 0].axhline(y=1, color='red', linestyle='--', alpha=0.5)
        axes[0, 0].set_title('Cumulative Returns', fontweight='bold')
        axes[0, 0].set_xlabel('Trade Number')
        axes[0, 0].set_ylabel('Cumulative Return')
        axes[0, 0].grid(True, alpha=0.3)
        
        # Drawdown
        running_max = np.maximum.accumulate(cumulative)
        drawdown = (cumulative - running_max) / running_max * 100
        axes[0, 1].fill_between(range(len(drawdown)), drawdown, 0, 
                                color='red', alpha=0.3)
        axes[0, 1].set_title('Drawdown', fontweight='bold')
        axes[0, 1].set_xlabel('Trade Number')
        axes[0, 1].set_ylabel('Drawdown (%)')
        axes[0, 1].grid(True, alpha=0.3)
        
        # Return distribution
        axes[1, 0].hist(returns, bins=30, color='#10b981', alpha=0.7, edgecolor='black')
        axes[1, 0].axvline(x=0, color='red', linestyle='--', linewidth=2)
        axes[1, 0].set_title('Return Distribution', fontweight='bold')
        axes[1, 0].set_xlabel('Return (%)')
        axes[1, 0].set_ylabel('Frequency')
        axes[1, 0].grid(True, alpha=0.3)
        
        # Win/Loss analysis
        wins = (returns > 0).sum()
        losses = (returns <= 0).sum()
        axes[1, 1].bar(['Wins', 'Losses'], [wins, losses], 
                      color=['#10b981', '#ef4444'], alpha=0.7, edgecolor='black')
        axes[1, 1].set_title('Win/Loss Count', fontweight='bold')
        axes[1, 1].set_ylabel('Number of Trades')
        axes[1, 1].grid(True, alpha=0.3, axis='y')
        
        plt.tight_layout()
        plt.savefig('backtest_performance.png', dpi=300, bbox_inches='tight')
        print("✓ Saved performance chart: backtest_performance.png")
        plt.close()
    
    def generate_performance_report(self, trades_df, strategy_name):
        """
        Print detailed performance report
        """
        metrics = self.calculate_performance_metrics(trades_df)
        
        print("\n" + "="*70)
        print(f"BACKTEST PERFORMANCE REPORT: {strategy_name}")
        print("="*70)
        print(f"\nTotal Trades:        {metrics['total_trades']}")
        print(f"Win Rate:            {metrics['win_rate']:.2f}%")
        print(f"Average Return:      {metrics['avg_return']:+.2f}%")
        print(f"Total Return:        {metrics['total_return']:+.2f}%")
        print(f"Best Trade:          {metrics['best_trade']:+.2f}%")
        print(f"Worst Trade:         {metrics['worst_trade']:+.2f}%")
        print(f"Sharpe Ratio:        {metrics['sharpe_ratio']:.2f}")
        print(f"Max Drawdown:        {metrics['max_drawdown']:.2f}%")
        print(f"Profit Factor:       {metrics['profit_factor']:.2f}")
        print("="*70)


# Example usage
if __name__ == "__main__":
    backtester = TradeBacktester()
    
    # Test momentum strategy
    print("\nRunning Momentum Strategy Backtest...")
    momentum_trades = backtester.momentum_strategy(metal='copper', lookback=20, holding=60)
    backtester.generate_performance_report(momentum_trades, "Copper Momentum (20/60)")
    backtester.plot_performance(momentum_trades, "Copper Momentum Strategy")
    
    # Test spread strategy
    print("\nRunning Spread Strategy Backtest...")
    spread_trades = backtester.spread_strategy(metal1='copper', metal2='aluminum')
    backtester.generate_performance_report(spread_trades, "Copper/Aluminum Spread")
    backtester.plot_performance(spread_trades, "Copper/Aluminum Spread Strategy")
    
    # Save trades to CSV
    momentum_trades.to_csv('momentum_trades.csv', index=False)
    spread_trades.to_csv('spread_trades.csv', index=False)
    print("\n✓ Saved trade logs to CSV files")