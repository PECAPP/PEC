import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const feeStructure = [
  { id: '1', category: 'Tuition Fee', amount: 85000, frequency: 'Semester', department: 'All' },
  { id: '2', category: 'Hostel Fee', amount: 45000, frequency: 'Semester', department: 'All' },
  { id: '3', category: 'Library Fee', amount: 5000, frequency: 'Annual', department: 'All' },
  { id: '4', category: 'Lab Fee', amount: 8000, frequency: 'Semester', department: 'CSE, ECE' },
  { id: '5', category: 'Exam Fee', amount: 3000, frequency: 'Semester', department: 'All' },
  { id: '6', category: 'Sports Fee', amount: 2000, frequency: 'Annual', department: 'All' },
];

export function FeeSetup() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Fee Structure Updated",
      description: "Fee structure has been saved successfully.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard?role=college_admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fee Setup</h1>
            <p className="text-muted-foreground">Configure fee structure for the institution</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="gradient">
            <Plus className="w-4 h-4" />
            Add Fee Category
          </Button>
        </div>
      </div>

      {/* Current Fee Structure */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Current Fee Structure</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Frequency</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Applicable To</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeStructure.map((fee) => (
                <tr key={fee.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-4 font-medium text-foreground">{fee.category}</td>
                  <td className="py-4 px-4 text-foreground">₹{fee.amount.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {fee.frequency}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{fee.department}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Fee Category */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Add New Fee Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category Name</Label>
            <Input id="category" placeholder="e.g., Development Fee" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" placeholder="10000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semester">Semester</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicable">Applicable To</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cse">Computer Science</SelectItem>
                <SelectItem value="ece">Electronics</SelectItem>
                <SelectItem value="me">Mechanical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <Button variant="gradient" onClick={handleSave}>
            Save Fee Structure
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default FeeSetup;
