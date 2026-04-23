import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, X, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppState } from '@/lib/constants';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface FlyerCreatorProps {
  state: AppState;
  onClose: () => void;
}

export const FlyerCreator: React.FC<FlyerCreatorProps> = ({ state, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(state.heroImage);
  const [isGenerating, setIsGenerating] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!flyerRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(flyerRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Adisa-Celebration-Save-The-Date.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Flyer downloaded successfully!');
    } catch (error) {
      console.error('Error generating flyer:', error);
      toast.error('Failed to generate flyer');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col md:flex-row items-stretch">
      {/* Sidebar - Controls */}
      <div className="w-full md:w-80 bg-[#020617] p-6 border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-serif text-[#d4af37]">Flyer Designer</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60">
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
          <div className="space-y-3">
            <Label className="text-white/60 text-xs uppercase tracking-widest">Select Picture</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedImage(state.heroImage)}
                className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedImage === state.heroImage ? 'border-[#d4af37]' : 'border-transparent'}`}
              >
                <img src={state.heroImage} className="w-full h-full object-cover" alt="" />
                {selectedImage === state.heroImage && (
                  <div className="absolute inset-0 bg-[#d4af37]/20 flex items-center justify-center">
                    <Check size={16} className="text-[#d4af37]" />
                  </div>
                )}
              </button>
              {state.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-[#d4af37]' : 'border-transparent'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                  {selectedImage === img && (
                    <div className="absolute inset-0 bg-[#d4af37]/20 flex items-center justify-center">
                      <Check size={16} className="text-[#d4af37]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/40 text-[10px] leading-relaxed">
              * This design is optimized for high contrast and legibility, making it easy for all guests to read important details.
            </p>
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          className="mt-6 h-14 bg-[#d4af37] text-black hover:bg-[#d4af37]/80 font-bold uppercase tracking-widest"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 animate-spin" size={18} />
          ) : (
            <Download className="mr-2" size={18} />
          )}
          Download Flyer
        </Button>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto flex items-center justify-center bg-[#0a0f1d]">
        <div
          ref={flyerRef}
          className="w-full max-w-[500px] aspect-[4/5] bg-white text-black p-10 flex flex-col items-center justify-between text-center shadow-2xl relative"
        >
          <div className="w-full border-4 border-black p-2 flex-1 flex flex-col">
            <div className="border border-black flex-1 flex flex-col p-6">
              <div className="space-y-1 mb-6">
                <p className="text-xs font-bold tracking-[0.4em] uppercase">Save The Date</p>
                <div className="h-[2px] w-12 bg-black mx-auto" />
              </div>

              <h1 className="text-3xl font-black uppercase tracking-tight leading-none mb-4">
                {state.celebrantNames.split('&')[0]}<br/>
                <span className="text-xl">&</span><br/>
                {state.celebrantNames.split('&')[1]?.trim()}
              </h1>

              <div className="relative w-full aspect-square bg-slate-100 mb-6 border-2 border-black overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Celebrant"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1">Date</p>
                  <p className="text-2xl font-black">{formatDate(state.eventDate)}</p>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-1">Time</p>
                    <p className="text-lg font-black">{state.eventTime} PM</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-1">Venue</p>
                    <p className="text-[10px] font-bold leading-tight">{state.venue.split('(')[0]}</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <p className="text-[8px] font-bold tracking-[0.2em] uppercase italic border-t border-black pt-4">
                  Join us for this special celebration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={`block font-sans ${className}`}>{children}</label>
);