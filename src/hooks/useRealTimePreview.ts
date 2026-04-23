import { useState, useEffect, useCallback } from 'react';
import { PreviewItem, MOCK_PREVIEWS, PreviewStatus } from '@/lib/constants';
import { toast } from 'sonner';

export const useRealTimePreview = () => {
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchPreviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate REST API latency
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate 5% chance of API error
      if (Math.random() < 0.05) {
        throw new Error('Internal Server Error (500)');
      }
      
      setItems([...MOCK_PREVIEWS]);
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch previews');
      setIsConnected(false);
      toast.error('API Error: Could not load preview data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreviews();
  }, [fetchPreviews]);

  // Simulate WebSocket/SSE real-time updates
  useEffect(() => {
    if (isLoading || error || !isConnected) return;

    const interval = setInterval(() => {
      const roll = Math.random();
      
      // 15% chance to transition an item from processing to live
      if (roll > 0.85) {
        setItems(prev => prev.map(item => {
          if (item.status === 'processing') {
            toast.success(`Success: "${item.title}" is now LIVE`, {
              description: `Version ${item.version} deployed successfully.`
            });
            return { ...item, status: 'live' as PreviewStatus, updatedAt: Date.now() };
          }
          return item;
        }));
      }
      
      // 10% chance to "receive" a new system modification
      else if (roll > 0.90) {
        const id = Math.random().toString(36).substr(2, 9);
        const newItem: PreviewItem = {
          id,
          type: 'system',
          title: `Automated Patch ${id.toUpperCase()}`,
          description: 'Optimizing background particle effects for mobile devices.',
          previewUrl: '#',
          imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
          status: 'processing',
          updatedAt: Date.now(),
          version: '1.0.x',
          author: 'AutoBot'
        };
        setItems(prev => [newItem, ...prev.slice(0, 11)]); // Keep list manageable
        toast.info('System Update: New patch detected', {
          description: 'A new system optimization is being processed.'
        });
      }
      
      // 5% chance of a mock "network flicker" (toggle connection status)
      else if (roll < 0.05) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 2000);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isLoading, error, isConnected]);

  return { items, isLoading, error, isConnected, refetch: fetchPreviews };
};