import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Loader2,
  Filter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

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

export default function PlacementReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedBatch, setSelectedBatch] = useState('all');
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    placedStudents: 0,
    placementPercentage: 0,
    totalOffers: 0,
    totalCompanies: 0,
    highestPackage: '0 LPA',
    averagePackage: '0 LPA',
    medianPackage: '0 LPA',
  });

  const [departmentData, setDepartmentData] = useState<{
    name: string;
    total: number;
    placed: number;
    percentage: number;
  }[]>([]);

  const [packageDistribution, setPackageDistribution] = useState<{
    range: string;
    count: number;
  }[]>([]);

  const [monthlyPlacements, setMonthlyPlacements] = useState<{
    month: string;
    placements: number;
    offers: number;
  }[]>([]);

  const [topCompanies, setTopCompanies] = useState<{
    name: string;
    hires: number;
    avgPackage: string;
  }[]>([]);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        // Mock data for demonstration
        setStats({
          totalStudents: 450,
          placedStudents: 387,
          placementPercentage: 86,
          totalOffers: 412,
          totalCompanies: 65,
          highestPackage: '45 LPA',
          averagePackage: '12.5 LPA',
          medianPackage: '10 LPA',
        });

        setDepartmentData([
          { name: 'Computer Science', total: 120, placed: 112, percentage: 93 },
          { name: 'Electronics', total: 90, placed: 78, percentage: 87 },
          { name: 'Mechanical', total: 85, placed: 72, percentage: 85 },
          { name: 'Civil', total: 80, placed: 65, percentage: 81 },
          { name: 'Electrical', total: 75, placed: 60, percentage: 80 },
        ]);

        setPackageDistribution([
          { range: '<5 LPA', count: 45 },
          { range: '5-10 LPA', count: 156 },
          { range: '10-15 LPA', count: 98 },
          { range: '15-20 LPA', count: 52 },
          { range: '20-30 LPA', count: 28 },
          { range: '>30 LPA', count: 8 },
        ]);

        setMonthlyPlacements([
          { month: 'Aug', placements: 12, offers: 15 },
          { month: 'Sep', placements: 28, offers: 35 },
          { month: 'Oct', placements: 45, offers: 52 },
          { month: 'Nov', placements: 78, offers: 88 },
          { month: 'Dec', placements: 95, offers: 110 },
          { month: 'Jan', placements: 68, offers: 72 },
          { month: 'Feb', placements: 42, offers: 45 },
        ]);

        setTopCompanies([
          { name: 'Google', hires: 12, avgPackage: '35 LPA' },
          { name: 'Microsoft', hires: 18, avgPackage: '28 LPA' },
          { name: 'Amazon', hires: 25, avgPackage: '22 LPA' },
          { name: 'TCS', hires: 45, avgPackage: '8 LPA' },
          { name: 'Infosys', hires: 38, avgPackage: '7 LPA' },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error loading report data:', error);
        setLoading(false);
      }
    };

    loadReportData();
  }, [selectedYear, selectedBatch]);

  const exportToPDF = async () => {
    const element = document.getElementById('placement-report-content');
    if (!element) return;
    
    toast.loading('Generating PDF report...', { id: 'pdf-gen' });
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Placement_Report_${selectedYear}.pdf`);
      toast.success('PDF report generated!', { id: 'pdf-gen' });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-gen' });
    }
  };

  const exportToExcel = () => {
    toast.loading('Exporting to Excel...', { id: 'excel-gen' });
    try {
      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();

      // 1. Stats Sheet
      const statsData = [{ ...stats }];
      const statsSheet = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Overview');

      // 2. Department Data
      const deptSheet = XLSX.utils.json_to_sheet(departmentData);
      XLSX.utils.book_append_sheet(workbook, deptSheet, 'Department Wise');

      // 3. Companies
      const companiesSheet = XLSX.utils.json_to_sheet(topCompanies);
      XLSX.utils.book_append_sheet(workbook, companiesSheet, 'Top Companies');
      
      XLSX.writeFile(workbook, `Placement_Report_${selectedYear}.xlsx`);
      toast.success('Excel exported successfully!', { id: 'excel-gen' });
    } catch (error) {
      console.error('Excel Export Error:', error);
      toast.error('Failed to export Excel', { id: 'excel-gen' });
    }
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
      id="placement-report-content"
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Placement Reports</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive placement statistics and analytics
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
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button onClick={exportToPDF}>
            <FileText className="w-4 h-4 mr-2" />
            PDF Report
          </Button>
        </div>
      </motion.div>

      {/* Key Stats */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Placement Rate</p>
                <p className="text-3xl font-bold text-green-500">{stats.placementPercentage}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.placedStudents} / {stats.totalStudents} students
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Offers</p>
                <p className="text-3xl font-bold text-blue-500">{stats.totalOffers}</p>
                <p className="text-xs text-muted-foreground mt-1">From {stats.totalCompanies} companies</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highest Package</p>
                <p className="text-3xl font-bold text-purple-500">{stats.highestPackage}</p>
                <p className="text-xs text-muted-foreground mt-1">Average: {stats.averagePackage}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Companies</p>
                <p className="text-3xl font-bold text-orange-500">{stats.totalCompanies}</p>
                <p className="text-xs text-muted-foreground mt-1">Visited this year</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* Department-wise Placements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Department-wise Placements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="placed" fill="hsl(var(--primary))" name="Placed" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Package Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Package Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={packageDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    nameKey="range"
                    label={({ range, percent }) => `${range} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {packageDistribution.map((entry, index) => (
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

      {/* Monthly Trend */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Monthly Placement Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyPlacements}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="placements" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="Placements"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="offers" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                    name="Offers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Companies */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Top Recruiting Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCompanies.map((company, index) => (
                <div key={company.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-muted-foreground">{company.hires} hires</p>
                  </div>
                  <Badge variant="secondary">{company.avgPackage}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
