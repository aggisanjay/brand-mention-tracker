

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Smile, Meh, Frown } from "lucide-react";

const COLORS = ["#16a34a", "#6b7280", "#ef4444"];

export default function SentimentSummary({ counts = {} }) {
  const data = [
    { name: "positive", value: counts.positive || 0 },
    { name: "neutral", value: counts.neutral || 0 },
    { name: "negative", value: counts.negative || 0 }
  ];

  const stats = [
    { label: "Positive", value: counts.positive || 0, color: "text-green-600", icon: <Smile size={22} className="text-green-600" /> },
    { label: "Neutral", value: counts.neutral || 0, color: "text-gray-600", icon: <Meh size={22} className="text-gray-500" /> },
    { label: "Negative", value: counts.negative || 0, color: "text-red-600", icon: <Frown size={22} className="text-red-600" /> }
  ];

  return (
    <div className="flex items-center gap-10 animate-fadeIn">
      <div className="flex-shrink-0 w-[280px] h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2} stroke="white" strokeWidth={2}>
              {data.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-5">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border shadow-sm hover:shadow-md transition duration-200">
            {s.icon}
            <div className="text-sm">
              <p className={`font-medium ${s.color}`}>{s.label}</p>
              <p className="text-gray-800 text-lg font-semibold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
