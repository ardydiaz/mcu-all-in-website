import React, { useEffect, useState } from "react";
import { BarChart3, Eye, Layers3, Signal } from "lucide-react";
import { adminApi } from "../../services/adminApi";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  useEffect(() => { adminApi.getAnalytics().then(setData).catch((error) => setMessage(error.message)); }, []);
  const metrics = [[Layers3, "Total services", data?.totalSystems ?? "—", "violet"], [Signal, "Active services", data?.activeSystems ?? "—", "cyan"], [Eye, "Directory visits", data?.visits?.toLocaleString?.() ?? "—", "orange"], [BarChart3, "Monthly change", data ? `+${data.changePercent}%` : "—", "pink"]];
  return (
    <main className="admin-simple-page"><section className="simple-page-heading"><span className="eyebrow"><i /> PLATFORM INSIGHTS</span><h1>Analytics</h1><p>Directory usage and service availability from live API data.</p></section><section className="analytics-metrics">{metrics.map(([Icon, label, value, tone]) => <article className={tone} key={label}><Icon /><small>{label}</small><strong>{value}</strong></article>)}</section>{message && <p className="users-message">{message}</p>}</main>
  );
}
