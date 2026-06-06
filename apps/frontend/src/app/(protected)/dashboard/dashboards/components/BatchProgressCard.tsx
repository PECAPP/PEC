'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  placed: number;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function BatchProgressCard({ placed }: Props) {
  return (
    <motion.div variants={item} className="card-elevated p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Batch Progress</h2>
      <div className="space-y-4">
        <div className="text-center">
          <div className="h-[200px] w-full flex justify-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Placed', value: placed, color: '#22c55e' },
                    { name: 'Remaining', value: 1420 - placed, color: 'hsl(var(--secondary))' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="hsl(var(--secondary))" />
                </Pie>
                <Tooltip />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="currentColor">
                  <tspan x="50%" dy="-0.5em" fontSize="24" fontWeight="bold">
                    {((placed / 1420) * 100).toFixed(0)}%
                  </tspan>
                  <tspan x="50%" dy="1.5em" fontSize="12" className="fill-muted-foreground">Placed</tspan>
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{placed} / 1,420 placed</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target</span>
            <span className="font-medium">85% (1,207)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-medium text-warning">{1420 - placed} students</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
