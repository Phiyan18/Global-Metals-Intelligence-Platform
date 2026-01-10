import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, Download, FileText, BarChart3, DollarSign, Globe } from 'lucide-react';

// Sample historical data generator
const generateHistoricalData = () => {
  const data = [];
  const startDate = new Date('2024-01-01');
  let copperPrice = 8500;
  let aluminumPrice = 2300;
  let zincPrice = 2500;
  let goldPrice = 2050;
  let silverPrice = 24;
  let dxy = 103;
  let usdcnh = 7.15;
  let usdinr = 83.2;
  let pmi = 50.5;
  
  for (let i = 0; i < 250; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    copperPrice += (Math.random() - 0.48) * 150;
    aluminumPrice += (Math.random() - 0.48) * 40;
    zincPrice += (Math.random() - 0.48) * 50;
    goldPrice += (Math.random() - 0.48) * 30;
    silverPrice += (Math.random() - 0.48) * 0.5;
    dxy += (Math.random() - 0.5) * 0.8;
    usdcnh += (Math.random() - 0.5) * 0.05;
    usdinr += (Math.random() - 0.5) * 0.3;
    
    if (i % 20 === 0) pmi += (Math.random() - 0.5) * 2;
    
    data.push({
      date: date.toISOString().split('T')[0],
      copper: Math.max(7000, Math.min(10000, copperPrice)),
      aluminum: Math.max(2000, Math.min(2800, aluminumPrice)),
      zinc: Math.max(2200, Math.min(3000, zincPrice)),
      gold: Math.max(1900, Math.min(2200, goldPrice)),
      silver: Math.max(20, Math.min(28, silverPrice)),
      dxy: Math.max(100, Math.min(106, dxy)),
      usdcnh: Math.max(7.0, Math.min(7.3, usdcnh)),
      usdinr: Math.max(82, Math.min(85, usdinr)),
      pmi: Math.max(48, Math.min(53, pmi)),
      volume: Math.floor(Math.random() * 50000) + 20000
    });
  }
  
  return data;
};

const MetalsPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMetal, setSelectedMetal] = useState('copper');
  const [timeframe, setTimeframe] = useState('1M');
  const [trades, setTrades] = useState([
    {
      id: 'TRD001',
      type: 'Directional',
      position: 'Long Copper',
      entry: 8650,
      target: 9200,
      stop: 8400,
      status: 'Proposed',
      rationale: 'Weaker USD + China PMI recovery',
      notional: 1000000,
      counterparty: 'Client A - China',
      date: '2026-01-10'
    },
    {
      id: 'TRD002',
      type: 'Spread',
      position: 'Long Cu / Short Al',
      entry: 3.76,
      target: 4.0,
      stop: 3.60,
      status: 'Executed',
      rationale: 'Infrastructure theme favors copper',
      notional: 500000,
      counterparty: 'Client B - India',
      date: '2026-01-08'
    }
  ]);

  const historicalData = useMemo(() => generateHistoricalData(), []);
  
  const getFilteredData = () => {
    const days = timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 250;
    return historicalData.slice(-days);
  };

  const calculateReturns = (data, metal) => {
    if (data.length < 2) return { day: 0, week: 0, month: 0 };
    const current = data[data.length - 1][metal];
    const day = data.length > 1 ? ((current - data[data.length - 2][metal]) / data[data.length - 2][metal] * 100) : 0;
    const week = data.length > 7 ? ((current - data[data.length - 7][metal]) / data[data.length - 7][metal] * 100) : 0;
    const month = data.length > 30 ? ((current - data[data.length - 30][metal]) / data[data.length - 30][metal] * 100) : 0;
    return { day, week, month };
  };

  const calculateVolatility = (data, metal) => {
    if (data.length < 20) return 0;
    const returns = [];
    for (let i = 1; i < Math.min(20, data.length); i++) {
      returns.push((data[data.length - i][metal] - data[data.length - i - 1][metal]) / data[data.length - i - 1][metal]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252) * 100;
  };

  const generateCommentary = () => {
    const latest = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];
    const copperChange = ((latest.copper - previous.copper) / previous.copper * 100).toFixed(2);
    const dxyChange = ((latest.dxy - previous.dxy) / previous.dxy * 100).toFixed(2);
    
    const copperDir = copperChange > 0 ? 'advanced' : 'declined';
    const dxyDir = dxyChange > 0 ? 'stronger' : 'weaker';
    
    return `Copper ${copperDir} ${Math.abs(copperChange)}% driven by ${dxyDir} USD (${dxyChange}%) and improving China PMI at ${latest.pmi.toFixed(1)}. Aluminum showed relative weakness due to rising inventories. Gold held steady as safe-haven demand balanced rate expectations. Silver tracked broader base metals sentiment. APAC markets remain focused on China stimulus measures and infrastructure spending outlook.`;
  };

  const metals = ['copper', 'aluminum', 'zinc', 'gold', 'silver'];
  const filteredData = getFilteredData();
  const latestData = historicalData[historicalData.length - 1];

  const MetricCard = ({ title, value, change, positive }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`text-sm flex items-center mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {positive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {change}
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Global Metals Intelligence Platform</h1>
          <p className="text-blue-200">APAC Focus • Real-time Market Intelligence • Trade Ideas</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1 p-2">
            {[
              { id: 'dashboard', label: 'Market Dashboard', icon: BarChart3 },
              { id: 'trades', label: 'Trade Ideas', icon: TrendingUp },
              { id: 'research', label: 'Research', icon: FileText },
              { id: 'pricing', label: 'Pricing Model', icon: DollarSign },
              { id: 'fx', label: 'FX Impact', icon: Globe }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Market Snapshot */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Daily Market Snapshot</h2>
              <div className="grid grid-cols-5 gap-4 mb-6">
                <MetricCard
                  title="Copper (LME)"
                  value={`$${latestData.copper.toFixed(0)}`}
                  change={`${calculateReturns(historicalData, 'copper').day.toFixed(2)}%`}
                  positive={calculateReturns(historicalData, 'copper').day > 0}
                />
                <MetricCard
                  title="Aluminum (LME)"
                  value={`$${latestData.aluminum.toFixed(0)}`}
                  change={`${calculateReturns(historicalData, 'aluminum').day.toFixed(2)}%`}
                  positive={calculateReturns(historicalData, 'aluminum').day > 0}
                />
                <MetricCard
                  title="Gold (COMEX)"
                  value={`$${latestData.gold.toFixed(0)}`}
                  change={`${calculateReturns(historicalData, 'gold').day.toFixed(2)}%`}
                  positive={calculateReturns(historicalData, 'gold').day > 0}
                />
                <MetricCard
                  title="DXY"
                  value={latestData.dxy.toFixed(2)}
                  change={`${calculateReturns(historicalData, 'dxy').day.toFixed(2)}%`}
                  positive={calculateReturns(historicalData, 'dxy').day > 0}
                />
                <MetricCard
                  title="China PMI"
                  value={latestData.pmi.toFixed(1)}
                  change={latestData.pmi > 50 ? 'Expansion' : 'Contraction'}
                  positive={latestData.pmi > 50}
                />
              </div>

              {/* Market Commentary */}
              <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-600">
                <h3 className="font-semibold mb-2 text-blue-900">Market Colour</h3>
                <p className="text-gray-700 leading-relaxed">{generateCommentary()}</p>
              </div>
            </div>

            {/* Price Charts */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Price Performance</h2>
                <div className="flex space-x-2">
                  {['1W', '1M', '3M', 'YTD'].map(tf => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 rounded text-sm ${
                        timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="copper" stroke="#f97316" name="Copper" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="aluminum" stroke="#3b82f6" name="Aluminum" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="gold" stroke="#eab308" name="Gold" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Table */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Returns & Volatility Analysis</h2>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Metal</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Spot</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">1D</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">1W</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">1M</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Vol (20D)</th>
                  </tr>
                </thead>
                <tbody>
                  {metals.map((metal, idx) => {
                    const returns = calculateReturns(historicalData, metal);
                    const vol = calculateVolatility(historicalData, metal);
                    return (
                      <tr key={metal} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 font-medium capitalize">{metal}</td>
                        <td className="px-4 py-3 text-right">${latestData[metal].toFixed(2)}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${returns.day > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {returns.day.toFixed(2)}%
                        </td>
                        <td className={`px-4 py-3 text-right ${returns.week > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {returns.week.toFixed(2)}%
                        </td>
                        <td className={`px-4 py-3 text-right ${returns.month > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {returns.month.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right">{vol.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trade Ideas Tab */}
        {activeTab === 'trades' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Active Trade Ideas</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Pitchbook
                </button>
              </div>

              {trades.map(trade => (
                <div key={trade.id} className="border border-gray-200 rounded-lg p-6 mb-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl font-bold text-blue-900">{trade.position}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          trade.status === 'Executed' ? 'bg-green-100 text-green-700' : 
                          trade.status === 'Proposed' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {trade.status}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {trade.type}
                        </span>
                      </div>
                      <p className="text-gray-600">{trade.rationale}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Trade ID</div>
                      <div className="font-mono font-semibold">{trade.id}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-4 bg-gray-50 p-4 rounded">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Entry</div>
                      <div className="font-semibold">{trade.entry}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Target</div>
                      <div className="font-semibold text-green-600">{trade.target}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Stop Loss</div>
                      <div className="font-semibold text-red-600">{trade.stop}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Notional</div>
                      <div className="font-semibold">${(trade.notional / 1000).toFixed(0)}k</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Client</div>
                      <div className="font-semibold text-sm">{trade.counterparty}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                      View Full Analysis
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                      Update Status
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                      Download Payoff
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Trade Template */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Standard Trade Template</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-semibold">Trade:</span> Long Copper vs Short Aluminum
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-semibold">Time Horizon:</span> 3-6 months
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="font-semibold">Rationale:</span> China infrastructure recovery theme. PMI expansion favors copper demand over aluminum. Historical spread compression suggests mean reversion opportunity.
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-semibold">Entry:</span> 3.76 ratio
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-semibold">Target:</span> 4.00 (+6.4%)
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-semibold">Stop:</span> 3.60 (-4.3%)
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                  <span className="font-semibold text-red-900">Key Risks:</span> Unexpected China slowdown, aluminum supply disruptions, USD strength, rate hike acceleration
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Research Tab */}
        {activeTab === 'research' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Thematic Research Notes</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded">
                  <h3 className="font-bold text-lg mb-2">China Infrastructure Recovery Theme</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    China's PMI has shown consistent expansion over the past quarter, signaling renewed economic momentum. Infrastructure spending announcements totaling $500B+ favor base metals demand, particularly copper. Historical analysis shows copper outperforms aluminum by 8-12% during infrastructure-led recoveries.
                  </p>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">Copper Bullish</span>
                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">6M Horizon</span>
                  </div>
                </div>

                <div className="border-l-4 border-green-600 bg-green-50 p-4 rounded">
                  <h3 className="font-bold text-lg mb-2">Energy Transition & Copper Demand</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Electric vehicles and renewable energy infrastructure require 3-4x more copper than traditional alternatives. Global EV sales up 35% YoY. Solar and wind capacity additions accelerating. Structural copper deficit projected through 2027. Supply constraints from major mines support pricing.
                  </p>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Structural Bull</span>
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">Multi-year</span>
                  </div>
                </div>

                <div className="border-l-4 border-purple-600 bg-purple-50 p-4 rounded">
                  <h3 className="font-bold text-lg mb-2">USD-Metals Inverse Correlation Analysis</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Historical 90-day correlation between DXY and copper: -0.72. Fed dovish pivot probability increasing as inflation cools. Weaker USD scenario presents 8-15% upside for base metals. APAC currencies (CNH, INR) strengthening provides additional tailwind for local demand.
                  </p>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs">Macro Driver</span>
                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">High Conviction</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Correlation Matrix */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Correlation Analysis (90D)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left"></th>
                      <th className="px-3 py-2 text-center">Copper</th>
                      <th className="px-3 py-2 text-center">Aluminum</th>
                      <th className="px-3 py-2 text-center">Gold</th>
                      <th className="px-3 py-2 text-center">DXY</th>
                      <th className="px-3 py-2 text-center">PMI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Copper', 'Aluminum', 'Gold', 'DXY', 'PMI'].map((row, i) => (
                      <tr key={row} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 font-semibold">{row}</td>
                        {['1.00', '0.84', '0.45', '-0.72', '0.61'].map((val, j) => (
                          <td key={j} className={`px-3 py-2 text-center font-mono ${
                            Math.abs(parseFloat(val)) > 0.7 ? 'bg-green-100 font-semibold' :
                            Math.abs(parseFloat(val)) > 0.5 ? 'bg-yellow-50' : ''
                          }`}>
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Model Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Trade Payoff Calculator</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Trade Parameters</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Entry Price</label>
                      <input type="number" defaultValue="8650" className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Notional (USD)</label>
                      <input type="number" defaultValue="1000000" className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Target Price</label>
                      <input type="number" defaultValue="9200" className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Stop Loss</label>
                      <input type="number" defaultValue="8400" className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Scenario Analysis</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-green-50 rounded">
                      <span>Target Hit (+6.4%)</span>
                      <span className="font-bold text-green-700">+$63,584</span>
                    </div>
                    <div className="flex justify-between p-2 bg-blue-50 rounded">
                      <span>+5% Move</span>
                      <span className="font-bold text-blue-700">+$50,000</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>No Change</span>
                      <span className="font-bold text-gray-700">$0</span>
                    </div>
                    <div className="flex justify-between p-2 bg-orange-50 rounded">
                      <span>-5% Move</span>
                      <span className="font-bold text-orange-700">-$50,000</span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-50 rounded">
                      <span>Stop Hit (-2.9%)</span>
                      <span className="font-bold text-red-700">-$28,902</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-100 rounded">
                    <div className="text-sm font-semibold mb-1">Break-even</div>
                    <div className="text-lg font-bold">$8,650</div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-100 rounded">
                    <div className="text-sm font-semibold mb-1">Risk/Reward Ratio</div>
                    <div className="text-lg font-bold">2.20x</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-3">Payoff Diagram</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    {price: 8000, pnl: -75000},
                    {price: 8200, pnl: -52000},
                    {price: 8400, pnl: -28902},
                    {price: 8650, pnl: 0},
                    {price: 8900, pnl: 28902},
                    {price: 9200, pnl: 63584},
                    {price: 9500, pnl: 98267}
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="price" label={{ value: 'Copper Price', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'P&L (USD)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="pnl" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Excel-style P&L Table */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Price vs P&L Matrix</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-gray-300 px-4 py-2">Price</th>
                      <th className="border border-gray-300 px-4 py-2">% Change</th>
                      <th className="border border-gray-300 px-4 py-2">P&L ($)</th>
                      <th className="border border-gray-300 px-4 py-2">Return %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[9500, 9200, 9000, 8800, 8650, 8500, 8400, 8200, 8000].map(price => {
                      const entry = 8650;
                      const notional = 1000000;
                      const pctChange = ((price - entry) / entry * 100);
                      const pnl = (price - entry) * (notional / entry);
                      const returnPct = pnl / notional * 100;
                      const isEntry = price === entry;
                      const isTarget = price === 9200;
                      const isStop = price === 8400;
                      
                      return (
                        <tr key={price} className={
                          isTarget ? 'bg-green-100 font-semibold' :
                          isStop ? 'bg-red-100 font-semibold' :
                          isEntry ? 'bg-blue-100 font-semibold' :
                          pnl > 0 ? 'bg-green-50' : 'bg-red-50'
                        }>
                          <td className="border border-gray-300 px-4 py-2 text-center font-mono">
                            {price} {isTarget && '🎯'} {isStop && '⛔'}
                          </td>
                          <td className={`border border-gray-300 px-4 py-2 text-center ${pctChange > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {pctChange > 0 ? '+' : ''}{pctChange.toFixed(2)}%
                          </td>
                          <td className={`border border-gray-300 px-4 py-2 text-right font-semibold ${pnl > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {pnl > 0 ? '+' : ''}{pnl.toLocaleString('en-US', {maximumFractionDigits: 0})}
                          </td>
                          <td className={`border border-gray-300 px-4 py-2 text-center ${returnPct > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {returnPct > 0 ? '+' : ''}{returnPct.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FX Impact Tab */}
        {activeTab === 'fx' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4">FX Impact on APAC Clients</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                  <div className="text-sm text-red-700 mb-1">USD/CNH</div>
                  <div className="text-2xl font-bold">{latestData.usdcnh.toFixed(4)}</div>
                  <div className="text-sm text-red-600 mt-1">China Impact</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-700 mb-1">USD/INR</div>
                  <div className="text-2xl font-bold">{latestData.usdinr.toFixed(2)}</div>
                  <div className="text-sm text-blue-600 mt-1">India Impact</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-700 mb-1">DXY Index</div>
                  <div className="text-2xl font-bold">{latestData.dxy.toFixed(2)}</div>
                  <div className="text-sm text-purple-600 mt-1">USD Strength</div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-600 mb-6">
                <h3 className="font-semibold mb-2 text-yellow-900">APAC Client Consideration</h3>
                <p className="text-sm text-gray-700">
                  For Chinese clients: Copper priced at ${latestData.copper.toFixed(0)} USD translates to ¥{(latestData.copper * latestData.usdcnh).toFixed(0)} CNH per ton. A 1% CNH appreciation saves ~${(latestData.copper * 0.01).toFixed(0)} per ton. For Indian clients: Same copper costs ₹{(latestData.copper * latestData.usdinr / 1000).toFixed(2)}k INR per ton. FX hedging critical for large notional trades.
                </p>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" label={{ value: 'Copper ($)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'USD/CNH', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="copper" stroke="#f97316" strokeWidth={2} name="Copper" />
                  <Line yAxisId="right" type="monotone" dataKey="usdcnh" stroke="#ef4444" strokeWidth={2} name="USD/CNH" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* FX-Adjusted Returns */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4">FX-Adjusted Returns (Local Currency)</h2>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Client Location</th>
                    <th className="px-4 py-3 text-right">Copper USD Return</th>
                    <th className="px-4 py-3 text-right">FX Impact</th>
                    <th className="px-4 py-3 text-right">Local Return</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b">
                    <td className="px-4 py-3 font-medium">China (CNH)</td>
                    <td className="px-4 py-3 text-right text-green-600">+5.2%</td>
                    <td className="px-4 py-3 text-right text-green-600">+1.8%</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">+7.0%</td>
                  </tr>
                  <tr className="bg-gray-50 border-b">
                    <td className="px-4 py-3 font-medium">India (INR)</td>
                    <td className="px-4 py-3 text-right text-green-600">+5.2%</td>
                    <td className="px-4 py-3 text-right text-green-600">+0.9%</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">+6.1%</td>
                  </tr>
                  <tr className="bg-white border-b">
                    <td className="px-4 py-3 font-medium">USA (USD)</td>
                    <td className="px-4 py-3 text-right text-green-600">+5.2%</td>
                    <td className="px-4 py-3 text-right text-gray-500">0.0%</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700">+5.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white p-6 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            Global Metals Sales Intelligence Platform • Real-time data integration • Professional-grade analytics
          </p>
          <p className="text-xs text-gray-500 mt-2">
            For institutional use only • Not investment advice • Past performance does not guarantee future results
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetalsPlatform;