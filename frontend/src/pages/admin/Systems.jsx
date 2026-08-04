import React, { useEffect, useState } from "react";
import { ExternalLink, Layers3 } from "lucide-react";
import { adminApi } from "../../services/adminApi";

export default function Systems() {
  const [systems, setSystems] = useState([]);
  const [message, setMessage] = useState("");
  useEffect(() => { adminApi.getServices().then(setSystems).catch((error) => setMessage(error.message)); }, []);
  return (
    <main className="admin-simple-page"><section className="simple-page-heading"><span className="eyebrow"><i /> DIRECTORY MANAGEMENT</span><h1>Web services</h1><p>Connected MCU websites currently visible in the directory.</p></section><section className="simple-card"><div className="simple-card-title"><div><h2>Connected systems</h2><p>{systems.length} services loaded from the API.</p></div><Layers3 /></div>{message ? <p className="users-message">{message}</p> : <div className="simple-list">{systems.map((system) => <article key={system.id}><span className="system-list-icon"><Layers3 /></span><div><strong>{system.title}</strong><small>{system.category} · {system.description}</small></div><span className={`user-status ${system.status}`}><i />{system.status}</span><a href={system.url} target="_blank" rel="noreferrer" aria-label={`Open ${system.title}`}><ExternalLink size={17} /></a></article>)}</div>}</section></main>
  );
}
