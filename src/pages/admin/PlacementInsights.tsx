import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  Building2,
  DollarSign,
  Calendar,
  Download,
  Loader2,
  Award,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function PlacementInsights() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2026');
  
  const [stats, setStats] = useState({
    placementRate: 86,
    placementRateChange: 5,
    avgPackage: '12.5 LPA',
    avgPackageChange: 15,
    totalCompanies: 65,
    companiesChange: 12,
    totalOffers: 412,
    offersChange: 8,
  });

  const [yearlyTrend, setYearlyTrend] = useState<{
    year: string;
    placed: number;
    offers: number;
    avgPackage: number;
  }[]>([]);

  const [industryData, setIndustryData] = useState<{
    name: string;
    count: number;
  }[]>([]);

  const [topPackages, setTopPackages] = useState<{
    company: string;
    package: string;
    student: string;
    department: string;
  }[]>([]);

  useEffect(() => {
    // Mock data
    setYearlyTrend([
      { year: '2022-23', placed: 320, offers: 350, avgPackage: 8.5 },
      { year: '2023-24', placed: 365, offers: 385, avgPackage: 10.2 },
      { year: '2024-25', placed: 387, offers: 412, avgPackage: 12.5 },
    ]);

    setIndustryData([
      { name: 'IT Services', count: 180 },
      { name: 'Product Companies', count: 85 },
      { name: 'Fintech', count: 45 },
      { name: 'Consulting', count: 38 },
      { name: 'Manufacturing', count: 32 },
      { name: 'Others', count: 32 },
    ]);

    setTopPackages([
      { company: 'Google', package: '45 LPA', student: 'Rahul Sharma', department: 'CS' },
      { company: 'Microsoft', package: '35 LPA', student: 'Priya Patel', department: 'CS' },
      { company: 'Amazon', package: '32 LPA', student: 'Amit Kumar', department: 'CS' },
      { company: 'Goldman Sachs', package: '28 LPA', student: 'Sneha Agarwal', department: 'CS' },
      { company: 'Uber', package: '25 LPA', student: 'Vikram Singh', department: 'EC' },
    ]);

    setLoading(false);
  }, [selectedYear]);

  const exportReport = () => {
    toast.success('Generating executive report...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Placement Insights</h1>
          <p className="text-muted-foreground mt-1">
            Executive overview of placement performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2025-26</SelectItem>
              <SelectItem value="2025">2024-25</SelectItem>
              <SelectItem value="2024">2023-24</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Placement Rate</p>
                <p className="text-3xl font-bold text-green-500">{stats.placementRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+{stats.placementRateChange}%</span>
                  <span className="text-xs text-muted-foreground">vs last year</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Package</p>
                <p className="text-3xl font-bold text-blue-500">{stats.avgPackage}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+{stats.avgPackageChange}%</span>
                  <span className="text-xs text-muted-foreground">vs last year</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Companies</p>
                <p className="text-3xl font-bold text-purple-500">{stats.totalCompanies}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+{stats.companiesChange}</span>
                  <span className="text-xs text-muted-foreground">new this year</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Offers</p>
                <p className="text-3xl font-bold text-orange-500">{stats.totalOffers}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">+{stats.offersChange}%</span>
                  <span className="text-xs text-muted-foreground">vs last year</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* Year-over-Year Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Year-over-Year Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearlyTrend}>
                  <defs>
                    <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="placed" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorPlaced)"
                    name="Placed"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="offers" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorOffers)"
                    name="Offers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Industry Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Packages */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Top Packages This Year
            </CardTitle>
            <CardDescription>Highest offers received by students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPackages.map((pkg, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                    index === 0 ? "bg-yellow-500" :
                    index === 1 ? "bg-gray-400" :
                    index === 2 ? "bg-amber-700" : "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{pkg.student}</p>
                        <p className="text-sm text-muted-foreground">{pkg.company} • {pkg.department}</p>
                      </div>
                      <Badge variant="secondary" className="text-lg font-bold">
                        {pkg.package}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
