import { useState, useEffect, useCallback } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { MainPage } from './components/MainPage';
import { AdminDashboard } from './components/AdminDashboard';
import { FlyerCreator } from './components/FlyerCreator';
import { PreviewDisplay } from './components/PreviewDisplay';
import { INITIAL_STATE, AppState, RSVP } from './lib/constants';
import { saveAppState, loadAppState, clearAllStorage } from './lib/storage-utils';
import { supabase } from './lib/supabase';
import './LuxuryStyles.css';

function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'main' | 'admin' | 'flyer' | 'preview'>('main');

  // Unified state mapper for DB response
  const mapDbToState = useCallback((dbData: any, rsvps: RSVP[] = []): Partial<AppState> => {
    if (!dbData) return {};
    return {
      introImage: dbData.intro_image,
      heroImage: dbData.hero_image,
      galleryImages: dbData.gallery_images,
      musicUrl: dbData.music_url,
      celebrantNames: dbData.celebrant_names,
      milestone: dbData.milestone,
      eventDate: dbData.event_date,
      eventTime: dbData.event_time,
      venue: dbData.venue,
      message: dbData.message,
      rsvpPhone: dbData.rsvp_phone,
      introLabel: dbData.intro_label,
      introTitle: dbData.intro_title,
      enterButton: dbData.enter_button,
      heroLabel: dbData.hero_label,
      heroTitleFirst: dbData.hero_title_first,
      heroTitleSecond: dbData.hero_title_second,
      heroConnector: dbData.hero_connector,
      heroSubtitle: dbData.hero_subtitle,
      scrollHint: dbData.scroll_hint,
      countdownLabel: dbData.countdown_label,
      galleryTitle: dbData.gallery_title,
      rsvpLabel: dbData.rsvp_label,
      rsvpTitle: dbData.rsvp_title,
      rsvpButton: dbData.rsvp_button,
      flyerButton: dbData.flyer_button,
      adminButton: dbData.admin_button,
      footerText: dbData.footer_text,
      configVersion: dbData.config_version,
      rsvps,
    };
  }, []);

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    document.title = "Save the Date \u2013 Adisa Celebration";
    
    const init = async () => {
      try {
        const saved = await loadAppState();
        if (saved) {
          setState({ ...INITIAL_STATE, ...saved });
        }
      } catch (e) {
        console.error('Initialization error:', e);
        toast.error('Real-time connection failed. Using local cache.');
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Subscribe to Realtime changes for app_config
    const configChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_config',
          filter: "id=eq.global"
        },
        (payload) => {
          console.log('Real-time config update received', payload.new);
          const mapped = mapDbToState(payload.new);
          setState(prev => ({ ...prev, ...mapped }));
          toast.info('Landing page content synchronized!');
        }
      )
      .subscribe();

    // Subscribe to Realtime changes for rsvps
    const rsvpChannel = supabase
      .channel('rsvp-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvps',
        },
        async () => {
          // Re-fetch all RSVPs on change to ensure consistency
          const { data } = await supabase.from('rsvps').select('*');
          if (data) {
            const newRSVPs = data.map((r: any) => ({
              id: r.id,
              name: r.name,
              contact: r.contact,
              guests: r.guests,
              message: r.message,
              timestamp: new Date(r.created_at).getTime(),
            }));
            setState(prev => ({ ...prev, rsvps: newRSVPs }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(configChannel);
      supabase.removeChannel(rsvpChannel);
    };
  }, [mapDbToState]);

  const handleUpdateState = async (newState: AppState) => {
    try {
      await saveAppState(newState);
      // Note: setState is handled by the subscription callback for immediate sync across multiple tabs,
      // but for local feedback we update it immediately.
      setState(newState);
    } catch (e: any) {
      console.error('Storage error:', e);
      toast.error('Failed to sync changes. Please check your connection.');
    }
  };

  const handleReset = async () => {
    try {
      await clearAllStorage();
      setState(INITIAL_STATE);
      toast.success('Site has been reset to default version.');
      setView('main');
    } catch (e) {
      toast.error('Failed to reset site.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-[#d4af37]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div>
          <p className="font-serif italic animate-pulse">Syncing real-time experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-[#f8fafc] font-sans selection:bg-[#d4af37]/30">
      <Toaster position="top-center" richColors />

      {view === 'main' && (
        <MainPage
          state={state}
          onUpdate={handleUpdateState}
          onAdminClick={() => setView('admin')}
          onFlyerClick={() => setView('flyer')}
        />
      )}

      {view === 'admin' && (
        <AdminDashboard
          state={state}
          onUpdate={handleUpdateState}
          onReset={handleReset}
          onClose={() => setView('main')}
          onOpenPreview={() => setView('preview')}
        />
      )}

      {view === 'flyer' && (
        <FlyerCreator
          state={state}
          onClose={() => setView('main')}
        />
      )}

      {view === 'preview' && (
        <PreviewDisplay
          onClose={() => setView('admin')}
        />
      )}
    </div>
  );
}

export default App;