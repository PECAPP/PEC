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
} from 'recharts';

export function AdminAnalyticsCharts({
  totalStudents,
  totalFaculty,
  adminCount,
}: {
  totalStudents: number;
  totalFaculty: number;
  adminCount: number;
}) {
  const userDistributionData = [
    { name: 'Students', count: totalStudents, color: '#22c55e' },
    { name: 'Faculty', count: totalFaculty, color: '#3b82f6' },
    { name: 'Admins', count: adminCount, color: '#f59e0b' },
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
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card-elevated p-6">
        <h3 className="font-semibold text-foreground mb-4">User Distribution</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userDistributionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent)/0.1)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-elevated p-6">
        <h3 className="font-semibold text-foreground mb-4">Projected vs Actual Revenue</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectedVsActualRevenueData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
