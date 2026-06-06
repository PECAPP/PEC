'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

export function AdminAnalyticsCharts({
  totalStudents = 0,
  totalFaculty = 0,
  adminCount = 0,
}: {
  totalStudents?: number;
  totalFaculty?: number;
  adminCount?: number;
}) {
  const safeStudents = isNaN(totalStudents) ? 0 : totalStudents;
  const safeFaculty = isNaN(totalFaculty) ? 0 : totalFaculty;
  const safeAdmins = isNaN(adminCount) ? 0 : adminCount;

  const userDistributionData = [
    { name: 'Students', count: safeStudents, color: 'hsl(var(--success))' },
    { name: 'Faculty', count: safeFaculty, color: 'hsl(var(--primary))' },
    { name: 'Admins', count: safeAdmins, color: 'hsl(var(--warning))' },
  ];

  const projectedVsActualRevenueData = [
    { month: 'Jan', projected: 50000, actual: 48000 },
    { month: 'Feb', projected: 55000, actual: 52000 },
    { month: 'Mar', projected: 60000, actual: 65000 },
    { month: 'Apr', projected: 58000, actual: 56000 },
    { month: 'May', projected: 62000, actual: 68000 },
    { month: 'Jun', projected: 65000, actual: 72000 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 animate-in slide-in-from-bottom-4 duration-700">
      <div className="chart-wrapper group">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-foreground uppercase tracking-tight text-sm">User Distribution</h3>
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="hsl(var(--border)/0.5)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent)/0.05)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '4px',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              />
              <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={40}>
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-wrapper group">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-foreground uppercase tracking-tight text-sm">Growth Projection</h3>
          <BarChart3 className="w-4 h-4 text-muted-foreground opacity-30" />
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectedVsActualRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="hsl(var(--border)/0.5)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '4px',
                  boxShadow: 'var(--shadow-md)',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorActual)"
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="6 6"
                opacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

import { BarChart3 } from 'lucide-react';
