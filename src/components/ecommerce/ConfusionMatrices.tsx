import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

type Matrix = [[number, number], [number, number]];

const CNN_LSTM_MATRIX: Matrix = [
  [452, 63],
  [34, 451],
];

const CNN_MATRIX: Matrix = [
  [463, 52],
  [79, 406],
];

// series names become Y-axis labels in heatmap
function matrixToSeries(matrix: Matrix) {
  const xLabels = ["Pred: Benign", "Pred: Malware"]; // X-axis categories
  return [
    {
      name: "Actual: Benign",
      data: xLabels.map((x, i) => ({ x, y: matrix[0][i] })),
    },
    {
      name: "Actual: Malware",
      data: xLabels.map((x, i) => ({ x, y: matrix[1][i] })),
    },
  ];
}

const baseHeatmapOptions: ApexOptions = {
  chart: { type: "heatmap", toolbar: { show: false }, animations: { enabled: false }, fontFamily: "Outfit, sans-serif" },
  plotOptions: {
    heatmap: {
      radius: 8,
      colorScale: {
        min: 0,
        max: 470,
        ranges: [
          { from: 0,   to: 50,  color: "#dbeafe" },
          { from: 51,  to: 150, color: "#93c5fd" },
          { from: 151, to: 300, color: "#60a5fa" },
          { from: 301, to: 470, color: "#3b82f6" },
        ],
      },
    },
  },
  dataLabels: {
    enabled: true,
    style: { colors: ["#0b1220"] },
    formatter: (val: number) => `${val}`,
  },
  legend: { show: false },
  xaxis: {
    type: "category",
    categories: ["Pred: Benign", "Pred: Malware"], // ✅ only xaxis has categories
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: "#6B7280" } },
  },
  yaxis: {
    // ❌ no categories here
    labels: { style: { colors: "#6B7280" } }, // will display series names
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val}`,
      title: {
        formatter: (_: string, opts: any) => {
          const actual = opts.series[opts.seriesIndex].name; // e.g., "Actual: Benign"
          const pred = opts.w.globals.labels[opts.dataPointIndex]; // e.g., "Pred: Malware"
          return `${actual} → ${pred}`;
        },
      },
    },
  },
};

export default function ConfusionMatrices() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* CNN + LSTM */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          Confusion Matrix — CNN + LSTM
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Rows = Actual, Columns = Predicted</p>
        <Chart
          type="heatmap"
          height={320}
          series={matrixToSeries(CNN_LSTM_MATRIX)}
          options={baseHeatmapOptions} // ✅ no yaxis.categories override
        />
      </div>

      {/* CNN */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
          Confusion Matrix — CNN
        </h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Rows = Actual, Columns = Predicted</p>
        <Chart
          type="heatmap"
          height={320}
          series={matrixToSeries(CNN_MATRIX)}
          options={baseHeatmapOptions} // ✅ same here
        />
      </div>
    </div>
  );
}
