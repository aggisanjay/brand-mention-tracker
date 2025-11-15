

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Dashboard from './Dashboard';
import { fetchMentions } from '../api';

const BACKEND = import.meta.env.VITE_API || "http://localhost:4000";

// ✅ Correct socket URL (ROOT, not /api)
const socket = io(BACKEND, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
});

export default function App() {
  const [mentions, setMentions] = useState([]);

  useEffect(() => {
    // Debug logs (IMPORTANT)
    socket.on("connect", () =>
      console.log("🔥 SOCKET CONNECTED:", socket.id)
    );

    socket.on("connect_error", (err) =>
      console.log("❌ SOCKET CONNECT ERROR:", err.message)
    );

    (async () => {
      const d = await fetchMentions('?limit=100');
      setMentions(d.mentions || []);
    })();

    // 🔥 NEW mentions instantly
    socket.on('new_mention', (m) => {
      console.log("⚡ NEW MENTION RECEIVED", m.text);
      setMentions(prev => [m, ...prev].slice(0, 500));
    });

    // Spike events
    socket.on('spike', (s) =>
      window.dispatchEvent(new CustomEvent('spike', { detail: s }))
    );

    // Volume events
    socket.on('volume', (v) =>
      window.dispatchEvent(new CustomEvent('volume', { detail: v }))
    );

    return () => {
      socket.off();
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(#f8fafc,#f1f5f9)'
    }}>
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 1px 4px rgba(2,6,23,0.06)',
        zIndex: 50,
        borderBottom: '1px solid #e6edf3'
      }}>
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Brand Mention & Reputation Tracker
            </h1>
            <p className="text-sm text-gray-500">Real-time AI powered monitoring</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span style={{
              display:'inline-block',
              height:12,
              width:12,
              borderRadius:12,
              background:'#10b981',
              boxShadow:'0 0 6px rgba(16,185,129,0.5)'
            }}></span>
            Live
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <Dashboard mentions={mentions} />
      </main>
    </div>
  );
}
