'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: any;
  userForm: any;
  setUserForm: (form: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function UserDialog({
  open,
  onOpenChange,
  editingUser,
  userForm,
  setUserForm,
  onSubmit,
  onCancel,
}: UserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription>
            {editingUser ? 'Update user details' : 'Add a new user to the system'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input 
              value={userForm.fullName} 
              onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} 
              placeholder="John Doe" 
              className="mt-1" 
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input 
              type="email" 
              value={userForm.email} 
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} 
              placeholder="john@example.com" 
              className="mt-1" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="college_admin">College Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <Input 
                value={userForm.department} 
                onChange={(e) => setUserForm({ ...userForm, department: e.target.value })} 
                placeholder="Computer Science" 
                className="mt-1" 
              />
            </div>
          </div>
          {userForm.role === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Enrollment Number</label>
                <Input 
                  value={userForm.enrollmentNumber} 
                  onChange={(e) => setUserForm({ ...userForm, enrollmentNumber: e.target.value })} 
                  placeholder="STU2024001" 
                  className="mt-1" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Semester</label>
                <Input 
                  type="number" 
                  value={userForm.semester} 
                  onChange={(e) => setUserForm({ ...userForm, semester: parseInt(e.target.value) })} 
                  className="mt-1" 
                  min="1" 
                  max="8" 
                />
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button onClick={onSubmit} className="flex-1">
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
