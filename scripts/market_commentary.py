"""
Daily Metals Market Colour Engine
Automated commentary generation for sales teams
"""

import pandas as pd
import numpy as np
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors

class MarketCommentaryEngine:
    """
    Generate daily market colour reports like JPM sales commentary
    """
    
    def __init__(self, data_file='metals_master_data.csv'):
        self.df = pd.read_csv(data_file)
        self.df['date'] = pd.to_datetime(self.df['date'])
        
    def get_latest_snapshot(self):
        """
        Get quantitative snapshot for all metals
        """
        latest = self.df.iloc[-1]
        prev_day = self.df.iloc[-2]
        prev_week = self.df.iloc[-6] if len(self.df) >= 6 else prev_day
        prev_month = self.df.iloc[-21] if len(self.df) >= 21 else prev_day
        
        snapshot = {}
        
        for metal in ['copper', 'aluminum', 'zinc', 'gold', 'silver']:
            snapshot[metal] = {
                'spot': latest[metal],
                '1d_return': ((latest[metal] - prev_day[metal]) / prev_day[metal] * 100),
                '1w_return': ((latest[metal] - prev_week[metal]) / prev_week[metal] * 100),
                '1m_return': ((latest[metal] - prev_month[metal]) / prev_month[metal] * 100),
                'volatility': latest.get(f'{metal}_vol_20d', 0)
            }
            
        # Add FX and macro
        snapshot['fx'] = {
            'usdcnh': latest['usdcnh'],
            'usdinr': latest['usdinr'],
            'dxy': latest['dxy']
        }
        
        snapshot['macro'] = {
            'china_pmi': latest['china_pmi'],
            'date': latest['date']
        }
        
        return snapshot
    
    def calculate_correlations(self, window=90):
        """
        Calculate correlation matrix
        """
        recent_data = self.df.tail(window)
        
        metals = ['copper', 'aluminum', 'gold']
        factors = ['dxy', 'china_pmi']
        
        corr_matrix = recent_data[metals + factors].corr()
        
        return corr_matrix
    
    def generate_commentary(self):
        """
        Auto-generate market commentary based on price moves
        """
        snapshot = self.get_latest_snapshot()
        
        # Identify best and worst performers
        metals_performance = {k: v['1d_return'] for k, v in snapshot.items() 
                             if k in ['copper', 'aluminum', 'zinc', 'gold', 'silver']}
        
        best_performer = max(metals_performance, key=metals_performance.get)
        worst_performer = min(metals_performance, key=metals_performance.get)
        
        # Build commentary
        commentary = []
        
        # Opening line - best performer
        best_ret = metals_performance[best_performer]
        verb = "advanced" if best_ret > 0 else "declined"
        
        copper_comment = f"{best_performer.capitalize()} {verb} {abs(best_ret):.1f}%"
        
        # Add drivers
        dxy_change = ((snapshot['fx']['dxy'] - self.df.iloc[-2]['dxy']) / 
                     self.df.iloc[-2]['dxy'] * 100)
        dxy_dir = "weaker" if dxy_change < 0 else "stronger"
        
        pmi = snapshot['macro']['china_pmi']
        pmi_comment = "improving" if pmi > 50 else "contracting"
        
        commentary.append(
            f"{copper_comment} driven by {dxy_dir} USD ({dxy_change:+.2f}%) "
            f"and {pmi_comment} China PMI at {pmi:.1f}."
        )
        
        # Worst performer
        worst_ret = metals_performance[worst_performer]
        commentary.append(
            f"{worst_performer.capitalize()} underperformed with {worst_ret:+.1f}% "
            f"amid profit-taking and technical resistance."
        )
        
        # Precious metals
        gold_ret = metals_performance['gold']
        if abs(gold_ret) > 0.5:
            gold_dir = "supported" if gold_ret > 0 else "pressured"
            commentary.append(
                f"Gold {gold_dir} as safe-haven demand "
                f"{'increased' if gold_ret > 0 else 'waned'} amid rate expectations."
            )
        
        # APAC focus
        commentary.append(
            f"APAC markets remain focused on China stimulus measures "
            f"(USD/CNH: {snapshot['fx']['usdcnh']:.4f}) and infrastructure outlook."
        )
        
        return " ".join(commentary)
    
    def generate_pdf_report(self, output_file='daily_market_report.pdf'):
        """
        Generate professional PDF report
        """
        doc = SimpleDocTemplate(output_file, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=30,
            alignment=1  # Center
        )
        
        story.append(Paragraph("METALS MARKET DAILY", title_style))
        story.append(Paragraph(
            f"Market Intelligence Report • {datetime.now().strftime('%B %d, %Y')}",
            styles['Normal']
        ))
        story.append(Spacer(1, 0.3*inch))
        
        # Market Commentary
        story.append(Paragraph("MARKET COMMENTARY", styles['Heading2']))
        commentary = self.generate_commentary()
        story.append(Paragraph(commentary, styles['BodyText']))
        story.append(Spacer(1, 0.2*inch))
        
        # Quantitative Snapshot
        story.append(Paragraph("QUANTITATIVE SNAPSHOT", styles['Heading2']))
        snapshot = self.get_latest_snapshot()
        
        # Create table
        table_data = [['Metal', 'Spot', '1D %', '1W %', '1M %', 'Vol (20D)']]
        
        for metal in ['copper', 'aluminum', 'zinc', 'gold', 'silver']:
            data = snapshot[metal]
            table_data.append([
                metal.capitalize(),
                f"${data['spot']:.2f}",
                f"{data['1d_return']:+.2f}%",
                f"{data['1w_return']:+.2f}%",
                f"{data['1m_return']:+.2f}%",
                f"{data['volatility']:.1f}%"
            ])
        
        table = Table(table_data, colWidths=[1.2*inch, 1*inch, 0.8*inch, 0.8*inch, 0.8*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
        ]))
        
        story.append(table)
        story.append(Spacer(1, 0.3*inch))
        
        # FX Impact
        story.append(Paragraph("FX & MACRO", styles['Heading2']))
        fx_text = (
            f"<b>USD/CNH:</b> {snapshot['fx']['usdcnh']:.4f} | "
            f"<b>USD/INR:</b> {snapshot['fx']['usdinr']:.2f} | "
            f"<b>DXY:</b> {snapshot['fx']['dxy']:.2f}<br/>"
            f"<b>China PMI:</b> {snapshot['macro']['china_pmi']:.1f}"
        )
        story.append(Paragraph(fx_text, styles['BodyText']))
        story.append(Spacer(1, 0.2*inch))
        
        # Correlation insights
        story.append(Paragraph("KEY CORRELATIONS (90D)", styles['Heading2']))
        corr = self.calculate_correlations()
        
        corr_text = (
            f"Copper-USD: {corr.loc['copper', 'dxy']:.2f} | "
            f"Copper-PMI: {corr.loc['copper', 'china_pmi']:.2f} | "
            f"Gold-USD: {corr.loc['gold', 'dxy']:.2f}"
        )
        story.append(Paragraph(corr_text, styles['Normal']))
        
        # Footer
        story.append(Spacer(1, 0.5*inch))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.grey,
            alignment=1
        )
        story.append(Paragraph(
            "For institutional use only • Not investment advice • "
            "Past performance does not guarantee future results",
            footer_style
        ))
        
        # Build PDF
        doc.build(story)
        print(f"✓ Generated PDF report: {output_file}")


# Example usage
if __name__ == "__main__":
    engine = MarketCommentaryEngine()
    
    # Get snapshot
    snapshot = engine.get_latest_snapshot()
    print("\n" + "="*60)
    print("DAILY MARKET SNAPSHOT")
    print("="*60)
    for metal, data in snapshot.items():
        if metal not in ['fx', 'macro']:
            print(f"\n{metal.upper()}")
            print(f"  Spot: ${data['spot']:.2f}")
            print(f"  1D: {data['1d_return']:+.2f}%")
            print(f"  1W: {data['1w_return']:+.2f}%")
            print(f"  Vol: {data['volatility']:.1f}%")
    
    # Generate commentary
    print("\n" + "="*60)
    print("MARKET COMMENTARY")
    print("="*60)
    print(engine.generate_commentary())
    
    # Generate PDF
    engine.generate_pdf_report()