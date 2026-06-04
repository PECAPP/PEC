'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const scheduleData = [
  {
    day: 'Monday',
    slots: [
      { time: '9:00 - 10:00', subject: 'Data Structures', room: 'CSE-301', faculty: 'Dr. Amit Verma', department: 'CSE' },
      { time: '10:00 - 11:00', subject: 'Digital Electronics', room: 'ECE-201', faculty: 'Dr. Priya Menon', department: 'ECE' },
      { time: '11:00 - 12:00', subject: 'Thermodynamics', room: 'ME-101', faculty: 'Dr. Kavita Rao', department: 'ME' },
    ],
  },
  {
    day: 'Tuesday',
    slots: [
      { time: '9:00 - 10:00', subject: 'Machine Learning', room: 'CSE-302', faculty: 'Dr. Rajesh Kumar', department: 'CSE' },
      { time: '10:00 - 11:00', subject: 'VLSI Design', room: 'ECE-202', faculty: 'Dr. Suresh Nair', department: 'ECE' },
      { time: '2:00 - 4:00', subject: 'Lab: Data Structures', room: 'Lab-1', faculty: 'Dr. Neha Singh', department: 'CSE' },
    ],
  },
  {
    day: 'Wednesday',
    slots: [
      { time: '9:00 - 10:00', subject: 'Artificial Intelligence', room: 'CSE-301', faculty: 'Dr. Rajesh Kumar', department: 'CSE' },
      { time: '11:00 - 12:00', subject: 'Signal Processing', room: 'ECE-203', faculty: 'Dr. Priya Menon', department: 'ECE' },
    ],
  },
];

export default function Schedule() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard?role=college_admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Class Schedule</h1>
            <p className="text-muted-foreground">Manage institution-wide class schedules</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="cse">Computer Science</SelectItem>
              <SelectItem value="ece">Electronics</SelectItem>
              <SelectItem value="me">Mechanical</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="gradient">
            <Plus className="w-4 h-4" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-6">
        {scheduleData.map((day, idx) => (
          <div key={idx} className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{day.day}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {day.slots.map((slot, sIdx) => (
                <div key={sIdx} className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{slot.time}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{slot.subject}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{slot.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>{slot.faculty}</span>
                    </div>
                  </div>
                  <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {slot.department}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
