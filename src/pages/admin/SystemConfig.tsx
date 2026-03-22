import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  ArrowLeft,
  Shield,
  Bell,
  Mail,
  Database,
  Cloud,
  Key,
  Globe,
  Clock,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export function SystemConfig() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">System Configuration</h1>
          <p className="text-muted-foreground">Manage global system settings and preferences</p>
        </div>
        <Button variant="gradient">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" defaultValue="PEC" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="support-email">Support Email</Label>
              <Input id="support-email" type="email" defaultValue="support@PEC.edu" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select defaultValue="asia-kolkata">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="america-new_york">America/New_York (EST)</SelectItem>
                  <SelectItem value="europe-london">Europe/London (GMT)</SelectItem>
                  <SelectItem value="asia-singapore">Asia/Singapore (SGT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-format">Date Format</Label>
              <Select defaultValue="dd-mm-yyyy">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Security Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Session Timeout</p>
                <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Password Policy</p>
                <p className="text-sm text-muted-foreground">Minimum password requirements</p>
              </div>
              <Select defaultValue="strong">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (6+)</SelectItem>
                  <SelectItem value="medium">Medium (8+)</SelectItem>
                  <SelectItem value="strong">Strong (12+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Login Attempts</p>
                <p className="text-sm text-muted-foreground">Max failed attempts before lockout</p>
              </div>
              <Input type="number" defaultValue="5" className="w-20" />
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send system alerts via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">SMS Alerts</p>
                <p className="text-sm text-muted-foreground">Critical alerts via SMS</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Slack Integration</p>
                <p className="text-sm text-muted-foreground">Post alerts to Slack channel</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Daily Digest</p>
                <p className="text-sm text-muted-foreground">Send daily activity summary</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </motion.div>

        {/* Email Configuration */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Email Configuration</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" defaultValue="smtp.PEC.edu" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" defaultValue="587" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="smtp-encryption">Encryption</Label>
                <Select defaultValue="tls">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="from-email">From Email</Label>
              <Input id="from-email" defaultValue="noreply@PEC.edu" className="mt-1" />
            </div>
          </div>
        </motion.div>

        {/* Database Settings */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Database</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Auto Backup</p>
                <p className="text-sm text-muted-foreground">Automatic daily backups</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Backup Retention</p>
                <p className="text-sm text-muted-foreground">Days to keep backups</p>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Last Backup</p>
              <p className="font-medium text-foreground">Today at 03:00 AM IST</p>
              <p className="text-xs text-muted-foreground mt-1">Size: 245 GB</p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Backup Now
            </Button>
          </div>
        </motion.div>

        {/* API Settings */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">API Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">API Access</p>
                <p className="text-sm text-muted-foreground">Enable external API access</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <Label htmlFor="rate-limit">Rate Limit (requests/min)</Label>
              <Input id="rate-limit" type="number" defaultValue="1000" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="api-version">API Version</Label>
              <Select defaultValue="v2">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">v1 (Legacy)</SelectItem>
                  <SelectItem value="v2">v2 (Current)</SelectItem>
                  <SelectItem value="v3">v3 (Beta)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Regenerate API Keys
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SystemConfig;
