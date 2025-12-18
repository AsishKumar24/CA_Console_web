import React from "react";
import {
  BoxIconLine,
  Colab,
  GroupIcon,
  Reacte,
} from "../../icons"; // optional icons (use what you already have)

type Row = {
  metric: "Precision" | "Recall" | "F1-Score";
  benign: number;
  malware: number;
  macro: number;
};

type ModelMetrics = {
  name: string;
  icon?: React.ReactNode;
  rows: Row[];
  accuracy: number; // 0..1
};

const fmt = (v: number) => v.toFixed(2);
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

const CNN_DATA: ModelMetrics = {
  name: "CNN",
  icon: (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
      <Colab className="size-6 fill-current text-[#fffff] dark:text-[#F9AB00]" />
    </div>
  ),
  rows: [
    { metric: "Precision", benign: 0.85, malware: 0.89, macro: 0.87 },
    { metric: "Recall", benign: 0.90, malware: 0.84, macro: 0.87 },
    { metric: "F1-Score", benign: 0.88, malware: 0.86, macro: 0.87 },
  ],
  accuracy: 0.87,
};

const CNN_LSTM_DATA: ModelMetrics = {
  name: "CNN + LSTM",
  icon: (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
      <Reacte className="size-6 fill-current text-[#fffff] dark:text-[#61DAFB]" />
    </div>
  ),
  rows: [
    { metric: "Precision", benign: 0.93, malware: 0.88, macro: 0.90 },
    { metric: "Recall", benign: 0.88, malware: 0.93, macro: 0.90 },
    { metric: "F1-Score", benign: 0.90, malware: 0.90, macro: 0.90 },
  ],
  accuracy: 0.903,
};

function MetricTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-white/[0.04]">
          <tr className="text-left text-gray-600 dark:text-gray-300">
            <th className="px-4 py-2 font-semibold">Metric</th>
            <th className="px-4 py-2 font-semibold">Benign</th>
            <th className="px-4 py-2 font-semibold">Malware</th>
            <th className="px-4 py-2 font-semibold">Macro Avg</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((r) => (
            <tr key={r.metric} className="text-gray-800 dark:text-white/90">
              <td className="px-4 py-2">{r.metric}</td>
              <td className="px-4 py-2">{fmt(r.benign)}</td>
              <td className="px-4 py-2">{fmt(r.malware)}</td>
              <td className="px-4 py-2">{fmt(r.macro)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccuracyBadge({ value }: { value: number }) {
  // simple color cue: >=0.90 green, >=0.88 amber, else red
  const cls =
    value >= 0.9
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      : value >= 0.88
      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
      : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      Accuracy: {pct(value)}
    </span>
  );
}

function ModelCard({ data }: { data: ModelMetrics }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      {data.icon}
      <div className="mt-4 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">{data.name}</h4>
        <AccuracyBadge value={data.accuracy} />
      </div>

      <div className="mt-4">
        <MetricTable rows={data.rows} />
      </div>

      {/* Tiny footer legend */}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Values are per-class; Macro Avg is the unweighted mean over classes.
      </p>
    </div>
  );
}

export default function ModelMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <ModelCard data={CNN_DATA} />
      <ModelCard data={CNN_LSTM_DATA} />
    </div>
  );
}
