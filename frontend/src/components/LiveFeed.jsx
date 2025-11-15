



import React from "react";
import { Zap } from "lucide-react";

export default function LiveFeed({ mentions = [] }) {
  return (
    <div className="animate-fadeIn h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <Zap className="text-sky-600" size={20} />
        <h3 className="text-lg font-semibold tracking-tight">Live Feed</h3>
      </div>

      <p className="text-sm text-gray-500 mb-3 flex-shrink-0">Incoming mentions (real-time)</p>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2">
        {mentions.slice(0, 50).map(m => (
          <div key={m._id} className="p-3 rounded-xl border bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 animate-slideIn">
            <div className="text-xs text-gray-500 mb-1">{m.source} • {new Date(m.publishedAt).toLocaleString()}</div>
            <div className="text-sm text-gray-800 leading-snug">{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
