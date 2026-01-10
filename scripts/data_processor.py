"""
Global Metals Sales Intelligence Platform
Data Collection & Structuring Module
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import yfinance as yf

class MetalsDataProcessor:
    """
    Handles data collection, cleaning, and structuring for metals trading platform
    """
    
    def __init__(self):
        self.metals_tickers = {
            'copper': 'HG=F',      # COMEX Copper
            'aluminum': 'ALI=F',   # Aluminum futures (use proxy if needed)
            'zinc': 'ZN=F',        # Zinc futures
            'gold': 'GC=F',        # COMEX Gold
            'silver': 'SI=F'       # COMEX Silver
        }
        
        self.fx_tickers = {
            'usdcnh': 'CNH=X',
            'usdinr': 'INR=X',
            'dxy': 'DX-Y.NYB'
        }
        
    def fetch_price_data(self, start_date, end_date):
        """
        Fetch daily OHLCV data for all metals
        """
        data = {}
        
        for metal, ticker in self.metals_tickers.items():
            try:
                df = yf.download(ticker, start=start_date, end=end_date, progress=False)
                data[metal] = df[['Open', 'High', 'Low', 'Close', 'Volume']]
                print(f"✓ Fetched {metal} data: {len(df)} rows")
            except Exception as e:
                print(f"✗ Error fetching {metal}: {str(e)}")
                
        return data
    
    def fetch_fx_data(self, start_date, end_date):
        """
        Fetch FX data for APAC currencies
        """
        fx_data = {}
        
        for pair, ticker in self.fx_tickers.items():
            try:
                df = yf.download(ticker, start=start_date, end=end_date, progress=False)
                fx_data[pair] = df['Close']
                print(f"✓ Fetched {pair} data: {len(df)} rows")
            except Exception as e:
                print(f"✗ Error fetching {pair}: {str(e)}")
                
        return pd.DataFrame(fx_data)
    
    def fetch_macro_data(self):
        """
        Fetch macro indicators (PMI, yields, etc.)
        Note: In production, use Fred API or Bloomberg
        """
        # Simulated macro data - replace with real API calls
        dates = pd.date_range(start='2024-01-01', end='2026-01-10', freq='M')
        
        macro_df = pd.DataFrame({
            'date': dates,
            'china_pmi': np.random.normal(50.5, 1.5, len(dates)),
            'us_10y_yield': np.random.normal(4.2, 0.3, len(dates)),
            'copper_inventory': np.random.normal(100000, 15000, len(dates))
        })
        
        return macro_df
    
    def create_normalized_dataset(self, start_date='2024-01-01', end_date='2026-01-10'):
        """
        Create clean, normalized dataset for analysis
        """
        # Fetch all data
        metals_data = self.fetch_price_data(start_date, end_date)
        fx_data = self.fetch_fx_data(start_date, end_date)
        macro_data = self.fetch_macro_data()
        
        # Merge metals close prices
        metals_close = pd.DataFrame({
            metal: data['Close'] for metal, data in metals_data.items()
        })
        
        # Merge all data
        combined = metals_close.join(fx_data, how='outer')
        
        # Forward fill macro data (monthly to daily)
        combined['date'] = combined.index
        combined = pd.merge_asof(
            combined.sort_values('date'),
            macro_data.sort_values('date'),
            on='date',
            direction='backward'
        )
        
        # Calculate derived metrics
        combined['copper_aluminum_spread'] = combined['copper'] / combined['aluminum']
        combined['gold_silver_ratio'] = combined['gold'] / combined['silver']
        
        # Clean and fill missing values
        combined = combined.fillna(method='ffill').fillna(method='bfill')
        
        print(f"\n✓ Created normalized dataset: {len(combined)} rows, {len(combined.columns)} columns")
        
        return combined
    
    def calculate_returns(self, df, periods=[1, 5, 20]):
        """
        Calculate returns over multiple periods
        """
        for period in periods:
            for col in ['copper', 'aluminum', 'zinc', 'gold', 'silver']:
                if col in df.columns:
                    df[f'{col}_return_{period}d'] = df[col].pct_change(period) * 100
                    
        return df
    
    def calculate_volatility(self, df, window=20):
        """
        Calculate rolling volatility
        """
        for col in ['copper', 'aluminum', 'zinc', 'gold', 'silver']:
            if col in df.columns:
                returns = df[col].pct_change()
                df[f'{col}_vol_{window}d'] = returns.rolling(window).std() * np.sqrt(252) * 100
                
        return df
    
    def save_dataset(self, df, filename='metals_master_data.csv'):
        """
        Save processed dataset
        """
        df.to_csv(filename, index=False)
        print(f"✓ Saved dataset to {filename}")
        

# Example usage
if __name__ == "__main__":
    processor = MetalsDataProcessor()
    
    # Create master dataset
    df = processor.create_normalized_dataset()
    
    # Add derived metrics
    df = processor.calculate_returns(df)
    df = processor.calculate_volatility(df)
    
    # Save
    processor.save_dataset(df)
    
    # Display summary
    print("\n" + "="*60)
    print("DATASET SUMMARY")
    print("="*60)
    print(df.describe())
    print("\n" + "="*60)
    print("LATEST VALUES")
    print("="*60)
    print(df.tail(1).T)