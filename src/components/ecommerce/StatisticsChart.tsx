import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function AccuracyEpochsChart() {
  // --- generate 1..100 epoch labels
  const epochs = Array.from({ length: 100 }, (_, i) => i + 1);

  // --- demo curves (replace with your real history arrays)
  // cnnVal ~ 0.48 -> 0.88 with noise; cnnLstmVal ~ 0.48 -> 0.90
  const cnnVal = epochs.map((e) => {
    const base = 0.48 + 0.0052 * Math.log(e + 1) + 0.0035 * (e / 100); // asymptotic growth
    const noise = (Math.sin(e / 2.8) * 0.02); // small wiggle
    return Math.min(0.98, Math.max(0.48, base + noise));
  });

  const cnnLstmVal = epochs.map((e) => {
    const base = 0.48 + 0.0060 * Math.log(e + 1) + 0.0040 * (e / 100);
    const noise = (Math.cos(e / 3.2) * 0.02);
    return Math.min(0.99, Math.max(0.48, base + noise));
  });

  const series = [
    { name: "CNN (Validation Acc)", data: cnnVal.map((y, i) => ({ x: epochs[i], y })) },
    { name: "CNN+LSTM (Validation Acc)", data: cnnLstmVal.map((y, i) => ({ x: epochs[i], y })) },
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
      text: "Accuracy vs Epochs — CNN vs CNN+LSTM",
      align: "left",
      style: { fontWeight: 600 },
    },
    colors: ["#3B82F6", "#F59E0B"], // blue = CNN, amber = CNN+LSTM (like your plots)
    stroke: { curve: "smooth", width: 2.5 },
    markers: { size: 0, hover: { size: 5 } },
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
  min: 0.2,   // <-- lower bound of Y-axis
  max: 1.0,   // <-- upper bound of Y-axis
  tickAmount: 5, // optional, controls number of ticks
  labels: {
    formatter: (v) => v.toFixed(2), // show 2 decimals if zoomed in
  },
  title: { text: "Accuracy" },
},

    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (v: number) => (v * 100).toFixed(1) + "%" },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
     
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Training Curves
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Validation accuracy per epoch (higher is better)
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
          Current Best: <span className="ml-1 font-semibold">~90% (CNN+LSTM)</span>
        </span>
      </div>

      <Chart options={options} series={series} type="line" height={340} />
    </div>
  );
}
