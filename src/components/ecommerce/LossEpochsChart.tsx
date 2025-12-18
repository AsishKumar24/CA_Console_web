import React, { useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

/** ======== TYPES ======== */
type SeriesPair = {
  train: number[];   // Training loss per epoch
  val: number[];     // Validation loss per epoch
};

type Props = {
  epochs?: number[];
  cnn?: SeriesPair;        // made optional
  cnnLstm?: SeriesPair;    // made optional
  yMin?: number;
  yMax?: number;
  title?: string;
};

/** ======== COMPONENT ======== */

export default function LossEpochsChart({
  epochs = Array.from({ length: 100 }, (_, i) => i + 1),
  cnn,
  cnnLstm,
  yMin = 0,
  yMax = 2,
  title = "Loss vs Epochs",
}: Props) {
  // demo fallbacks if props not provided
 const demoCNN: SeriesPair = {
  train: epochs.map((e) => 1.2 * Math.exp(-e / 25) + 0.3 + 0.1 * Math.sin(e / 5)),
  val:   epochs.map((e) => 1.4 * Math.exp(-e / 22) + 0.4 + 0.1 * Math.cos(e / 4)),
};

  const demoCNNLSTM: SeriesPair = {
    train: epochs.map((e) => 1.2 * Math.exp(-e / 40) + 0.4 + 0.05 * Math.sin(e / 6)),
    val:   epochs.map((e) => 1.3 * Math.exp(-e / 38) + 0.5 + 0.06 * Math.cos(e / 7)),
  };

  const _cnn = cnn ?? demoCNN;
  const _cnnlstm = cnnLstm ?? demoCNNLSTM;
  const [tab, setTab] = useState<"cnn" | "cnnlstm">("cnnlstm");

  const active = tab === "cnn" ? _cnn : _cnnlstm;

  const series = [
    {
      name: "Training Loss",
      data: epochs.map((x, i) => ({ x, y: active.train[i] ?? null })),
    },
    {
      name: "Validation Loss",
      data: epochs.map((x, i) => ({ x, y: active.val[i] ?? null })),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 340,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Outfit, sans-serif",
      foreColor: "#6B7280",
    },
    title: {
      text: `${title} — ${tab === "cnn" ? "CNN" : "CNN+LSTM"}`,
      align: "left",
      style: { fontWeight: 600 },
    },
    colors: ["#3B82F6", "#F59E0B"], // blue: train, amber: val (matches your refs)
    stroke: { curve: "smooth", width: 2.5 },
    markers: { size: 0, hover: { size: 5 } },
    dataLabels: { enabled: false },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      strokeDashArray: 4,
    },
    xaxis: {
      type: "numeric",
      categories: epochs,
      title: { text: "Epochs" },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: yMin,                // << Y-AXIS RANGE STARTS HERE
      max: yMax,                // << Y-AXIS RANGE ENDS HERE
      tickAmount: 6,
      decimalsInFloat: 2,
      title: { text: "Loss" },
      labels: { formatter: (v) => v.toFixed(2) },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (v: number) => (v ?? 0).toFixed(4) },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {/* Tabs */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setTab("cnnlstm")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            tab === "cnnlstm"
              ? "bg-indigo-600 text-white"
              : "border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
          }`}
        >
          CNN + LSTM
        </button>
        <button
          onClick={() => setTab("cnn")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            tab === "cnn"
              ? "bg-indigo-600 text-white"
              : "border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
          }`}
        >
          CNN
        </button>
      </div>

      <Chart options={options} series={series} type="line" height={340} />
    </div>
  );
}
