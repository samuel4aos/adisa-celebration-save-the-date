import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, FileCode, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PreviewItem } from '@/lib/constants';
import { toast } from 'sonner';

interface SourceCodeModalProps {
  item: PreviewItem | null;
  onClose: () => void;
}

export const SourceCodeModal: React.FC<SourceCodeModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!item?.content) return;
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#020617] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-black"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
                <FileCode className="text-[#d4af37]" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif text-white">{item.title}</h3>
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Source Code Preview</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-full text-white/40 hover:text-white hover:bg-white/5"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-auto p-6 md:p-8">
            <div className="bg-black/60 rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-[#d4af37]" />
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{item.type}.json</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy}
                  className="h-8 text-[10px] uppercase font-bold tracking-wider hover:bg-white/10"
                >
                  {copied ? (
                    <><Check size={12} className="mr-2 text-green-500" /> Copied</>
                  ) : (
                    <><Copy size={12} className="mr-2" /> Copy Code</>
                  )}
                </Button>
              </div>
              <div className="flex-1 p-6 font-mono text-xs md:text-sm text-[#d4af37]/80 overflow-auto selection:bg-[#d4af37]/20">
                <pre className="whitespace-pre-wrap">
                  {item.content || `// No content preview available for this item type\
// status: ${item.status}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-white/5 bg-black/40 flex justify-between items-center">
             <div className="flex items-center gap-6">
                <div>
                   <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Version</p>
                   <p className="text-xs font-mono text-white/80">{item.version || '1.0.0'}</p>
                </div>
                <div>
                   <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Updated</p>
                   <p className="text-xs font-mono text-white/80">{new Date(item.updatedAt).toLocaleDateString()}</p>
                </div>
             </div>
             <Button 
              onClick={onClose} 
              className="bg-[#d4af37] text-black hover:bg-white font-bold px-8 rounded-xl"
            >
              Close Preview
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};