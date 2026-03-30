import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

function MetricsChart({ metrics }) {

  const data = {
    labels: metrics.map(m => new Date(m.recorded_at).toLocaleTimeString()),
    datasets: [
      {
        label: "CPU Usage",
        data: metrics.map(m => m.cpu),
        borderColor: "red"
      },
      {
        label: "Memory Usage",
        data: metrics.map(m => m.memory),
        borderColor: "blue"
      }
    ]
  };

  return <Line data={data} />;
}

export default MetricsChart;