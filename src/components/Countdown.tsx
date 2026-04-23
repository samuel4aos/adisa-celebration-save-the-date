import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
  targetTime: string;
}

export const Countdown: React.FC<CountdownProps> = ({ targetDate, targetTime }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(`${targetDate}T${targetTime}`).getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center px-4 py-2 border border-[#d4af37]/30 rounded-lg bg-black/40 backdrop-blur-sm min-w-[70px]">
      <span className="text-2xl font-serif text-[#d4af37]">{value.toString().padStart(2, '0')}</span>
      <span className="text-[10px] uppercase tracking-widest text-[#d4af37]/70 font-sans">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-3 justify-center">
      <TimeBox value={timeLeft.days} label="Days" />
      <TimeBox value={timeLeft.hours} label="Hrs" />
      <TimeBox value={timeLeft.minutes} label="Min" />
      <TimeBox value={timeLeft.seconds} label="Sec" />
    </div>
  );
};