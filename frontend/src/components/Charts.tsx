'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

const CATEGORY_COLORS = [
  '#0284c7', // Sky blue - Water Supply
  '#f59e0b', // Amber - Electricity
  '#64748b', // Slate - Roads
  '#10b981', // Emerald - Garbage
  '#06b6d4', // Cyan - Drainage
  '#8b5cf6', // Purple - Street Lights
  '#ec4899', // Pink - Sewage
  '#f97316', // Orange - Public Transport
];

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export const CategoryDonutChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="total"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any, name: any, item: any) => [
              `${value} complaints (${item.payload.resolution_rate || 0}% resolved)`,
              name,
            ]}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PriorityDistributionChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="priority" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            formatter={(val: any, name: any, item: any) => [
              `${val} complaints (${item.payload.percentage || 0}%) • Avg Severity: ${item.payload.avg_severity || 0}/10`,
              'Complaints',
            ]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PRIORITY_COLORS[entry.priority as keyof typeof PRIORITY_COLORS] || '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ResolutionTrendChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
          <Area
            type="monotone"
            dataKey="total"
            name="कुल शिकायतें (Total)"
            stroke="#0284c7"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
          <Area
            type="monotone"
            dataKey="closed"
            name="हल की गई (Resolved)"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorClosed)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DepartmentResolutionDaysChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit=" days" />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 11, fill: '#334155' }}
            width={90}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            formatter={(val: any) => [`${val} days average`, 'Resolution Time']}
          />
          <Bar dataKey="avg_days" fill="#0284c7" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ModelComparisonChart: React.FC<{ data: any[] }> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: item.model,
    Accuracy: (item.accuracy * 100).toFixed(1),
    'Macro F1': (item.f1_macro * 100).toFixed(1),
    Precision: (item.precision * 100).toFixed(1),
    Recall: (item.recall * 100).toFixed(1),
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
          <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            formatter={(val: any) => [`${val}%`, '']}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="Accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Macro F1" fill="#0284c7" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Precision" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Recall" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
