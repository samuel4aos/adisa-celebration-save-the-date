export interface RSVP {
  id: string;
  name: string;
  contact: string;
  guests: number;
  message?: string;
  timestamp: number;
}

export type PreviewStatus = 'live' | 'processing' | 'error' | 'draft';
export type PreviewType = 'ui' | 'config' | 'snippet' | 'system';

export interface PreviewItem {
  id: string;
  type: PreviewType;
  title: string;
  description: string;
  previewUrl: string;
  imageUrl: string;
  status: PreviewStatus;
  updatedAt: number;
  content?: string;
  version?: string;
  author?: string;
}

export interface AppState {
  // Media
  introImage: string;
  heroImage: string;
  galleryImages: string[];
  musicUrl: string;
  
  // Core Info
  celebrantNames: string;
  milestone: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  message: string;
  rsvpPhone: string;
  
  // Dynamic UI Text - Intro
  introLabel: string;
  introTitle: string;
  enterButton: string;
  
  // Dynamic UI Text - Hero
  heroLabel: string;
  heroTitleFirst: string;
  heroTitleSecond: string;
  heroConnector: string;
  heroSubtitle: string;
  scrollHint: string;
  
  // Dynamic UI Text - Sections
  countdownLabel: string;
  galleryTitle: string;
  rsvpLabel: string;
  rsvpTitle: string;
  rsvpButton: string;
  
  // Dynamic UI Text - Actions & Footer
  flyerButton: string;
  adminButton: string;
  footerText: string;

  // Guest Data
  rsvps: RSVP[];

  isAdmin: boolean;
  configVersion?: number;
}

export const APP_VERSION = 1.3;
export const STORAGE_LIMIT_MB = 100;
export const STORAGE_KEY = 'adisa_celebration_config';

export const INITIAL_STATE: AppState = {
  introImage: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/43b57bd1-74b5-4948-a70b-e92c485d47dc/intro-background-1301310f-1776953926415.webp",
  heroImage: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/43b57bd1-74b5-4948-a70b-e92c485d47dc/celebrants-hero-7a7296d9-1776953151787.webp",
  celebrantNames: "Pastor Lawrence Adisa & Evangelist Motunrayo Adisa",
  milestone: "Mom@60 | Dad@67",
  eventDate: "2026-05-30",
  eventTime: "12:00",
  venue: "CAC Prayer Center, Onibu Eja, Osogbo (Also streaming online)",
  message: "Join us in celebrating a lifetime of grace, wisdom, and love. Your presence would make this milestone even more precious.",
  rsvpPhone: "+234 803 123 4567, +234 805 987 6543",
  galleryImages: [
    "https://storage.googleapis.com/dala-prod-public-storage/generated-images/43b57bd1-74b5-4948-a70b-e92c485d47dc/gallery-1-d3197ea8-1776951152032.webp",
    "https://storage.googleapis.com/dala-prod-public-storage/generated-images/43b57bd1-74b5-4948-a70b-e92c485d47dc/gallery-2-4b847329-1776951152201.webp",
    "https://storage.googleapis.com/dala-prod-public-storage/generated-images/43b57bd1-74b5-4948-a70b-e92c485d47dc/gallery-3-f05c6e43-1776951152418.webp",
    "https://storage.googleapis.com/dala-prod-public-storage/generated-images/43b57bd1-74b5-4948-a70b-e92c485d47dc/gallery-4-b2e5d548-1776951151661.webp"
  ],
  musicUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  
  // Default UI Text
  introLabel: "exclusive invitation",
  introTitle: "Adisa Celebration",
  enterButton: "Enter Experience",
  heroLabel: "save the date",
  heroTitleFirst: "Adisa",
  heroTitleSecond: "Celebration",
  heroConnector: "to celebrate",
  heroSubtitle: "A Special Celebration in Their Honor",
  scrollHint: "scroll to discover",
  countdownLabel: "Counting Down",
  galleryTitle: "Precious Memories",
  rsvpLabel: "RSVP Details",
  rsvpTitle: "Confirm Your Attendance",
  rsvpButton: "Preserve Attendance",
  flyerButton: "Generate Save the Date Flyer",
  adminButton: "Admin Dashboard",
  footerText: "Designed for Excellence",

  rsvps: [],
  isAdmin: false,
  configVersion: APP_VERSION
};

export const MOCK_PREVIEWS: PreviewItem[] = [
  {
    id: '1',
    type: 'ui',
    title: 'Luxury Gold Theme v2',
    description: 'Updated color palette with enhanced gold gradients and deep navy backgrounds.',
    previewUrl: 'https://example.com/preview/theme-gold-v2',
    imageUrl: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/43b57bd1-74b5-4948-a70b-e92c485d47dc/luxury-theme-preview-18db019a-1776957890790.webp',
    status: 'live',
    updatedAt: Date.now() - 3600000,
    version: '2.4.1',
    author: 'DesignTeam',
    content: `{
  "primary": "#d4af37",
  "secondary": "#020617",
  "accent": "#f8fafc",
  "surface": "rgba(255,255,255,0.05)"
}`
  },
  {
    id: '2',
    type: 'config',
    title: 'Event Schedule Update',
    description: 'Modified the countdown timer logic and event start time to match the new venue schedule.',
    previewUrl: 'https://example.com/preview/config-schedule',
    imageUrl: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/43b57bd1-74b5-4948-a70b-e92c485d47dc/config-preview-8fcc92fe-1776957889612.webp',
    status: 'processing',
    updatedAt: Date.now() - 1800000,
    version: '1.0.8',
    author: 'System'
  },
  {
    id: '3',
    type: 'snippet',
    title: 'Guest List Export Utility',
    description: 'A new script to export RSVP data in CSV format for easier print management.',
    previewUrl: 'https://example.com/preview/snippet-export',
    imageUrl: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/43b57bd1-74b5-4948-a70b-e92c485d47dc/dashboard-preview-02bcca9a-1776957889986.webp',
    status: 'draft',
    updatedAt: Date.now() - 900000,
    version: 'beta-3',
    author: 'DevOps',
    content: `export const downloadRSVPs = (data) => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "guest-list.csv";
  a.click();
};`
  },
  {
    id: '4',
    type: 'system',
    title: 'Security Protocol Alpha',
    description: 'Real-time encryption layer for RSVP form submissions and data transit.',
    previewUrl: 'https://example.com/preview/security-alpha',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    status: 'live',
    updatedAt: Date.now() - 7200000,
    version: '4.2.0',
    author: 'SecOps'
  },
  {
    id: '5',
    type: 'ui',
    title: 'Typography Refresh',
    description: 'Switching to Playfair Display for all headings and Inter for body text.',
    previewUrl: 'https://example.com/preview/typography-v2',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    status: 'processing',
    updatedAt: Date.now() - 300000,
    version: '1.1.0',
    author: 'UXLead'
  }
];