/**
 * useWebSocket hook – Future real-time updates structure.
 * Currently a skeleton; implement when WebSocket endpoint is available.
 */
import { useEffect, useRef, useCallback } from 'react';

type MessageHandler = (data: unknown) => void;

interface WebSocketOptions {
  url: string;
  onMessage?: MessageHandler;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
  enabled?: boolean;
}

/**
 * Manages a WebSocket connection with auto-reconnect support.
 * TODO: Implement reconnection logic and message deserialization.
 */
export const useWebSocket = ({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  enabled = false,
}: WebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!enabled || !url) return;

    // TODO: Replace with actual WebSocket connection
    // wsRef.current = new WebSocket(url);
    // wsRef.current.onopen = onOpen ?? null;
    // wsRef.current.onclose = onClose ?? null;
    // wsRef.current.onerror = onError ?? null;
    // wsRef.current.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   onMessage?.(data);
    // };

    console.log('[useWebSocket] Connection placeholder – not yet implemented', { url });
    void onMessage;
    void onOpen;
    void onClose;
    void onError;
  }, [enabled, url, onMessage, onOpen, onClose, onError]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { disconnect, connect };
};
