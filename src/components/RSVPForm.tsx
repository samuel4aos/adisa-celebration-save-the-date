import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, User, Phone, Users, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RSVP } from '@/lib/constants';
import { toast } from 'sonner';

interface RSVPFormProps {
  title: string;
  onSubmit: (rsvp: RSVP) => void;
}

export const RSVPForm: React.FC<RSVPFormProps> = ({ title, onSubmit }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    guests: '1',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) {
      toast.error("Please fill in your name and contact info.");
      return;
    }

    const newRSVP: RSVP = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      contact: formData.contact,
      guests: parseInt(formData.guests) || 1,
      message: formData.message,
      timestamp: Date.now()
    };

    onSubmit(newRSVP);
    setIsSubmitted(true);
    toast.success("Your attendance has been preserved!");
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-6"
      >
        <div className="w-20 h-20 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-[#d4af37]" size={40} />
        </div>
        <h3 className="text-2xl font-serif text-[#d4af37] mb-4">Thank You!</h3>
        <p className="text-white/70 max-w-sm mx-auto italic">
          Your attendance has been recorded. We look forward to celebrating with you!
        </p>
        <Button 
          variant="outline" 
          onClick={() => setIsSubmitted(false)} 
          className="mt-8 border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black"
        >
          Edit Response
        </Button>
      </motion.div>
    );
  }

  return (
    <Card className="bg-black/40 border-[#d4af37]/20 backdrop-blur-xl overflow-hidden">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif text-[#d4af37] italic">{title}</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-2">Please let us know if you'll be attending</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/60 text-xs flex items-center gap-2">
                <User size={14} className="text-[#d4af37]" /> Full Name
              </Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#d4af37]/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs flex items-center gap-2">
                <Phone size={14} className="text-[#d4af37]" /> Contact Number / Email
              </Label>
              <Input
                required
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="How we can reach you"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#d4af37]/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs flex items-center gap-2">
                <Users size={14} className="text-[#d4af37]" /> Number of Guests
              </Label>
              <select
                value={formData.guests}
                onChange={(e) => setFormData(prev => ({ ...prev, guests: e.target.value }))}
                className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37]/50"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n} className="bg-[#020617] text-white">{n} Guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs flex items-center gap-2">
                <MessageSquare size={14} className="text-[#d4af37]" /> Optional Message
              </Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="A sweet note for the celebrants..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#d4af37]/50 min-h-[100px]"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#d4af37] text-black hover:bg-[#d4af37]/80 font-serif italic text-lg"
          >
            <Send size={18} className="mr-2" />
            Preserve Attendance
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};