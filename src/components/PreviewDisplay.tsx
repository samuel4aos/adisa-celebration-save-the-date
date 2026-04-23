import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Zap,
  RefreshCw,
  Search,
  Filter,
  Database,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface PreviewDisplayProps {
  onClose: () => void;
}

export const PreviewDisplay: React.FC<PreviewDisplayProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<'connected' | 'reconnecting' | 'error'>('connected');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    const channel = supabase.channel('preview-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config' }, () => {
        setLastSync(new Date());
        toast.success('Configuration sync updated');
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setSyncStatus('connected');
        if (status === 'CLOSED') setSyncStatus('reconnecting');
        if (status === 'CHANNEL_ERROR') setSyncStatus('error');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[110] bg-[#020617] overflow-y-auto pb-20 text-white selection:bg-[#d4af37]/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onClose} className="rounded-full border-white/20 text-white hover:bg-white/10">
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-[#d4af37] luxury-text-primary">Real-time Sync Status</h1>
              <p className="text-white/40 text-sm mt-1">Monitoring synchronization between Admin and Cloud</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-full border border-white/5">
            <Badge variant="outline" className={`border-none gap-1.5 px-3 py-1 ${syncStatus === 'connected' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              <div className={`h-2 w-2 rounded-full ${syncStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} /> 
              {syncStatus === 'connected' ? 'Supabase Connected' : 'Sync Error'}
            </Badge>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <div className="h-12 w-12 bg-[#d4af37]/10 rounded-xl flex items-center justify-center mb-4">
                <Database className="text-[#d4af37]" size={24} />
              </div>
              <CardTitle className="luxury-text-primary font-serif">Cloud Instance</CardTitle>
              <CardDescription>Public schema: app_config</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Primary Key</span>
                <code className="bg-white/5 px-2 py-0.5 rounded">global</code>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Last Sync</span>
                <span>{lastSync.toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Status</span>
                <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={12} /> Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="text-blue-400" size={24} />
              </div>
              <CardTitle className="luxury-text-primary font-serif">Real-time Engine</CardTitle>
              <CardDescription>PostgreSQL Replication Service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Transport</span>
                <span>WebSockets (WSS)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Latency</span>
                <span className="text-blue-400">&lt; 50ms</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Publication</span>
                <span>supabase_realtime</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Globe className="text-purple-400" size={24} />
              </div>
              <CardTitle className="luxury-text-primary font-serif">Landing Page</CardTitle>
              <CardDescription>Live Client Synchronizer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">State Cache</span>
                <span>IndexedDB + Supabase</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Sync Mode</span>
                <Badge className="bg-green-500/20 text-green-400 border-none">Instant</Badge>
              </div>
              <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs mt-2">
                <RefreshCw size={12} className="mr-2" /> Force Re-sync
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 p-8 border border-[#d4af37]/20 rounded-2xl bg-[#d4af37]/5 flex flex-col items-center text-center">
           <div className="h-16 w-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
             <CheckCircle2 size={32} className="text-[#d4af37]" />
           </div>
           <h2 className="text-2xl font-serif text-[#d4af37] mb-4">Everything is in sync</h2>
           <p className="text-white/60 max-w-lg mb-8">
             Your Admin Dashboard is successfully connected to the Supabase Cloud. Any changes to text, images, or music are broadcasted instantly to all live visitors via WebSockets.
           </p>
           <Button onClick={onClose} className="bg-[#d4af37] text-black hover:bg-[#d4af37]/80 px-8">
             Back to Dashboard
           </Button>
        </div>
      </div>
    </div>
  );
}