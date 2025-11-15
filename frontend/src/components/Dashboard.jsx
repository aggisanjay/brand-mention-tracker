

import React, { useEffect, useState, useRef } from 'react';
import SentimentSummary from './SentimentSummary';
import MentionList from './MentionList';
import TopicClusters from './TopicClusters';
import SpikeToast from './SpikeToast';
import LiveFeed from './LiveFeed';
import { Bell } from "lucide-react";

export default function Dashboard({ mentions }) {
  const [spike, setSpike] = useState(null);
  const [volume, setVolume] = useState([]);
  const spikeRef = useRef(null);

  useEffect(() => {
    function onSpike(e) {
      const spikeData = { ...e.detail, _ts: Date.now() };
      spikeRef.current = spikeData;
      setSpike(spikeData);

      if (spikeRef.currentTimer) clearTimeout(spikeRef.currentTimer);
      spikeRef.currentTimer = setTimeout(() => {
        setSpike(null);
        spikeRef.current = null;
        spikeRef.currentTimer = null;
      }, 30000);
    }

    function onVol(e) {
      setVolume(prev => [...prev, e.detail].slice(0, 60));
    }

    window.addEventListener('spike', onSpike);
    window.addEventListener('volume', onVol);

    return () => {
      window.removeEventListener('spike', onSpike);
      window.removeEventListener('volume', onVol);
      if (spikeRef.currentTimer) clearTimeout(spikeRef.currentTimer);
    };
  }, []);

  const counts = { positive: 0, neutral: 0, negative: 0 };
  mentions.forEach(m => {
    counts[m.sentiment?.label || 'neutral'] =
      (counts[m.sentiment?.label] || 0) + 1;
  });

  const Card = ({ children, className='' }) => (
    <div className={`bg-white ${className} rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 space-y-2 animate-fadeIn`}>
      {children}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-6 animate-fadeIn">

      <div className="lg:col-span-1 space-y-6">
        <Card className="p-8">
          <SentimentSummary counts={counts} volume={volume} />
        </Card>

        <Card className="p-6">
          <TopicClusters mentions={mentions} />
        </Card>

        <Card className="p-6">
          <MentionList mentions={mentions} />
        </Card>
      </div>

      <div className="space-y-6">

        <Card className="p-6 h-[380px]">
          <LiveFeed mentions={mentions} />
        </Card>

        <Card className="p-6 h-[280px] overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={22} className="text-sky-600" />
            <h3 className="text-xl font-semibold tracking-tight text-gray-800">Alerts</h3>
          </div>

          <div style={{ height: '200px', overflowY: 'auto', paddingRight: '6px' }}>
            {spike ? <SpikeToast spike={spike} /> : <div className="text-sm text-gray-500">No active alerts</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
