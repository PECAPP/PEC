import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Upload,
  X,
  Loader2,
  ChevronDown,
  Cloud,
  HardDrive,
  Database,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from '@/lib/cloudinaryManager';
import { processLogoImage } from '@/lib/logoProcessor';
import { doc, getDoc, setDoc, serverTimestamp } from '@/lib/dataClient';
import type { CollegeSettings as CollegeSettingsType } from '@/types';

type CollegeSettings = CollegeSettingsType;

interface Props {
  embedded?: boolean;
}

export default function CollegeSettings({ embedded }: Props) {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CollegeSettings | null>(null);

  // Form fields
  const [collegeName, setCollegeName] = useState('');
  const [collegeShortName, setCollegeShortName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [removingBackground, setRemovingBackground] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(false);
  
  // Logo display mode
  const [logoDisplayMode, setLogoDisplayMode] = useState<'logo-only' | 'text-only' | 'both'>('both');
  
  // Cloudinary settings (optional - college's own account)
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
  const [cloudinaryPreset, setCloudinaryPreset] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      router.push('/dashboard');
      return;
    }

    fetchSettings();
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (settings) {
      setCollegeName(settings.collegeName);
      setEmail(settings.email);
      setPhone(settings.phone);
      setAddress(settings.address);
      setWebsite(settings.website);
      setTagline(settings.tagline);
      setLogoUrl(settings.logoUrl);
      setCloudinaryCloudName(settings.cloudinaryCloudName || '');
      setCloudinaryPreset(settings.cloudinaryPreset || '');
      setPreviewUrl(settings.logoUrl);
    }
  }, [settings]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = doc(null as any, 'collegeSettings', 'main');
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const data = settingsSnap.data() as CollegeSettings;
        setSettings(data);
        setCollegeName(data.collegeName);
        setCollegeShortName(data.collegeShortName || '');
        setEmail(data.email);
        setPhone(data.phone);
        setAddress(data.address);
        setWebsite(data.website);
        setTagline(data.tagline);
        setLogoUrl(data.logoUrl);
        setLogoDisplayMode(data.logoDisplayMode || 'both');
        setCloudinaryCloudName(data.cloudinaryCloudName || '');
        setCloudinaryPreset(data.cloudinaryPreset || '');
      } else {
        setSettings(null);
      }
    } catch (error) {
      console.error('Error fetching college settings:', error);
      toast.error('Failed to load college settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    setLogoFile(file);
    setRemoveBackground(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleRemoveBackground = async () => {
    if (!logoFile) {
      toast.error('Please upload a logo first');
      return;
    }

    try {
      setRemovingBackground(true);
      toast.loading('Removing background...');
      
      const processedFile = await processLogoImage(logoFile, true);
      setLogoFile(processedFile);
      
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setRemoveBackground(true);
        toast.dismiss();
        toast.success('Background removed! Logo is ready to upload.');
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      toast.dismiss();
      console.error('Background removal error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to remove background. Make sure Remove.bg API key is configured.'
      );
    } finally {
      setRemovingBackground(false);
    }
  };

  const handleSave = async () => {
    if (!collegeName.trim()) {
      toast.error('Please enter college name');
      return;
    }

    try {
      setSaving(true);
      let finalLogoUrl = logoUrl;

      // If new logo file is selected, upload to Cloudinary
      if (logoFile) {
        try {
          toast.loading('Uploading logo to Cloudinary...');
          finalLogoUrl = await uploadToCloudinary(logoFile);
          toast.dismiss();
          toast.success('Logo uploaded successfully!');
        } catch (error) {
          toast.dismiss();
          console.error('Cloudinary upload error:', error);
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to upload to Cloudinary. Make sure your environment variables are set.'
          );
          setSaving(false);
          return;
        }
      }

      await saveSettings(finalLogoUrl);
    } catch (error) {
      console.error('Error saving college settings:', error);
      toast.error('Failed to save college settings');
      setSaving(false);
    }
  };

  const saveSettings = async (logoUrl: string) => {
    try {
      const newSettings: CollegeSettings = {
        collegeName: collegeName.trim(),
        collegeShortName: collegeShortName.trim() || '',
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        website: website.trim(),
        tagline: tagline.trim(),
        logoUrl: logoUrl,
        logoDisplayMode: logoDisplayMode,
        cloudinaryCloudName: cloudinaryCloudName.trim() || '',
        cloudinaryPreset: cloudinaryPreset.trim() || '',
        lastUpdated: serverTimestamp(),
        updatedBy: user?.email || 'unknown',
      };

      const settingsRef = doc(null as any, 'collegeSettings', 'main');
      await setDoc(settingsRef, newSettings, { merge: true });

      setSettings(newSettings);
      setLogoFile(null);
      toast.success('College settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save college settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back Button */}
      {!embedded && (
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      )}

      {/* Header */}
      {!embedded && (
        <div>
          <h1 className="text-3xl font-bold text-foreground">College Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your college branding and information
          </p>
        </div>
      )}

      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            College Logo
          </CardTitle>
          <CardDescription>
            Upload your college logo (max 5MB, recommended 200x200px)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Logo Image
              </label>
              <div 
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
                className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:bg-secondary/50 hover:border-primary/60 transition-all"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="cursor-pointer block">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">Drag & drop or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Preview
              </label>
              <div className="border rounded-lg p-4 bg-secondary/50 flex items-center justify-center h-48">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="max-h-40 max-w-40 object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">No logo uploaded</p>
                )}
              </div>
              {logoFile && (
                <div className="mt-3 space-y-2">
                  <Button
                    onClick={handleRemoveBackground}
                    disabled={removingBackground || removeBackground}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    {removingBackground && <Loader2 className="w-4 h-4 animate-spin" />}
                    {removeBackground ? '✓ Background Removed' : <><Wand2 className="w-4 h-4" /> Remove Background</>}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {removeBackground ? '✓ Ready to upload' : 'Optional: Remove plain background before upload'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Display Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Logo Display Options</CardTitle>
          <CardDescription>Choose how to display the college branding in the interface</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Logo Only Option */}
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              logoDisplayMode === 'logo-only' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}>
              <input
                type="radio"
                name="logoDisplayMode"
                value="logo-only"
                checked={logoDisplayMode === 'logo-only'}
                onChange={(e) => setLogoDisplayMode(e.target.value as 'logo-only' | 'text-only' | 'both')}
                className="mr-3"
              />
              <div>
                <p className="font-medium text-foreground">Logo Only</p>
                <p className="text-xs text-muted-foreground">Show college logo without text</p>
                {logoUrl && (
                  <img src={logoUrl} alt="Preview" className="w-12 h-12 mt-2 object-contain" />
                )}
              </div>
            </label>

            {/* Text Only Option */}
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              logoDisplayMode === 'text-only' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}>
              <input
                type="radio"
                name="logoDisplayMode"
                value="text-only"
                checked={logoDisplayMode === 'text-only'}
                onChange={(e) => setLogoDisplayMode(e.target.value as 'logo-only' | 'text-only' | 'both')}
                className="mr-3"
              />
              <div>
                <p className="font-medium text-foreground">Text Only</p>
                <p className="text-xs text-muted-foreground">Show college short name only</p>
                <p className="text-sm font-semibold mt-2">{collegeShortName || 'College'}</p>
              </div>
            </label>

            {/* Both Option */}
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              logoDisplayMode === 'both' 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}>
              <input
                type="radio"
                name="logoDisplayMode"
                value="both"
                checked={logoDisplayMode === 'both'}
                onChange={(e) => setLogoDisplayMode(e.target.value as 'logo-only' | 'text-only' | 'both')}
                className="mr-3"
              />
              <div>
                <p className="font-medium text-foreground">Logo + Text</p>
                <p className="text-xs text-muted-foreground">Show both logo and text</p>
                <div className="flex items-center gap-2 mt-2">
                  {logoUrl && (
                    <img src={logoUrl} alt="Preview" className="w-6 h-6 object-contain" />
                  )}
                  <p className="text-sm font-semibold">{collegeShortName || 'College'}</p>
                </div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>College name and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              College Name *
            </label>
            <Input
              placeholder="Your College Name"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              College Short Name (Optional)
            </label>
            <Input
              placeholder="e.g., IITD, DU, etc. (used in headers/badges)"
              value={collegeShortName}
              onChange={(e) => setCollegeShortName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Displayed in places where space is limited (2-6 characters recommended)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Tagline / Motto
            </label>
            <Input
              placeholder="Excellence in Education"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <Input
                type="email"
                placeholder="admin@college.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone
              </label>
              <Input
                placeholder="+91-XXXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Address
            </label>
            <Textarea
              placeholder="Street, City, State, Pin Code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Website
            </label>
            <Input
              placeholder="https://college.edu"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Logo and college name will redirect to this link (if provided)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding Colors */}
      {/* Info Box */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            ℹ️ <strong>Note:</strong> These settings will be displayed across the PEC platform including invoices, 
            certificates, and public-facing pages. Keep your information up-to-date.
          </p>
        </CardContent>
      </Card>

      {/* Cloudinary Settings (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Cloudinary Settings (Optional)
          </CardTitle>
          <CardDescription>Use your own Cloudinary account to store college logo privately</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Leave blank to use default ({} as any). Or enter your own Cloudinary credentials to keep logos on your account.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Cloud Name
              </label>
              <Input
                placeholder="e.g., dxtvdf6x"
                value={cloudinaryCloudName}
                onChange={(e) => setCloudinaryCloudName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Get from Cloudinary Dashboard</p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Upload Preset
              </label>
              <Input
                placeholder="e.g., unsigned_preset"
                value={cloudinaryPreset}
                onChange={(e) => setCloudinaryPreset(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">Unsigned preset from Cloudinary</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </Button>
        {!embedded && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}
