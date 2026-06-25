import { useEffect, useRef, useState } from 'react';

// Leaflet loaded from CDN in index.html — we use it via window.L
const VISITED_COLOR = '#c9a84c';   // gold
const PLANNED_COLOR = '#94a3b8';   // light slate
const LOVED_COLOR   = '#f97316';   // orange — voted love/like

function getMarkerColor(trip, statusOf, voteOf) {
  const status = statusOf(trip);
  if (status === 'Visited') return VISITED_COLOR;
  if (voteOf && ['love','like'].includes(voteOf(trip))) return LOVED_COLOR;
  if (['Top Pick','Planning','Booked','Considering','Bucket List'].includes(status)) return '#64748b';
  return PLANNED_COLOR;
}

function makeIcon(color, size = 12) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size+8}" height="${size+8}" viewBox="0 0 ${size+8} ${size+8}">
    <circle cx="${(size+8)/2}" cy="${(size+8)/2}" r="${size/2}" fill="${color}" stroke="white" stroke-width="2"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export default function TripMap({ destinations, statusOf, voteOf, openTrip }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [ready, setReady] = useState(false);

  // Load Leaflet CSS + JS dynamically
  useEffect(() => {
    if (window.L) { setReady(true); return; }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  // Init map
  useEffect(() => {
    if (!ready || !mapRef.current || mapInstance.current) return;
    mapInstance.current = window.L.map(mapRef.current, {
      center: [30, 10],
      zoom: 2,
      minZoom: 1,
      maxZoom: 10,
    });
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);
  }, [ready]);

  // Add/update markers
  useEffect(() => {
    if (!ready || !mapInstance.current) return;
    const L = window.L;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    destinations.filter(d => d.lat && d.lng).forEach(trip => {
      const color = getMarkerColor(trip, statusOf, voteOf);
      const status = statusOf(trip);
      const isVisited = status === 'Visited';
      const size = isVisited ? 16 : 12;

      const icon = L.icon({
        iconUrl: makeIcon(color, size),
        iconSize: [size + 8, size + 8],
        iconAnchor: [(size + 8) / 2, (size + 8) / 2],
        popupAnchor: [0, -(size + 8) / 2],
      });

      const marker = L.marker([trip.lat, trip.lng], { icon })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div style="min-width:160px">
            <b style="font-size:.95rem">${trip.title}</b><br/>
            <span style="font-size:.8rem;color:#718096">${trip.region} · ${trip.idealDays}</span><br/>
            <span style="font-size:.8rem;font-weight:600;color:${color}">${status}</span>
          </div>
        `);

      marker.on('click', () => {
        marker.openPopup();
      });

      // Double-click opens trip
      marker.on('dblclick', () => {
        openTrip(trip);
      });

      markersRef.current.push(marker);
    });
  }, [ready, destinations, statusOf, voteOf]);

  const visited = destinations.filter(d => statusOf(d) === 'Visited').length;
  const loved = destinations.filter(d => voteOf && ['love','like'].includes(voteOf(d))).length;
  const planned = destinations.filter(d => {
    const s = statusOf(d);
    return ['Top Pick','Planning','Booked','Considering','Bucket List'].includes(s);
  }).length;

  return (
    <div className="tripMapWrap">
      <div className="tripMapLegend">
        <span className="legendItem"><span className="legendDot" style={{background:VISITED_COLOR}}/> Visited ({visited})</span>
        <span className="legendItem"><span className="legendDot" style={{background:LOVED_COLOR}}/> Love/Like ({loved})</span>
        <span className="legendItem"><span className="legendDot" style={{background:'#64748b'}}/> Planning ({planned})</span>
        <span className="legendItem"><span className="legendDot" style={{background:PLANNED_COLOR}}/> Idea ({destinations.length - visited - loved - planned})</span>
        <span className="legendTip">Click pin for details · Double-click to open trip</span>
      </div>
      {!ready && <p className="muted" style={{padding:'2rem',textAlign:'center'}}>Loading map...</p>}
      <div ref={mapRef} className="tripMapCanvas" style={{display: ready ? 'block' : 'none'}} />
    </div>
  );
}
