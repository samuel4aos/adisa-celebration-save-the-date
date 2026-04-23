import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  LogOut, 
  Image as ImageIcon, 
  Music, 
  Type, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  RefreshCcw,
  ChevronUp,
  ChevronDown,
  Star,
  Sparkle,
  Settings,
  AlertTriangle,
  PlayCircle,
  Users as UsersIcon,
  FileText,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppState, STORAGE_LIMIT_MB } from '@/lib/constants';
import { toast } from 'sonner';
import { compressImage } from '@/lib/image-utils';
import { getIndexedDBSizeMB, deleteRSVP as deleteRSVPFromSupabase } from '@/lib/storage-utils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

interface AdminDashboardProps {
  state: AppState;
  onUpdate: (newState: AppState) => void;
  onReset: () => Promise<void>;
  onClose: () => void;
  onOpenPreview: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, onUpdate, onReset, onClose, onOpenPreview }) => {
  const [localState, setLocalState] = useState<AppState>(state);
  const [isLogged, setIsLogged] = useState(false);
  const [password, setPassword] = useState('');
  const [storageUsage, setStorageUsage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const heroInputRef = useRef<HTMLInputElement>(null);
  const introInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateStorageUsage = async () => {
      const size = await getIndexedDBSizeMB();
      setStorageUsage(size);
    };
    updateStorageUsage();
  }, [localState]);

  useEffect(() => {
    setLocalState(state);
  }, [state]);

  const handleLogin = () => {
    if (password === 'Adisa2026') {
      setIsLogged(true);
      toast.success('Admin access granted');
    } else {
      toast.error('Invalid password');
    }
  };

  const handleChange = (key: keyof AppState, value: any) => {
    setLocalState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(localState);
      toast.success('All changes saved to Supabase');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newImages = [...localState.galleryImages];
    newImages.splice(index, 1);
    handleChange('galleryImages', newImages);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...localState.galleryImages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      handleChange('galleryImages', newImages);
    }
  };

  const setAsHero = (url: string) => {
    handleChange('heroImage', url);
    toast.success('Gallery image set as Hero background');
  };

  const setAsIntro = (url: string) => {
    handleChange('introImage', url);
    toast.success('Gallery image set as Splash background');
  };

  const deleteRSVP = async (id: string) => {
    try {
      await deleteRSVPFromSupabase(id);
      toast.success('Guest removed from list');
    } catch (e) {
      toast.error('Failed to remove guest');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'intro' | 'gallery' | 'replace' | 'music') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (type === 'music') {
      const file = files[0];
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Audio file is too large (max 20MB).');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('musicUrl', reader.result as string);
        toast.success('Background music updated');
      };
      reader.readAsDataURL(file);
      return;
    }

    if (type === 'gallery') {
      const fileArray = Array.from(files);
      
      toast.promise(
        (async () => {
          const processedImages: string[] = [];
          for (const file of fileArray) {
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
            const quality = storageUsage > 80 ? 0.6 : 0.8;
            const compressed = await compressImage(dataUrl, 1200, quality);
            processedImages.push(compressed);
          }
          handleChange('galleryImages', [...localState.galleryImages, ...processedImages]);
          return processedImages.length;
        })(),
        {
          loading: 'Optimizing and adding images...',
          success: (count) => `${count} images optimized and added`,
          error: 'Failed to process images'
        }
      );
      return;
    }

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      try {
        const compressed = await compressImage(result, 1600, 0.85);
        if (type === 'hero') {
          handleChange('heroImage', compressed);
          toast.success('Hero image updated');
        } else if (type === 'intro') {
          handleChange('introImage', compressed);
          toast.success('Splash image updated');
        }
      } catch (err) {
        toast.error('Failed to optimize image');
      }
    };
    reader.readAsDataURL(file);
  };

  const storagePercentage = Math.min((storageUsage / STORAGE_LIMIT_MB) * 100, 100);
  const isStorageCritical = storageUsage > (STORAGE_LIMIT_MB * 0.85);

  const totalGuests = localState.rsvps?.reduce((acc, curr) => acc + curr.guests, 0) || 0;

  if (!isLogged) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#020617] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-[#d4af37]/20 bg-black/40 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif text-[#d4af37]">Admin Access</CardTitle>
            <CardDescription className="text-white/60">Manage your invitation content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border-[#d4af37]/30 text-white focus:border-[#d4af37]"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={onClose} className="flex-1 text-white/60">Cancel</Button>
              <Button onClick={handleLogin} className="flex-1 bg-[#d4af37] text-black hover:bg-[#d4af37]/80">Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] overflow-y-auto pb-20 text-white">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onClose} className="rounded-full border-white/20 text-white hover:bg-white/10">
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-3xl font-serif text-[#d4af37]">Admin Dashboard</h1>
          </div>
          <div className="flex gap-3 items-center">
            <Button 
              variant="outline" 
              onClick={onOpenPreview} 
              className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black hidden sm:flex"
            >
              <Eye size={16} className="mr-2" />
              Interactive Preview
            </Button>
            <div className="hidden sm:block text-right mr-4">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className={`text-[10px] font-medium uppercase tracking-wider ${isStorageCritical ? 'text-red-400' : 'text-white/40'}`}>
                  Storage: {storageUsage.toFixed(1)}MB / {STORAGE_LIMIT_MB}MB
                </span>
              </div>
              <Progress value={storagePercentage} className="h-1 w-32 bg-white/10" />
            </div>
            <Button variant="outline" onClick={() => setIsLogged(false)} className="border-white/20 text-white">
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-[#d4af37] text-black hover:bg-[#d4af37]/80">
              {isSaving ? <RefreshCcw size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
              Save All to Cloud
            </Button>
          </div>
        </div>

        {isStorageCritical && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-200 text-sm"
          >
            <AlertTriangle size={16} className="flex-shrink-0" />
            <p>Storage is almost full. Please delete some images to free up space.</p>
          </motion.div>
        )}

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="bg-black/40 border border-[#d4af37]/20 p-1 flex flex-wrap h-auto">
            <TabsTrigger value="content" className="admin-tab-trigger flex gap-2">
              <FileText size={16} /> Text Editor
            </TabsTrigger>
            <TabsTrigger value="media" className="admin-tab-trigger flex gap-2">
              <ImageIcon size={16} /> Photo Gallery
            </TabsTrigger>
            <TabsTrigger value="audio" className="admin-tab-trigger flex gap-2">
              <Music size={16} /> Music
            </TabsTrigger>
            <TabsTrigger value="rsvps" className="admin-tab-trigger flex gap-2">
              <UsersIcon size={16} /> Guest List
            </TabsTrigger>
            <TabsTrigger value="advanced" className="admin-tab-trigger data-[state=active]:bg-red-600 data-[state=active]:text-white flex gap-2">
              <Settings size={16} /> System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-[#d4af37]/20 text-white">
                <CardHeader>
                  <CardTitle className="luxury-text-primary text-lg flex items-center gap-2"><Sparkle size={18} /> Intro & Hero Text</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] uppercase tracking-wider">Intro Label</Label>
                    <Input value={localState.introLabel} onChange={(e) => handleChange('introLabel', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] uppercase tracking-wider">Intro Title</Label>
                    <Input value={localState.introTitle} onChange={(e) => handleChange('introTitle', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] uppercase tracking-wider">Enter Button Text</Label>
                    <Input value={localState.enterButton} onChange={(e) => handleChange('enterButton', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <Label className="text-white/40 text-[10px] uppercase tracking-wider">Hero Save Date Label</Label>
                    <Input value={localState.heroLabel} onChange={(e) => handleChange('heroLabel', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">Hero Title Line 1</Label>
                      <Input value={localState.heroTitleFirst} onChange={(e) => handleChange('heroTitleFirst', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">Hero Title Line 2</Label>
                      <Input value={localState.heroTitleSecond} onChange={(e) => handleChange('heroTitleSecond', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] uppercase tracking-wider">Hero Connector</Label>
                    <Input value={localState.heroConnector} onChange={(e) => handleChange('heroConnector', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] uppercase tracking-wider">Hero Tagline</Label>
                    <Input value={localState.heroSubtitle} onChange={(e) => handleChange('heroSubtitle', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-[#d4af37]/20 text-white">
                <CardHeader>
                  <CardTitle className="luxury-text-primary text-lg flex items-center gap-2"><Type size={18} /> Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] uppercase tracking-wider">Celebrant Names</Label>
                    <Input value={localState.celebrantNames} onChange={(e) => handleChange('celebrantNames', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] uppercase tracking-wider">Milestone Badge</Label>
                    <Input value={localState.milestone} onChange={(e) => handleChange('milestone', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">Date (YYYY-MM-DD)</Label>
                      <Input type="date" value={localState.eventDate} onChange={(e) => handleChange('eventDate', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">Time</Label>
                      <Input type="time" value={localState.eventTime} onChange={(e) => handleChange('eventTime', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] uppercase tracking-wider">Venue Address</Label>
                    <Input value={localState.venue} onChange={(e) => handleChange('venue', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/40 text-[10px] uppercase tracking-wider">Invitation Message</Label>
                    <Textarea value={localState.message} onChange={(e) => handleChange('message', e.target.value)} className="bg-black/40 border-white/10 text-white min-h-[80px]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-[#d4af37]/20 text-white md:col-span-2">
                <CardHeader>
                  <CardTitle className="luxury-text-primary text-lg">RSVP & UI Labels</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">RSVP Section Title</Label>
                      <Input value={localState.rsvpTitle} onChange={(e) => handleChange('rsvpTitle', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">RSVP Submit Button</Label>
                      <Input value={localState.rsvpButton} onChange={(e) => handleChange('rsvpButton', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">RSVP Details Label</Label>
                      <Input value={localState.rsvpLabel} onChange={(e) => handleChange('rsvpLabel', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">RSVP Phone Info</Label>
                      <Input value={localState.rsvpPhone} onChange={(e) => handleChange('rsvpPhone', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">Scroll Hint Text</Label>
                      <Input value={localState.scrollHint} onChange={(e) => handleChange('scrollHint', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">Countdown Label</Label>
                      <Input value={localState.countdownLabel} onChange={(e) => handleChange('countdownLabel', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">Gallery Title</Label>
                      <Input value={localState.galleryTitle} onChange={(e) => handleChange('galleryTitle', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">Flyer Button Text</Label>
                      <Input value={localState.flyerButton} onChange={(e) => handleChange('flyerButton', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/40 text-[10px] uppercase tracking-wider">Footer Credit Text</Label>
                      <Input value={localState.footerText} onChange={(e) => handleChange('footerText', e.target.value)} className="bg-black/40 border-white/10 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card className="bg-black/40 border-[#d4af37]/20 text-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="luxury-text-primary text-lg flex items-center gap-2"><ImageIcon size={18} /> Media Library</CardTitle>
                  <CardDescription className="text-white/40">Upload and manage your celebration photos</CardDescription>
                </div>
                <Button size="sm" onClick={() => galleryInputRef.current?.click()} className="bg-[#d4af37] text-black hover:bg-[#d4af37]/80">
                  <Plus size={16} className="mr-2" /> Add Photos
                </Button>
                <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleFileUpload(e, 'gallery')} />
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-white/40">Hero Background Image</Label>
                    <div className="aspect-video rounded-xl overflow-hidden border border-[#d4af37]/20 relative group">
                      <img src={localState.heroImage} className="w-full h-full object-cover" alt="Hero" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" onClick={() => heroInputRef.current?.click()} className="bg-[#d4af37] text-black">Replace Image</Button>
                      </div>
                      <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'hero')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-white/40">Splash Screen Background</Label>
                    <div className="aspect-video rounded-xl overflow-hidden border border-[#d4af37]/20 relative group">
                      <img src={localState.introImage} className="w-full h-full object-cover" alt="Splash" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" onClick={() => introInputRef.current?.click()} className="bg-white text-black">Replace Image</Button>
                      </div>
                      <input type="file" ref={introInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'intro')} />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-xs uppercase text-white/40">Photo Gallery ({localState.galleryImages?.length || 0})</Label>
                    <p className="text-[10px] text-white/30 italic">Tip: Use stars to set as background</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {localState.galleryImages?.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-[#d4af37] hover:bg-[#d4af37]/20" onClick={() => setAsHero(img)} title="Set as Hero Background"><Star size={14} fill={img === localState.heroImage ? 'currentColor' : 'none'} /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setAsIntro(img)} title="Set as Splash Background"><Sparkle size={14} fill={img === localState.introImage ? 'currentColor' : 'none'} /></Button>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => moveImage(idx, 'up')} disabled={idx === 0} className="h-8 w-8 text-white hover:bg-white/10 disabled:opacity-20"><ChevronUp size={16} /></Button>
                            <Button size="icon" variant="ghost" onClick={() => moveImage(idx, 'down')} disabled={idx === (localState.galleryImages?.length || 0) - 1} className="h-8 w-8 text-white hover:bg-white/10 disabled:opacity-20"><ChevronDown size={16} /></Button>
                            <Button size="icon" variant="ghost" onClick={() => removeGalleryImage(idx)} className="h-8 w-8 text-red-400 hover:bg-red-500/20 hover:text-red-300"><Trash2 size={16} /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <Card className="bg-black/40 border-[#d4af37]/20 text-white">
              <CardHeader>
                <CardTitle className="luxury-text-primary text-lg flex items-center gap-2"><Music size={18} /> Background Music</CardTitle>
                <CardDescription className="text-white/40">Choose the soundtrack for your invitation experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
                  <div className="h-16 w-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mb-4">
                    <Music className="text-[#d4af37]" size={32} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Upload Custom Audio</h3>
                  <p className="text-white/40 text-sm mb-6 max-w-xs text-center">Select an MP3 file (max 20MB) to play automatically when guests enter the experience.</p>
                  <Button onClick={() => musicInputRef.current?.click()} className="bg-[#d4af37] text-black hover:bg-[#d4af37]/80">
                    Select Audio File
                  </Button>
                  <input type="file" ref={musicInputRef} className="hidden" accept="audio/mp3,audio/mpeg,audio/wav" onChange={(e) => handleFileUpload(e, 'music')} />
                </div>

                <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <PlayCircle className="text-green-500" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Currently Loaded</p>
                      <p className="text-xs text-white/40 truncate max-w-[200px]">{localState.musicUrl?.startsWith('data:') ? 'Custom Uploaded Music' : 'Default Music Path'}</p>
                    </div>
                  </div>
                  <audio controls src={localState.musicUrl} className="h-8 w-48" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rsvps" className="space-y-6">
            <Card className="bg-black/40 border-[#d4af37]/20 text-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="luxury-text-primary text-lg flex items-center gap-2"><UsersIcon size={18} /> Guest List (Attendance)</CardTitle>
                  <CardDescription className="text-white/40">View everyone who has preserved their attendance</CardDescription>
                </div>
                <Badge variant="outline" className="border-[#d4af37] text-[#d4af37] text-sm">
                  {totalGuests} Total Guests
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-3 font-medium text-white/60 text-xs uppercase tracking-wider">Name</th>
                        <th className="pb-3 font-medium text-white/60 text-xs uppercase tracking-wider">Contact</th>
                        <th className="pb-3 font-medium text-white/60 text-xs uppercase tracking-wider">Guests</th>
                        <th className="pb-3 font-medium text-white/60 text-xs uppercase tracking-wider">Message</th>
                        <th className="pb-3 font-medium text-white/60 text-xs uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(!localState.rsvps || localState.rsvps.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-white/30 italic">No attendance records yet</td>
                        </tr>
                      ) : (
                        localState.rsvps.map((rsvp) => (
                          <tr key={rsvp.id} className="group">
                            <td className="py-4 font-serif luxury-text-primary">{rsvp.name}</td>
                            <td className="py-4 text-sm">{rsvp.contact}</td>
                            <td className="py-4 text-sm">
                                <Badge variant="secondary" className="bg-white/5 text-white">{rsvp.guests}</Badge>
                            </td>
                            <td className="py-4 text-xs text-white/60 max-w-xs truncate">{rsvp.message || '-'}</td>
                            <td className="py-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => deleteRSVP(rsvp.id)}
                                className="h-8 w-8 text-red-400 hover:bg-red-500/20"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card className="bg-black/40 border-red-500/20 text-white">
              <CardHeader>
                <CardTitle className="text-red-400 text-lg flex items-center gap-2"><Settings size={18} /> System Tools</CardTitle>
                <CardDescription className="text-white/40">Danger zone: These actions cannot be undone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full bg-red-900/40 hover:bg-red-900/60 border border-red-500/30 py-6 h-auto flex flex-col gap-1">
                      <span className="font-bold luxury-text-white">Reset Site to Factory Defaults</span>
                      <span className="text-[10px] opacity-60 uppercase tracking-tighter">Clears all photos, music, and text</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#020617] border-red-500/30 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-white/60">
                        This will permanently delete all your custom changes, uploaded images, and settings from Supabase. The site will revert to its original default version.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 border-none">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onReset} className="bg-red-600 text-white hover:bg-red-700">Yes, Reset Everything</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest luxury-text-primary mb-2">Cloud Storage Management</h4>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    All modifications are now stored in Supabase. Real-time synchronization is enabled, meaning changes made here will appear instantly on the landing page for all visitors.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}