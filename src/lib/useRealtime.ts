import { useState, useEffect, useCallback, useRef } from "react";

interface UseRealtimeOptions {
  type?: "all" | "users" | "pickups" | "transactions" | "tps" | "notifications" | "stats";
  userId?: string;
  interval?: number; // polling interval in ms (default: 5000)
  enabled?: boolean;
}

interface RealtimeData {
  timestamp: string;
  users?: unknown[];
  pickups?: unknown[];
  transactions?: unknown[];
  tpsProfiles?: unknown[];
  notifications?: unknown[];
  stats?: {
    totalUsers: number;
    totalTPS: number;
    totalPickups: number;
    pendingPickups: number;
    completedPickups: number;
    totalWasteCollected: number;
    totalRevenue: number;
    totalTransactions: number;
  };
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { type = "all", userId, interval = 5000, enabled = true } = options;

  const [data, setData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const lastTimestampRef = useRef<string | null>(null);

  const fetchData = useCallback(async (incremental = false) => {
    try {
      const params = new URLSearchParams({ type });
      if (userId) params.append("userId", userId);
      if (incremental && lastTimestampRef.current) {
        params.append("since", lastTimestampRef.current);
      }

      const response = await fetch(`/api/realtime?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch realtime data");
      }

      const newData: RealtimeData = await response.json();
      
      // Update last timestamp for incremental updates
      lastTimestampRef.current = newData.timestamp;
      
      setData((prevData) => {
        if (!prevData || !incremental) return newData;
        
        // Merge data for incremental updates
        return {
          ...newData,
          users: mergeById(prevData.users, newData.users),
          pickups: mergeById(prevData.pickups, newData.pickups),
          transactions: mergeById(prevData.transactions, newData.transactions),
          tpsProfiles: mergeById(prevData.tpsProfiles, newData.tpsProfiles),
          notifications: mergeById(prevData.notifications, newData.notifications),
        };
      });
      
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [type, userId]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData(false);
    }
  }, [fetchData, enabled]);

  // Polling for updates
  useEffect(() => {
    if (!enabled) return;

    const pollInterval = setInterval(() => {
      fetchData(true); // Incremental update
    }, interval);

    return () => clearInterval(pollInterval);
  }, [fetchData, interval, enabled]);

  // Manual refresh
  const refresh = useCallback(() => {
    setLoading(true);
    lastTimestampRef.current = null;
    fetchData(false);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
  };
}

// Helper function to merge arrays by id
function mergeById<T extends { id: string }>(
  existing: T[] | undefined,
  incoming: T[] | undefined
): T[] | undefined {
  if (!existing) return incoming;
  if (!incoming) return existing;
  
  const map = new Map(existing.map((item) => [item.id, item]));
  
  for (const item of incoming) {
    map.set(item.id, item);
  }
  
  return Array.from(map.values());
}

// Hook untuk stats dashboard dengan auto-refresh
export function useRealtimeStats(interval = 10000) {
  return useRealtime({ type: "stats", interval });
}

// Hook untuk notifications dengan auto-refresh
export function useRealtimeNotifications(userId: string, interval = 3000) {
  return useRealtime({ type: "notifications", userId, interval });
}

// Hook untuk pickups dengan auto-refresh
export function useRealtimePickups(userId?: string, interval = 5000) {
  return useRealtime({ type: "pickups", userId, interval });
}
