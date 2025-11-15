


import React from "react";
import { MessageSquare, ExternalLink } from "lucide-react";

export default function MentionList({ mentions = [] }) {
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="text-sky-600" size={20} />
        <h2 className="text-lg font-semibold tracking-tight">Recent Mentions</h2>
      </div>

      <div className="space-y-4 max-h-[640px] overflow-y-auto pr-2">
        {mentions.map((m) => (
          <div key={m._id} className="p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 animate-slideIn">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">{m.source} • {new Date(m.publishedAt).toLocaleString()}</span>

              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                m.sentiment?.label === "positive" ? "bg-green-50 text-green-700 border-green-200" :
                m.sentiment?.label === "negative" ? "bg-red-50 text-red-700 border-red-200" :
                "bg-gray-50 text-gray-600 border-gray-200"
              }`}>
                {m.sentiment?.label || "neutral"}
              </span>
            </div>

            <p className="mt-2 text-gray-800 leading-relaxed">{m.text}</p>

            <div className="mt-3 flex gap-2 flex-wrap">
              {(m.topics || []).map(t => (
                <span key={t} className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-sm capitalize">{t}</span>
              ))}
            </div>

            {m.url && (
              <a href={m.url} className="flex items-center gap-1 text-sky-600 text-sm mt-3 hover:underline" target="_blank" rel="noreferrer">
                View Source <ExternalLink size={14} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
