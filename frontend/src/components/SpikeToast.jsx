

import React from "react";
import { AlertTriangle, Flame, Bell } from "lucide-react";

export default function SpikeToast({ spike }) {
  if (!spike) return null;
  const sev = spike.severity || 'low';
  const styles = {
    critical: 'bg-red-50 border-red-200 text-red-700',
    high: 'bg-orange-50 border-orange-200 text-orange-700',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    low: 'bg-gray-50 border-gray-200 text-gray-700'
  };
  const icons = {
    critical: <Flame size={20} className="text-red-600" />,
    high: <AlertTriangle size={20} className="text-orange-600" />,
    medium: <Bell size={20} className="text-yellow-600" />,
    low: <AlertTriangle size={20} className="text-gray-600" />
  };

  return (
    <div className={`${styles[sev]} p-4 rounded-xl border shadow-sm animate-fadeIn`}>
      <div className="flex items-center gap-2 mb-2">
        {icons[sev]}
        <div className="font-semibold text-base">{sev.charAt(0).toUpperCase() + sev.slice(1)} Spike Detected</div>
      </div>

      <div className="text-sm mb-3">
        <div className="flex justify-between"><span>Spike Mentions:</span><b>{spike.count}</b></div>
        <div className="flex justify-between mt-1"><span>Median Baseline:</span><b>{Math.round(spike.median || 0)}</b></div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Recent Trigger Mentions</h4>
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {spike.top?.map(m => (
            <div key={m._id} className="bg-white border rounded-lg p-2 shadow-sm">
              <p className="text-gray-800 text-sm">{m.text}</p>
              <p className="text-xs text-gray-500 mt-1">{m.source} • {new Date(m.publishedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
