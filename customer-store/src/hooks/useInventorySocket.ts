import { useEffect } from "react";

export const useInventorySocket = (onUpdate: () => void) => {
  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_WS_URL);

    socket.onopen = () => {
      console.log("WebSocket Connected");
    };

    socket.onmessage = (event) => {
      console.log("WS Message:", event.data);

      // 🔥 Listen to BOTH events
      if (
        event.data === "inventory_updated" ||
        event.data === "order_updated"
      ) {
        console.log("Real-time update triggered");
        onUpdate(); // Re-fetch orders automatically
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket Closed");
    };

    return () => socket.close();
  }, [onUpdate]);
};
