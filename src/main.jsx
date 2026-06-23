
import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Heart, MapPin, Printer, Plus, Download, Upload } from 'lucide-react';
import { seedDestinations } from './data.js';
import './style.css';

const img = q => `https://source.unsplash.com/featured/1400x900/?${encodeURIComponent(q + ', travel landmark')}`;
const gmap = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const getLocal = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};
const setLocal = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function App() {
  const [destinations, setDestinations] = useState(() => [...seedDestinations, ...getLocal('customTrips', [])]);
  const [view, setView] = useState('dashboard');
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ region: '', length: '', season: '', budget: '', status: '', style: '', q: '' });
  const [notes, setNotes] = useState(() => getLocal('tripNotes', {}));
  const [inbox, setInbox] = useState(() => localStorage.getItem('ideaInbox') || '');

  const statusOf = d => notes[d.id]?.status || d.status || 'Idea';
  const favOf = d => !!notes[d.id]?.favorite;
  const regions = [...new Set(destinations.map(d => d.region))].sort();
  const styles = [...new Set(destinations.flatMap(d => d.styles))].sort();

  const filtered = useMemo(() => destinations.filter(d =>
    (!filters.region || d.region === filters.region) &&
    (!filters.length || d.length.includes(filters.length)) &&
    (!filters.season || d.seasons.includes(filters.season)) &&
    (!filters.budget || d.budget === filters.budget) &&
    (!filters.status || statusOf(d) === filters.status) &&
    (!filters.style || d.styles.includes(filters.style)) &&
    (!filters.q || JSON.stringify(d).toLowerCase().includes(filters.q.toLowerCase()))
  ).sort((a,b) => a.title.localeCompare(b.title)), [destinations, filters, notes]);

  const updateNote = (id, patch) => {
    const next = { ...notes, [id]: { ...(notes[id] || {}), ...patch } };
    setNotes(next);
    setLocal('tripNotes', next);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({
      tripNotes: notes,
      customTrips: getLocal('customTrips', []),
      ideaInbox: inbox
    }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'anthony-stephanie-travel-planner-data.json';
    a.click();
  };

  const importData = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const obj = JSON.parse(reader.result);
      if (obj.tripNotes) { setNotes(obj.tripNotes); setLocal('tripNotes', obj.tripNotes); }
      if (obj.ideaInbox !== undefined) { setInbox(obj.ideaInbox); localStorage.setItem('ideaInbox', obj.ideaInbox); }
      if (obj.customTrips) { setLocal('customTrips', obj.customTrips); setDestinations([...seedDestinations, ...obj.customTrips]); }
      alert('Imported.');
    };
    reader.readAsText(file);
  };

  const stats = {
    total: destinations.length,
    top: destinations.filter(d => statusOf(d) === 'Top Pick').length,
    bucket: destinations.filter(d => statusOf(d) === 'Bucket List').length,
    favorites: destinations.filter(favOf).length
  };

  return (
    <div>
      <header className="hero">
        <div className="heroInner">
          <div className="topbar">
            <div className="brand">Anthony & Stephanie</div>
            <nav>
              <button onClick={() => { setView('dashboard'); setFilters({...filters, region:''}); }}>Dashboard</button>
              <button onClick={() => { setView('dashboard'); setFilters({...filters, region:'United States'}); }}>United States</button>
              <button onClick={() => { setView('dashboard'); setFilters({...filters, region:'Canada'}); }}>Canada</button>
              <button onClick={() => { setView('dashboard'); setFilters({...filters, region:'Mexico'}); }}>Mexico</button>
              <button onClick={() => { setView('dashboard'); setFilters({...filters, region:'Europe'}); }}>Europe</button>
              <button onClick={() => { setView('dashboard'); setFilters({...filters, region:'Bucket List'}); }}>Bucket List</button>
              <button onClick={() => setView('favorites')}>Favorites</button>
              <button onClick={() => setView('stadiums')}>Stadiums</button>
              <button onClick={() => setView('add')}>+ Add Trip</button>
            </nav>
          </div>
          <h1>Travel Planner</h1>
          <p>Your private planning system for choosing future trips, comparing ideas, saving notes, tracking stadiums, and printing itineraries.</p>
          <div className="stats">
            <div><b>{stats.total}</b><span>Total Ideas</span></div>
            <div><b>{stats.top}</b><span>Top Picks</span></div>
            <div><b>{stats.bucket}</b><span>Bucket List</span></div>
            <div><b>{stats.favorites}</b><span>Favorites</span></div>
          </div>
        </div>
      </header>

      <main>
        {view === 'dashboard' && (
          <>
            <section className="grid2">
              <div className="panel">
                <h2>Where should we go next?</h2>
                <p>Filter by region, length, season, budget, status, or travel style. Open any trip for maps, itinerary ideas, detours, sports venues, photo stops, hotels, restaurants, and notes.</p>
                <div className="actions">
                  <button className="btn gold" onClick={() => setView('add')}><Plus size={18}/> Add Trip</button>
                  <button className="btn secondary" onClick={exportData}><Download size={18}/> Export</button>
                  <label className="btn secondary"><Upload size={18}/> Import <input type="file" accept=".json" onChange={importData} style={{display:'none'}} /></label>
                </div>
              </div>
              <div className="panel">
                <h2>Idea Inbox</h2>
                <textarea value={inbox} onChange={e => { setInbox(e.target.value); localStorage.setItem('ideaInbox', e.target.value); }} placeholder="Add quick ideas here..." />
              </div>
            </section>

            <section className="panel">
              <h2>Find a Trip</h2>
              <div className="filters">
                <Field label="Region"><select value={filters.region} onChange={e => setFilters({...filters, region:e.target.value})}><option value="">All</option>{regions.map(x => <option key={x}>{x}</option>)}</select></Field>
                <Field label="Length"><select value={filters.length} onChange={e => setFilters({...filters, length:e.target.value})}><option value="">Any</option>{['3-4','5-7','8-10','10+'].map(x => <option key={x}>{x}</option>)}</select></Field>
                <Field label="Season"><select value={filters.season} onChange={e => setFilters({...filters, season:e.target.value})}><option value="">Any</option>{['Spring','Summer','Fall','Winter'].map(x => <option key={x}>{x}</option>)}</select></Field>
                <Field label="Budget"><select value={filters.budget} onChange={e => setFilters({...filters, budget:e.target.value})}><option value="">Any</option>{['Value','Comfortable','Premium','Bucket List'].map(x => <option key={x}>{x}</option>)}</select></Field>
                <Field label="Status"><select value={filters.status} onChange={e => setFilters({...filters, status:e.target.value})}><option value="">Any</option>{['Idea','Considering','Top Pick','Bucket List','Planning','Booked','Visited'].map(x => <option key={x}>{x}</option>)}</select></Field>
                <Field label="Style"><select value={filters.style} onChange={e => setFilters({...filters, style:e.target.value})}><option value="">Any</option>{styles.map(x => <option key={x}>{x}</option>)}</select></Field>
              </div>
              <input className="search" value={filters.q} onChange={e => setFilters({...filters, q:e.target.value})} placeholder="Search destinations, stadiums, detours..." />
            </section>

            <section className="cards">
              {filtered.map(d => (
                <TripCard key={d.id} d={d} status={statusOf(d)} favorite={favOf(d)} open={() => { setSelected(d); setView('detail'); window.scrollTo(0,0); }} toggleFav={(e) => { e.stopPropagation(); updateNote(d.id, { favorite: !favOf(d) }); }} />
              ))}
            </section>

            <section className="panel">
              <h2>Trip Comparison Dashboard</h2>
              <div className="tableWrap">
                <table>
                  <thead><tr><th>Destination</th><th>Region</th><th>Days</th><th>Best Months</th><th>Budget</th><th>Best For</th><th>Status</th></tr></thead>
                  <tbody>{filtered.map(d => <tr key={d.id} onClick={() => { setSelected(d); setView('detail'); }}><td><b>{d.title}</b></td><td>{d.region}</td><td>{d.idealDays}</td><td>{d.bestMonths}</td><td>{d.budget}</td><td>{d.styles.slice(0,4).join(', ')}</td><td>{statusOf(d)}</td></tr>)}</tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {view === 'detail' && selected && <Detail d={selected} note={notes[selected.id] || {}} updateNote={updateNote} status={statusOf(selected)} goBack={() => setView('dashboard')} />}
        {view === 'favorites' && <section className="cards">{destinations.filter(favOf).map(d => <TripCard key={d.id} d={d} status={statusOf(d)} favorite={true} open={() => { setSelected(d); setView('detail'); }} toggleFav={() => {}} />)}</section>}
        {view === 'stadiums' && <Stadiums destinations={destinations} />}
        {view === 'add' && <AddTrip destinations={destinations} setDestinations={setDestinations} goBack={() => setView('dashboard')} />}
      </main>
    </div>
  );
}

function TripCard({d, status, favorite, open, toggleFav}) {
  return (
    <article className="card" onClick={open}>
      <div className="cardBg" style={{backgroundImage:`url("${img(d.hero)}")`}} />
      <button className={'favorite ' + (favorite ? 'on' : '')} onClick={toggleFav}>★</button>
      <div className="cardContent">
        <h3>{d.title}</h3>
        <p>{d.subregion} · {d.idealDays} · {d.bestMonths}</p>
        <div className="chips">{d.styles.slice(0,4).map(x => <span key={x}>{x}</span>)}<span className="gold">{status}</span></div>
      </div>
    </article>
  );
}

function Detail({d, note, updateNote, status, goBack}) {
  return (
    <>
      <button className="btn secondary" onClick={goBack}>← Back</button>
      <section className="detailHero" style={{backgroundImage:`url("${img(d.hero)}")`}}>
        <div><h1>{d.title}</h1><p>{d.summary}</p></div>
      </section>
      <section className="grid2">
        <div className="panel">
          <h2>Decision Snapshot</h2>
          <div className="snapshot">
            <div><b>Region</b><span>{d.region} · {d.subregion}</span></div>
            <div><b>Ideal Days</b><span>{d.idealDays}</span></div>
            <div><b>Best Months</b><span>{d.bestMonths}</span></div>
            <div><b>Budget</b><span>{d.budget}</span></div>
          </div>
          <div className="actions">
            <select value={status} onChange={e => updateNote(d.id, {status:e.target.value})}>{['Idea','Considering','Top Pick','Bucket List','Planning','Booked','Visited'].map(x => <option key={x}>{x}</option>)}</select>
            <label className="btn secondary"><input type="checkbox" checked={!!note.favorite} onChange={e => updateNote(d.id, {favorite:e.target.checked})}/> Favorite</label>
            <a className="btn" target="_blank" href={gmap(d.title)}><MapPin size={18}/> Map</a>
            <button className="btn gold" onClick={() => window.print()}><Printer size={18}/> Print</button>
          </div>
        </div>
        <Panel title="Why This Trip?"><p>{d.summary}</p><p><b>Best for:</b> {d.styles.join(', ')}</p></Panel>
      </section>
      <section className="grid2">
        <List title="Top Experiences" items={d.experiences} />
        <List title="Worth the Detour" items={d.detours} linked />
        <List title="Sports & Iconic Venues" items={d.sports} linked />
        <List title="Photo Stops" items={d.photos} linked />
        <List title="Hotels" items={d.hotels} linked />
        <List title="Restaurants" items={d.restaurants} linked />
      </section>
      <Panel title="Sample Itinerary"><ol>{d.itinerary.map((x,i) => <li key={i}><b>Day {i+1}:</b> {x}</li>)}</ol></Panel>
      <Panel title="Anthony & Stephanie’s Notes">
        <textarea value={note.notes || ''} onChange={e => updateNote(d.id, {notes:e.target.value})} placeholder="Add research notes, memories, restaurants, reservations..." />
      </Panel>
    </>
  );
}

function Stadiums({destinations}) {
  const venues = destinations.flatMap(d => d.sports.map(v => ({venue:v, trip:d.title})));
  return <section className="panel"><h2>Stadium & Iconic Venue Tracker</h2><div className="venueGrid">{venues.map((v,i) => <a key={i} target="_blank" href={gmap(v.venue)}><b>{v.venue}</b><span>{v.trip}</span></a>)}</div></section>
}

function AddTrip({destinations, setDestinations, goBack}) {
  const [form, setForm] = useState({ title:'', region:'United States', subregion:'Custom', budget:'Comfortable', status:'Idea', length:'5-7', seasons:'Spring,Fall', styles:'Idea', summary:'', hero:'', experiences:'', detours:'', sports:'', photos:'', hotels:'', restaurants:'', itinerary:'' });
  const parse = s => (s || '').split(',').map(x => x.trim()).filter(Boolean);
  const save = () => {
    if (!form.title.trim()) return alert('Add a title.');
    const t = {
      id: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-5),
      title: form.title, region: form.region, subregion: form.subregion, budget: form.budget, status: form.status,
      length: parse(form.length), seasons: parse(form.seasons), styles: parse(form.styles),
      bestMonths: 'To research', idealDays: form.length, hero: form.hero || form.title,
      summary: form.summary || 'Custom trip idea to research.',
      experiences: parse(form.experiences).length ? parse(form.experiences) : ['Add details later'],
      detours: parse(form.detours).length ? parse(form.detours) : ['Add detours later'],
      sports: parse(form.sports).length ? parse(form.sports) : ['Add sports venues later'],
      photos: parse(form.photos).length ? parse(form.photos) : ['Add photo stops later'],
      hotels: parse(form.hotels).length ? parse(form.hotels) : ['Add hotels later'],
      restaurants: parse(form.restaurants).length ? parse(form.restaurants) : ['Add restaurants later'],
      itinerary: parse(form.itinerary).length ? parse(form.itinerary) : ['Build itinerary later']
    };
    const customs = getLocal('customTrips', []);
    customs.push(t);
    setLocal('customTrips', customs);
    setDestinations([...destinations, t]);
    goBack();
  };
  return <section className="panel"><h2>Add New Trip</h2><div className="form">
    {Object.keys(form).map(k => <label key={k}>{k}<textarea value={form[k]} onChange={e => setForm({...form, [k]:e.target.value})} /></label>)}
  </div><button className="btn gold" onClick={save}>Save Trip</button></section>
}

function Field({label, children}) { return <label className="field">{label}{children}</label>; }
function Panel({title, children}) { return <section className="panel"><h2>{title}</h2>{children}</section>; }
function List({title, items, linked}) { return <Panel title={title}><ul>{items.map(x => <li key={x}>{linked ? <a target="_blank" href={gmap(x)}>{x}</a> : x}</li>)}</ul></Panel>; }

createRoot(document.getElementById('root')).render(<App />);
