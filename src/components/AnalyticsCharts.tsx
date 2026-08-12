import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Expense } from '../types';

interface AnalyticsChartsProps {
  expenses: Expense[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: '#0284c7', // sky-600
  Groceries: '#16a34a', // green-600
  Dining: '#f97316', // orange-500
  Fuel: '#eab308', // yellow-500
  Health: '#06b6d4', // cyan-500
  Apparel: '#8b5cf6', // purple-500
  'Home & Living': '#ec4899', // pink-500
  Utilities: '#64748b', // slate-500
  Entertainment: '#6366f1', // indigo-500
  'Office/Business': '#059669', // emerald-600
  Other: '#94a3b8',
};

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ expenses }) => {
  // Category Breakdown Data
  const categoryDataMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryDataMap[e.category] = (categoryDataMap[e.category] || 0) + e.totalAmount;
  });

  const categoryPieData = Object.keys(categoryDataMap).map((cat) => ({
    name: cat,
    value: categoryDataMap[cat],
  }));

  // Top Merchants Data
  const merchantDataMap: Record<string, number> = {};
  expenses.forEach((e) => {
    merchantDataMap[e.merchantName] = (merchantDataMap[e.merchantName] || 0) + e.totalAmount;
  });

  const topMerchantsBarData = Object.keys(merchantDataMap)
    .map((m) => ({ name: m, amount: merchantDataMap[m] }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs">
        <h2 className="text-base font-bold text-neutral-900">Visual Spending Analytics</h2>
        <p className="text-xs text-neutral-500">
          Analyze expenditure patterns across retail channels and product categories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Category Spending Distribution</h3>
            <p className="text-xs text-neutral-500">Expenses grouped by major retail categories</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={CATEGORY_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spent']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Merchant Bar Chart */}
        <div className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Top Merchant Channel Spending</h3>
            <p className="text-xs text-neutral-500">Highest volume retail vendors (₹ INR)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMerchantsBarData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Total Spent']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
