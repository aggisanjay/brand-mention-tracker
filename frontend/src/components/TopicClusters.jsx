

import React from 'react';
import { Tags } from 'lucide-react';

export default function TopicClusters({ mentions = [] }) {
  const map = {};
  mentions.forEach(m => (m.topics || []).forEach(t => map[t] = (map[t] || 0) + 1));
  const items = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,20);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Tags size={18} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">Topic Clusters</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {items.length === 0 && <div className="text-sm text-gray-500">No topics yet</div>}
        {items.map(([topic,count]) => (
          <div key={topic} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200 shadow-sm hover:bg-blue-100 transition">
            <span className="capitalize font-medium">{topic}</span>
            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
