import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Volume2, VolumeX, Camera, Calendar, MapPin, Phone, Lock, Sparkles, Image as ImageIcon, Play, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from './ParticleBackground';
import { Countdown } from './Countdown';
import { AppState, RSVP } from '@/lib/constants';
import { toast } from 'sonner';
import { RSVPForm } from './RSVPForm';
import { saveRSVP } from '@/lib/storage-utils';

interface MainPageProps {
  state: AppState;
  onUpdate: (newState: AppState) => void;
  onAdminClick: () => void;
  onFlyerClick: () => void;
}

export const MainPage: React.FC<MainPageProps> = ({ state, onUpdate, onAdminClick, onFlyerClick }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (state.galleryImages && state.galleryImages.length > 0) {
        setCurrentGalleryIndex((prev) => (prev + 1) % state.galleryImages.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [state.galleryImages?.length]);

  useEffect(() => {
    if (audioRef.current && hasInteracted && isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [state.musicUrl]);

  const startExperience = () => {
    setHasInteracted(true);
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.log("Autoplay blocked", e);
          setIsPlaying(false);
        });
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Playback failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Invitation link copied to clipboard!");
  };

  const handleRSVPSubmit = async (rsvp: RSVP) => {
    try {
      await saveRSVP(rsvp);
      toast.success("Your attendance has been preserved!");
    } catch (e) {
      console.error('RSVP Error:', e);
      toast.error("Failed to submit RSVP. Please try again.");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const day = date.getDate();
      const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3 || Math.floor(day % 100 / 10) === 1) ? 0 : day % 10];
      return `${day}${suffix} ${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-[#d4af37]/30">
      <ParticleBackground />
      <audio ref={audioRef} src={state.musicUrl} loop />

      <AnimatePresence mode="wait">
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
              style={{ backgroundImage: `url(${state.introImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#020617]" />
              <div className="absolute inset-0 bg-black/40" />
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 space-y-8"
            >
              <div className="space-y-4">
                <span className="luxury-text-primary tracking-[0.4em] text-xs uppercase font-sans font-semibold">{state.introLabel}</span>
                <h1 className="text-4xl md:text-6xl font-serif luxury-text-primary italic">{state.introTitle}</h1>
              </div>
              <button
                onClick={startExperience}
                className="bg-[#d4af37] text-black hover:bg-[#d4af37]/80 rounded-full px-12 py-8 text-xl font-serif italic group transition-all flex items-center mx-auto"
              >
                <Play className="mr-3 group-hover:scale-110 transition-transform" />
                {state.enterButton}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-6 right-6 z-50 flex flex-col gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMusic}
          className="rounded-full border-[#d4af37]/30 bg-black/40 backdrop-blur-md text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all"
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={copyLink}
          className="rounded-full border-[#d4af37]/30 bg-black/40 backdrop-blur-md text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all"
        >
          <Share2 size={20} />
        </Button>
      </div>

      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{ backgroundImage: `url(${state.heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#020617]" />
          <div className="absolute inset-0 bg-black/30 md:bg-black/20" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <div className="space-y-3">
              <span className="luxury-text-primary tracking-[0.4em] text-sm uppercase font-sans font-semibold">{state.heroLabel}</span>
              <h1 className="text-5xl md:text-8xl font-serif luxury-text-primary gold-text-glow leading-tight italic">
                {state.heroTitleFirst}<br/><span className="text-3xl md:text-5xl not-italic tracking-[0.1em]">{state.heroTitleSecond}</span>
              </h1>
              <p className="luxury-text-secondary font-serif italic text-xl md:text-2xl">{state.heroConnector}</p>
            </div>

            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-[#d4af37] animate-pulse" />
              <div className="absolute inset-3 rounded-full border border-[#d4af37]/30 shadow-[0_0_30px_rgba(212,175,55,0.2)]" />
              <img
                src={state.heroImage}
                alt="Celebrant"
                className="w-full h-full object-cover rounded-full p-2"
              />
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-2 -right-2 bg-[#d4af37] text-black px-6 py-2 rounded-full text-sm md:text-base font-serif italic font-bold shadow-lg"
              >
                {state.milestone}
              </motion.div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-serif luxury-text-primary tracking-wide">{state.celebrantNames}</h2>
              <p className="luxury-text-secondary tracking-[0.3em] text-[10px] md:text-xs uppercase">{state.heroSubtitle}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="luxury-text-secondary opacity-40 text-[10px] uppercase tracking-[0.2em]">{state.scrollHint}</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-[#d4af37]/60 to-transparent" />
          </motion.div>
        </div>
      </section>

      <div className="w-full relative z-10 flex flex-col items-center text-center">
        <div className="max-w-2xl mx-auto px-6 py-20 w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="w-full space-y-12 mb-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left border-y border-[#d4af37]/20 py-12">
              <div className="flex items-start gap-4">
                <Calendar className="text-[#d4af37] shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif luxury-text-primary text-xl mb-1">{formatDate(state.eventDate)}</h3>
                  <p className="text-white/60 text-sm">{state.eventTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="text-[#d4af37] shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif luxury-text-primary text-xl mb-1">The Venue</h3>
                  <p className="text-white/60 text-sm">{state.venue}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="luxury-text-primary tracking-[0.2em] text-xs uppercase font-sans">{state.countdownLabel}</h3>
              <Countdown targetDate={state.eventDate} targetTime={state.eventTime} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="mb-24 px-8"
          >
            <Sparkles className="mx-auto mb-6 text-[#d4af37]/40" size={32} />
            <p className="text-xl md:text-2xl font-serif italic leading-relaxed luxury-text-white">
              "{state.message}"
            </p>
          </motion.div>
        </div>

        <div className="w-full max-w-5xl px-6 mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="w-full"
          >
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="h-[1px] w-12 md:w-24 bg-[#d4af37]/30" />
              <Camera size={24} className="text-[#d4af37]" />
              <h2 className="font-serif luxury-text-primary text-3xl md:text-4xl">{state.galleryTitle}</h2>
              <div className="h-[1px] w-12 md:w-24 bg-[#d4af37]/30" />
            </div>

            <div className="relative aspect-[4/3] md:aspect-video w-full bg-black/40 rounded-3xl overflow-hidden border border-[#d4af37]/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentGalleryIndex}
                  src={state.galleryImages?.[currentGalleryIndex]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="w-full h-full object-contain"
                />
              </AnimatePresence>
              
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              
              <div className="absolute bottom-6 right-8 luxury-text-primary text-sm font-serif italic tracking-widest bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-[#d4af37]/20">
                {currentGalleryIndex + 1} <span className="mx-1 text-[#d4af37]/40">/</span> {state.galleryImages?.length || 0}
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {state.galleryImages?.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1 transition-all duration-500 rounded-full ${idx === currentGalleryIndex ? 'w-8 bg-[#d4af37]' : 'w-2 bg-[#d4af37]/20'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="w-full max-w-xl px-6 mb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
            >
                <RSVPForm 
                    title={state.rsvpTitle} 
                    onSubmit={handleRSVPSubmit} 
                />
            </motion.div>
        </div>

        <div className="max-w-2xl mx-auto px-6 w-full flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="mb-24 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 border border-[#d4af37]/30 rounded-full bg-[#d4af37]/5">
              <Phone size={16} className="text-[#d4af37]" />
              <span className="luxury-text-primary text-xs uppercase tracking-widest">{state.rsvpLabel}</span>
            </div>
            <p className="luxury-text-white font-sans tracking-wide">
              {state.rsvpPhone}
            </p>
          </motion.div>

          <div className="flex flex-col gap-4 w-full max-w-sm mt-12">
            <Button
              onClick={onFlyerClick}
              className="w-full h-14 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest text-xs rounded-xl group transition-all"
            >
              <ImageIcon className="mr-2 group-hover:scale-110 transition-transform" size={18} />
              {state.flyerButton}
            </Button>
            <Button
              variant="ghost"
              onClick={onAdminClick}
              className="w-full luxury-text-primary opacity-50 hover:opacity-100 hover:text-[#d4af37] hover:bg-transparent transition-colors"
            >
              <Lock className="mr-2" size={14} />
              {state.adminButton}
            </Button>
          </div>

          <p className="mt-20 mb-20 luxury-text-primary opacity-30 text-[10px] uppercase tracking-[0.4em]">
            {state.footerText}
          </p>
        </div>
      </div>
    </div>
  );
}