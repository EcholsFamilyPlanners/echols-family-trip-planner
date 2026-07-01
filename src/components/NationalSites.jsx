import { useState, useEffect, useMemo } from 'react';
import { loadNationalSites, saveNationalSite, deleteNationalSite } from '../services/travelOsService';
import { mapUrl } from '../utils/helpers';

const SITE_TYPES = ['National Park','National Monument','Presidential Library','National Historic Site','National Memorial','Other'];

const TYPE_ICON = {
  'National Park': '🏔️',
  'National Monument': '🗿',
  'Presidential Library': '🏛️',
  'National Historic Site': '⚔️',
  'National Memorial': '🪨',
  'Other': '📍',
};

const TYPE_COLOR = {
  'National Park': '#166534',
  'National Monument': '#92400e',
  'Presidential Library': '#1e3a5f',
  'National Historic Site': '#7c3aed',
  'National Memorial': '#9f1239',
  'Other': '#374151',
};

const BLANK = { name:'', city:'', state_region:'', country:'United States', site_type:'National Park', notes:'' };

export default function NationalSites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterVisited, setFilterVisited] = useState('all');
  const [form, setForm] = useState(null);

  const load = async () => {
    setLoading(true);
    setSites(await loadNationalSites());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = [...sites];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(s =>
        [s.name, s.city, s.state_region, s.notes, s.site_type]
          .some(f => (f||'').toLowerCase().includes(q))
      );
    }
    if (filterType !== 'all') result = result.filter(s => s.site_type === filterType);
    if (filterVisited === 'visited') result = result.filter(s => s.visited);
    if (filterVisited === 'not') result = result.filter(s => !s.visited);
    return result;
  }, [sites, query, filterType, filterVisited]);

  // Stats
  const byType = SITE_TYPES.reduce((acc, t) => {
    acc[t] = { total: sites.filter(s=>s.site_type===t).length, visited: sites.filter(s=>s.site_type===t&&s.visited).length };
    return acc;
  }, {});

  const toggle = async (site) => {
    const updated = { ...site, visited: !site.visited, visited_date: !site.visited ? new Date().toISOString().slice(0,10) : null };
    // Update locally first so the page doesn't jump
    setSites(prev => prev.map(s => s.id === site.id ? updated : s));
    // Then persist to Supabase in the background
    await saveNationalSite(updated);
  };

  const save = async () => {
    if (!form?.name?.trim()) return alert('Name is required.');
    await saveNationalSite(form);
    setForm(null);
    await load();
  };

  const remove = async (id) => {
    if (!confirm('Remove this site?')) return;
    await deleteNationalSite(id);
    await load();
  };

  if (loading) return <p className="muted">Loading national sites...</p>;

  return (
    <section className="panel">
      <div className="shortlistHeader">
        <div>
          <h2>🏔️ National Sites</h2>
          <p className="muted">{sites.filter(s=>s.visited).length} of {sites.length} visited</p>
        </div>
        <button className="btn gold" onClick={()=>setForm({...BLANK})}>+ Add Site</button>
      </div>

      {/* Stats by type */}
      <div className="sitesStats">
        {SITE_TYPES.filter(t => byType[t]?.total > 0).map(t => (
          <div key={t} className="sitesStat" onClick={()=>setFilterType(filterType===t?'all':t)} style={{cursor:'pointer',borderColor: filterType===t ? TYPE_COLOR[t] : ''}}>
            <span style={{fontSize:'1.2rem'}}>{TYPE_ICON[t]}</span>
            <div>
              <b style={{color:TYPE_COLOR[t]}}>{byType[t].visited}/{byType[t].total}</b>
              <span>{t.replace('National ','')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {form && (
        <div className="shortlistForm">
          <h3>{form.id ? 'Edit Site' : 'Add Site'}</h3>
          <div className="shortlistFormGrid">
            <label>Name *<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Yellowstone National Park"/></label>
            <label>Type
              <select value={form.site_type} onChange={e=>setForm({...form,site_type:e.target.value})}>
                {SITE_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </label>
            <label>City<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="City"/></label>
            <label>State<input value={form.state_region} onChange={e=>setForm({...form,state_region:e.target.value})} placeholder="State"/></label>
          </div>
          <label style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Notes about this site..."/></label>
          <div className="formActions" style={{marginTop:'.75rem'}}>
            <button className="btn gold" onClick={save}>Save</button>
            <button className="btn secondary" onClick={()=>setForm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="venueSearch">
        <input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name, state, type, notes..."/>
        <div className="venueFilters">
          <select value={filterVisited} onChange={e=>setFilterVisited(e.target.value)}>
            <option value="all">All</option>
            <option value="visited">Visited</option>
            <option value="not">Not Yet</option>
          </select>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            {SITE_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <p className="muted" style={{fontSize:'.82rem',margin:'.25rem 0 .75rem'}}>
        {filtered.length} of {sites.length} site{sites.length!==1?'s':''}
      </p>

      {/* Site list */}
      <div className="venueCards">
        {filtered.length === 0 && <p className="muted">No sites match your search.</p>}
        {filtered.map(site => (
          <div className="venueCard" key={site.id}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'.5rem',flexWrap:'wrap'}}>
                <b>{site.name}</b>
                <span className="venueleagueBadge" style={{background:TYPE_COLOR[site.site_type]||'#374151'}}>
                  {TYPE_ICON[site.site_type]} {site.site_type.replace('National ','')}
                </span>
              </div>
              <span>{[site.city, site.state_region].filter(Boolean).join(', ')}</span>
              {site.visited_date && <small>✓ Visited {site.visited_date}</small>}
              {site.notes && <small style={{fontStyle:'italic'}}>{site.notes}</small>}
            </div>
            <div className="venueActions">
              <button className={site.visited?'btn gold':'btn secondary'} onClick={()=>toggle(site)}>
                {site.visited ? '✓ Visited' : 'Mark Visited'}
              </button>
              <a className="btn secondary" href={mapUrl(site.name)} target="_blank">Map</a>
              <button className="btn secondary small" onClick={()=>setForm({...site})}>Edit</button>
              <button className="btn secondary small danger" onClick={()=>remove(site.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
