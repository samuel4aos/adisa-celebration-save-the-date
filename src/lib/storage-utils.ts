import { STORAGE_KEY, AppState, INITIAL_STATE } from './constants';
import { supabase } from './supabase';

const DB_NAME = 'AdisaCelebrationDB';
const DB_VERSION = 1;
const STORE_NAME = 'config';

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Persist the entire app state to Supabase
 * We use a single row in public.app_config for global settings
 */
export const saveAppState = async (state: AppState): Promise<void> => {
  try {
    // 1. Save to Supabase (Primary)
    const { error } = await supabase
      .from('app_config')
      .upsert({
        id: 'global',
        intro_image: state.introImage,
        hero_image: state.heroImage,
        gallery_images: state.galleryImages,
        music_url: state.musicUrl,
        celebrant_names: state.celebrantNames,
        milestone: state.milestone,
        event_date: state.eventDate,
        event_time: state.eventTime,
        venue: state.venue,
        message: state.message,
        rsvp_phone: state.rsvpPhone,
        intro_label: state.introLabel,
        intro_title: state.introTitle,
        enter_button: state.enterButton,
        hero_label: state.heroLabel,
        hero_title_first: state.heroTitleFirst,
        hero_title_second: state.heroTitleSecond,
        hero_connector: state.heroConnector,
        hero_subtitle: state.heroSubtitle,
        scroll_hint: state.scrollHint,
        countdown_label: state.countdownLabel,
        gallery_title: state.galleryTitle,
        rsvp_label: state.rsvpLabel,
        rsvp_title: state.rsvpTitle,
        rsvp_button: state.rsvpButton,
        flyer_button: state.flyerButton,
        admin_button: state.adminButton,
        footer_text: state.footerText,
        config_version: state.configVersion,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    // 2. Save to local IndexedDB (Cache/Fallback)
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(state, STORAGE_KEY);
  } catch (e) {
    console.error('Supabase save failed, falling back to local storage:', e);
    // Fallback to local storage logic
    const serialized = JSON.stringify(state);
    if (serialized.length < 4 * 1024 * 1024) {
      localStorage.setItem(STORAGE_KEY, serialized);
    }
    throw e;
  }
};

/**
 * Load the app state from Supabase, falling back to IndexedDB
 */
export const loadAppState = async (): Promise<AppState | null> => {
  try {
    // 1. Try loading from Supabase with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .eq('id', 'global')
      .single();

    clearTimeout(timeoutId);

    if (!error && data) {
      // Map DB fields back to AppState
      const mappedState: Partial<AppState> = {
        introImage: data.intro_image,
        heroImage: data.hero_image,
        galleryImages: data.gallery_images,
        musicUrl: data.music_url,
        celebrantNames: data.celebrant_names,
        milestone: data.milestone,
        eventDate: data.event_date,
        eventTime: data.event_time,
        venue: data.venue,
        message: data.message,
        rsvpPhone: data.rsvp_phone,
        introLabel: data.intro_label,
        introTitle: data.intro_title,
        enterButton: data.enter_button,
        heroLabel: data.hero_label,
        heroTitleFirst: data.hero_title_first,
        heroTitleSecond: data.hero_title_second,
        heroConnector: data.hero_connector,
        heroSubtitle: data.hero_subtitle,
        scrollHint: data.scroll_hint,
        countdownLabel: data.countdown_label,
        galleryTitle: data.gallery_title,
        rsvpLabel: data.rsvp_label,
        rsvpTitle: data.rsvp_title,
        rsvpButton: data.rsvp_button,
        flyerButton: data.flyer_button,
        adminButton: data.admin_button,
        footerText: data.footer_text,
        configVersion: data.config_version,
      };

      // Fetch RSVPs separately from its own table
      const { data: rsvpsData } = await supabase.from('rsvps').select('*');
      mappedState.rsvps = (rsvpsData || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        contact: r.contact,
        guests: r.guests,
        message: r.message,
        timestamp: new Date(r.created_at).getTime(),
      }));

      return { ...INITIAL_STATE, ...mappedState };
    }

    // 2. Fallback to IndexedDB
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(STORAGE_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    console.error('Supabase/IndexedDB load failed:', e);
    // Fallback to localStorage
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return null;
  }
};

export const saveRSVP = async (rsvp: any): Promise<void> => {
  const { error } = await supabase
    .from('rsvps')
    .insert({
      name: rsvp.name,
      contact: rsvp.contact,
      guests: rsvp.guests,
      message: rsvp.message
    });
  if (error) throw error;
};

export const deleteRSVP = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('rsvps')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const clearAllStorage = async (): Promise<void> => {
  // For site reset, we clear the global config in Supabase too
  await supabase.from('app_config').delete().eq('id', 'global');
  await supabase.from('rsvps').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  localStorage.removeItem(STORAGE_KEY);
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
  } catch (e) {
    console.error('IndexedDB clear failed:', e);
  }
};

export const getIndexedDBSizeMB = async (): Promise<number> => {
  try {
    const state = await loadAppState();
    if (!state) return 0;
    const serialized = JSON.stringify(state);
    return (serialized.length * 2) / (1024 * 1024);
  } catch (e) {
    return 0;
  }
};