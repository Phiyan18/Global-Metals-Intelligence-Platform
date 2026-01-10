"""
Trade Lifecycle & Operations Management System
Simulates trade booking, tracking, and management
"""

import pandas as pd
import uuid
from datetime import datetime, timedelta
import json

class TradeManagementSystem:
    """
    Complete trade lifecycle management
    """
    
    def __init__(self):
        self.trades = []
        self.trade_history = []
        
    def generate_trade_id(self):
        """Generate unique trade ID"""
        return f"TRD{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}"
    
    def book_directional_trade(self,
                              counterparty,
                              metal,
                              direction,
                              entry_price,
                              notional,
                              target_price=None,
                              stop_price=None,
                              rationale=""):
        """
        Book a directional metals trade
        """
        trade_id = self.generate_trade_id()
        
        trade = {
            'trade_id': trade_id,
            'trade_type': 'Directional',
            'product': metal,
            'direction': direction,
            'counterparty': counterparty,
            'entry_price': entry_price,
            'target_price': target_price,
            'stop_price': stop_price,
            'notional': notional,
            'entry_date': datetime.now().strftime('%Y-%m-%d'),
            'exit_date': None,
            'exit_price': None,
            'status': 'Proposed',
            'pnl': 0,
            'rationale': rationale,
            'last_updated': datetime.now().isoformat()
        }
        
        self.trades.append(trade)
        self._log_action(trade_id, 'BOOKED', trade)
        
        print(f"✓ Trade booked: {trade_id}")
        return trade_id
    
    def book_spread_trade(self,
                         counterparty,
                         long_metal,
                         short_metal,
                         entry_ratio,
                         notional,
                         target_ratio=None,
                         stop_ratio=None,
                         rationale=""):
        """
        Book a spread trade
        """
        trade_id = self.generate_trade_id()
        
        trade = {
            'trade_id': trade_id,
            'trade_type': 'Spread',
            'product': f'{long_metal}/{short_metal}',
            'long_leg': long_metal,
            'short_leg': short_metal,
            'counterparty': counterparty,
            'entry_ratio': entry_ratio,
            'target_ratio': target_ratio,
            'stop_ratio': stop_ratio,
            'notional': notional,
            'entry_date': datetime.now().strftime('%Y-%m-%d'),
            'exit_date': None,
            'exit_ratio': None,
            'status': 'Proposed',
            'pnl': 0,
            'rationale': rationale,
            'last_updated': datetime.now().isoformat()
        }
        
        self.trades.append(trade)
        self._log_action(trade_id, 'BOOKED', trade)
        
        print(f"✓ Spread trade booked: {trade_id}")
        return trade_id
    
    def update_trade_status(self, trade_id, new_status):
        """
        Update trade status (Proposed → Executed → Settled)
        """
        trade = self._find_trade(trade_id)
        if not trade:
            print(f"✗ Trade {trade_id} not found")
            return False
        
        old_status = trade['status']
        trade['status'] = new_status
        trade['last_updated'] = datetime.now().isoformat()
        
        self._log_action(trade_id, f'STATUS_CHANGE: {old_status} → {new_status}', trade)
        
        print(f"✓ {trade_id} status updated: {old_status} → {new_status}")
        return True
    
    def execute_trade(self, trade_id):
        """
        Mark trade as executed
        """
        return self.update_trade_status(trade_id, 'Executed')
    
    def close_trade(self, trade_id, exit_price_or_ratio, current_market_price=None):
        """
        Close a trade and calculate P&L
        """
        trade = self._find_trade(trade_id)
        if not trade:
            print(f"✗ Trade {trade_id} not found")
            return False
        
        if trade['trade_type'] == 'Directional':
            trade['exit_price'] = exit_price_or_ratio
            entry = trade['entry_price']
            exit_p = exit_price_or_ratio
            
            if trade['direction'].lower() == 'long':
                pnl = (exit_p - entry) / entry * trade['notional']
            else:
                pnl = (entry - exit_p) / entry * trade['notional']
            
            trade['pnl'] = pnl
            
        elif trade['trade_type'] == 'Spread':
            trade['exit_ratio'] = exit_price_or_ratio
            pnl = (exit_price_or_ratio - trade['entry_ratio']) / trade['entry_ratio'] * trade['notional']
            trade['pnl'] = pnl
        
        trade['exit_date'] = datetime.now().strftime('%Y-%m-%d')
        trade['status'] = 'Closed'
        trade['last_updated'] = datetime.now().isoformat()
        
        self._log_action(trade_id, 'CLOSED', trade)
        
        print(f"✓ {trade_id} closed | P&L: ${pnl:,.2f}")
        return True
    
    def get_portfolio_summary(self):
        """
        Get current portfolio summary
        """
        if not self.trades:
            return {'total_trades': 0, 'active': 0, 'closed': 0, 'total_pnl': 0}
        
        df = pd.DataFrame(self.trades)
        
        summary = {
            'total_trades': len(df),
            'proposed': len(df[df['status'] == 'Proposed']),
            'executed': len(df[df['status'] == 'Executed']),
            'closed': len(df[df['status'] == 'Closed']),
            'total_pnl': df[df['status'] == 'Closed']['pnl'].sum(),
            'total_notional': df['notional'].sum(),
            'avg_trade_size': df['notional'].mean()
        }
        
        return summary
    
    def get_trades_by_status(self, status):
        """
        Get all trades with specific status
        """
        return [t for t in self.trades if t['status'] == status]
    
    def get_trades_by_counterparty(self, counterparty):
        """
        Get all trades for specific counterparty
        """
        return [t for t in self.trades if t['counterparty'] == counterparty]
    
    def export_trades_to_csv(self, filename='trades_export.csv'):
        """
        Export all trades to CSV
        """
        if not self.trades:
            print("No trades to export")
            return
        
        df = pd.DataFrame(self.trades)
        df.to_csv(filename, index=False)
        print(f"✓ Exported {len(df)} trades to {filename}")
    
    def generate_trade_blotter(self):
        """
        Generate trade blotter (daily trade log)
        """
        if not self.trades:
            print("No trades in system")
            return pd.DataFrame()
        
        df = pd.DataFrame(self.trades)
        
        # Blotter columns
        blotter_cols = [
            'trade_id', 'entry_date', 'trade_type', 'product',
            'counterparty', 'notional', 'status', 'pnl'
        ]
        
        blotter = df[blotter_cols].copy()
        blotter['pnl'] = blotter['pnl'].apply(lambda x: f"${x:,.2f}" if pd.notna(x) else "$0.00")
        
        return blotter
    
    def _find_trade(self, trade_id):
        """Find trade by ID"""
        for trade in self.trades:
            if trade['trade_id'] == trade_id:
                return trade
        return None
    
    def _log_action(self, trade_id, action, trade_data):
        """Log all trade actions"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'trade_id': trade_id,
            'action': action,
            'data': trade_data.copy()
        }
        self.trade_history.append(log_entry)
    
    def print_portfolio_summary(self):
        """
        Print formatted portfolio summary
        """
        summary = self.get_portfolio_summary()
        
        print("\n" + "="*70)
        print("PORTFOLIO SUMMARY")
        print("="*70)
        print(f"Total Trades:          {summary['total_trades']}")
        print(f"  • Proposed:          {summary['proposed']}")
        print(f"  • Executed:          {summary['executed']}")
        print(f"  • Closed:            {summary['closed']}")
        print(f"\nTotal Notional:        ${summary['total_notional']:,.0f}")
        print(f"Average Trade Size:    ${summary['avg_trade_size']:,.0f}")
        print(f"Total P&L (Closed):    ${summary['total_pnl']:,.2f}")
        print("="*70 + "\n")


# Example usage
if __name__ == "__main__":
    tms = TradeManagementSystem()
    
    # Book some trades
    print("Booking trades...\n")
    
    trade1 = tms.book_directional_trade(
        counterparty="China Steel Corp",
        metal="Copper",
        direction="Long",
        entry_price=8650,
        notional=1000000,
        target_price=9200,
        stop_price=8400,
        rationale="China PMI recovery + weaker USD outlook"
    )
    
    trade2 = tms.book_spread_trade(
        counterparty="Mumbai Metals Ltd",
        long_metal="Copper",
        short_metal="Aluminum",
        entry_ratio=3.76,
        notional=500000,
        target_ratio=4.00,
        stop_ratio=3.60,
        rationale="Infrastructure theme favors copper over aluminum"
    )
    
    trade3 = tms.book_directional_trade(
        counterparty="Tokyo Trading Co",
        metal="Gold",
        direction="Long",
        entry_price=2050,
        notional=750000,
        target_price=2100,
        rationale="Safe haven demand on rate cut expectations"
    )
    
    # Execute trades
    print("\nExecuting trades...\n")
    tms.execute_trade(trade1)
    tms.execute_trade(trade2)
    
    # Close a trade
    print("\nClosing trades...\n")
    tms.close_trade(trade1, exit_price_or_ratio=8950)
    
    # Portfolio summary
    tms.print_portfolio_summary()
    
    # Trade blotter
    print("TRADE BLOTTER")
    print("="*70)
    blotter = tms.generate_trade_blotter()
    print(blotter.to_string(index=False))
    
    # Export
    tms.export_trades_to_csv()
    
    # Save trade history
    with open('trade_history.json', 'w') as f:
        json.dump(tms.trade_history, f, indent=2)
    print("\n✓ Saved trade history to trade_history.json")