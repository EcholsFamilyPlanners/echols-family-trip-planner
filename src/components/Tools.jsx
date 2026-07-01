
import { useMemo, useState } from 'react';
import { mapUrl, money } from '../utils/helpers';
import { savePackingItem, addPackingTemplate, saveSportsVenue } from '../services/travelOsService';

export function TripFinder({destinations,openTrip}) {
  const [p,setP]=useState({days:'5-7',season:'Fall',budget:'Comfortable',style:'Food'});
  const score=d=>(d.length?.includes(p.days)?30:0)+(d.seasons?.includes(p.season)?25:0)+(d.budget===p.budget?20:0)+(d.styles?.includes(p.style)?25:0);
  const ranked=[...destinations].map(d=>({...d,score:score(d)})).sort((a,b)=>b.score-a.score).slice(0,12);
  return <section className="panel"><h2>Trip Finder</h2><div className="filters">
    <Field label="Days"><select value={p.days} onChange={e=>setP({...p,days:e.target.value})}>{['3-4','5-7','8-10','10+'].map(x=><option key={x}>{x}</option>)}</select></Field>
    <Field label="Season"><select value={p.season} onChange={e=>setP({...p,season:e.target.value})}>{['Spring','Summer','Fall','Winter'].map(x=><option key={x}>{x}</option>)}</select></Field>
    <Field label="Budget"><select value={p.budget} onChange={e=>setP({...p,budget:e.target.value})}>{['Comfortable','Premium','Bucket List','Value'].map(x=><option key={x}>{x}</option>)}</select></Field>
    <Field label="Style"><select value={p.style} onChange={e=>setP({...p,style:e.target.value})}>{['Food','Romantic','Photography','Sports','Road Trip','Mountains','Ocean','City','History','Relaxing'].map(x=><option key={x}>{x}</option>)}</select></Field>
  </div><div className="listButtons">{ranked.map((d,i)=><button key={d.id} onClick={()=>openTrip(d)}><b>{i+1}. {d.title}</b><span>{d.score}% match · {d.region} · {d.idealDays}</span></button>)}</div></section>
}

export function Budget(){const [days,setDays]=useState(5),[hotel,setHotel]=useState(225),[food,setFood]=useState(130),[flight,setFlight]=useState(650),[car,setCar]=useState(60),[act,setAct]=useState(75);const total=(+hotel+ +food+ +car+ +act)*(+days)+(+flight*2);return <section className="panel"><h2>Budget Estimator</h2><div className="filters"><Field label="Days"><input type="number" value={days} onChange={e=>setDays(e.target.value)}/></Field><Field label="Hotel/Night"><input type="number" value={hotel} onChange={e=>setHotel(e.target.value)}/></Field><Field label="Food/Day"><input type="number" value={food} onChange={e=>setFood(e.target.value)}/></Field><Field label="Flight/Person"><input type="number" value={flight} onChange={e=>setFlight(e.target.value)}/></Field><Field label="Car/Day"><input type="number" value={car} onChange={e=>setCar(e.target.value)}/></Field><Field label="Activities/Day"><input type="number" value={act} onChange={e=>setAct(e.target.value)}/></Field></div><div className="total"><b>{money(total)}</b><span>Estimated for two travelers</span></div></section>}

export function PackingManager({templates,items,refresh}) {
  const [template,setTemplate]=useState(templates[0]?.id||''); const [newItem,setNewItem]=useState(''); const [cat,setCat]=useState('General'); const [newTemplate,setNewTemplate]=useState('');
  const active=template||templates[0]?.id; const shown=items.filter(i=>i.template_id===active);
  const grouped=shown.reduce((a,i)=>{const c=i.category||'General';a[c]??=[];a[c].push(i);return a},{});
  const toggle=async(item)=>{await savePackingItem({...item,packed:!item.packed}); await refresh();}
  const addItem=async()=>{if(!newItem.trim())return; await savePackingItem({template_id:active,category:cat,item:newItem.trim(),packed:false,sort_order:items.length+1});setNewItem('');await refresh();}
  const addTemplate=async()=>{if(!newTemplate.trim())return; await addPackingTemplate(newTemplate.trim(),'custom');setNewTemplate('');await refresh();}
  return <section className="panel"><h2>Packing Manager</h2><div className="packingAdd"><select value={active} onChange={e=>setTemplate(e.target.value)}>{templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select><input value={newTemplate} onChange={e=>setNewTemplate(e.target.value)} placeholder="New template"/><button className="btn secondary" onClick={addTemplate}>Add Template</button></div><div className="packingAdd"><input value={newItem} onChange={e=>setNewItem(e.target.value)} placeholder="New item"/><input value={cat} onChange={e=>setCat(e.target.value)} placeholder="Category"/><button className="btn gold" onClick={addItem}>Add Item</button></div><div className="packingGrid">{Object.entries(grouped).map(([c,list])=><div className="packingGroup" key={c}><h3>{c}</h3>{list.map(i=><label key={i.id} className={i.packed?'packed':''}><input type="checkbox" checked={!!i.packed} onChange={()=>toggle(i)}/> {i.item}</label>)}</div>)}</div></section>
}

export function SportsTracker({ venues, refresh }) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterVisited, setFilterVisited] = useState('all');
  const [form, setForm] = useState({ name:'', city:'', state_region:'', country:'United States', venue_type:'Stadium', league:'', notes:'' });
  const [showAdd, setShowAdd] = useState(false);

  const venueTypes = [...new Set(venues.map(v => v.venue_type).filter(Boolean))].sort();

  const filtered = useMemo(() => {
    let result = [...venues];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(v =>
        [v.name, v.city, v.state_region, v.country, v.venue_type, v.league, v.notes]
          .some(field => (field||'').toLowerCase().includes(q))
      );
    }
    if (filterType !== 'all') result = result.filter(v => v.venue_type === filterType);
    if (filterVisited === 'visited') result = result.filter(v => v.visited);
    if (filterVisited === 'not') result = result.filter(v => !v.visited);
    return result.sort((a,b) => a.name.localeCompare(b.name));
  }, [venues, query, filterType, filterVisited]);

  const toggle = async (v) => {
    await saveSportsVenue({...v, visited:!v.visited, visited_date:!v.visited?new Date().toISOString().slice(0,10):null});
    await refresh();
  };

  const add = async () => {
    if (!form.name.trim()) return;
    await saveSportsVenue({...form, visited:false});
    setForm({ name:'', city:'', state_region:'', country:'United States', venue_type:'Stadium', league:'', notes:'' });
    setShowAdd(false);
    await refresh();
  };

  return (
    <section className="panel">
      <div className="shortlistHeader">
        <div>
          <h2>🏟️ Sports Venue Tracker</h2>
          <div className="venueStats">
            <div><b>{venues.length}</b><span>Total</span></div>
            <div><b>{venues.filter(v=>v.visited).length}</b><span>Visited</span></div>
            <div><b>{venues.filter(v=>!v.visited).length}</b><span>Not Yet</span></div>
          </div>
        </div>
        <button className="btn gold" onClick={()=>setShowAdd(s=>!s)}>+ Add Venue</button>
      </div>

      {showAdd && (
        <div className="shortlistForm">
          <h3>New Venue</h3>
          <div className="shortlistFormGrid">
            <label>Name *<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Augusta National"/></label>
            <label>Type
              <select value={form.venue_type} onChange={e=>setForm({...form,venue_type:e.target.value})}>
                {['Stadium','Arena','Golf Course','Racetrack','Motor Speedway','Soccer Stadium','Other'].map(t=><option key={t}>{t}</option>)}
              </select>
            </label>
            <label>League / Tour
              <select value={form.league} onChange={e=>setForm({...form,league:e.target.value})}>
                <option value="">— Select —</option>
                {['NFL','MLB','NBA','NHL','PGA','NASCAR','IndyCar','F1','MLS','NCAA Football','NCAA Basketball','UFC','Other'].map(l=><option key={l}>{l}</option>)}
              </select>
            </label>
            <label>City<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="Augusta"/></label>
            <label>State / Region<input value={form.state_region} onChange={e=>setForm({...form,state_region:e.target.value})} placeholder="Georgia"/></label>
            <label>Country<input value={form.country} onChange={e=>setForm({...form,country:e.target.value})} placeholder="United States"/></label>
          </div>
          <label style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Notes about this venue..."/></label>
          <div className="formActions" style={{marginTop:'.75rem'}}>
            <button className="btn gold" onClick={add}>Save Venue</button>
            <button className="btn secondary" onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="venueSearch">
        <input
          className="search"
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="Search by name, city, state, league, type, notes..."
        />
        <div className="venueFilters">
          <select value={filterVisited} onChange={e=>setFilterVisited(e.target.value)}>
            <option value="all">All</option>
            <option value="visited">Visited</option>
            <option value="not">Not Yet</option>
          </select>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            {venueTypes.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <p className="muted" style={{fontSize:'.82rem',margin:'.25rem 0 .75rem'}}>
        {filtered.length} of {venues.length} venue{venues.length!==1?'s':''}
      </p>

      <div className="venueCards">
        {filtered.length === 0 && <p className="muted">No venues match your search.</p>}
        {filtered.map(v => (
          <div className="venueCard" key={v.id}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:'.5rem',flexWrap:'wrap'}}>
                <b>{v.name}</b>
                {v.league && <span className="venueleagueBadge">{v.league}</span>}
                {v.venue_type && v.venue_type !== 'Stadium' && <span className="venueTypeBadge">{v.venue_type}</span>}
              </div>
              <span>{[v.city, v.state_region].filter(Boolean).join(', ')}</span>
              <small>
                {v.visited_date ? `✓ Visited ${v.visited_date}` : ''}
              </small>
              {v.notes && <small style={{fontStyle:'italic'}}>{v.notes}</small>}
            </div>
            <div className="venueActions">
              <button className={v.visited?'btn gold':'btn secondary'} onClick={()=>toggle(v)}>
                {v.visited ? '✓ Visited' : 'Mark Visited'}
              </button>
              <a className="btn secondary" href={mapUrl(v.name)} target="_blank">Map</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Journal({destinations,sharedData,openTrip}){const entries=destinations.map(t=>({trip:t,data:sharedData[t.id]||{}})).filter(x=>x.data.memories||x.data.ideas||x.data.shared_notes);return <section className="panel"><h2>Journal</h2><div className="listButtons">{entries.length?entries.map(x=><button key={x.trip.id} onClick={()=>openTrip(x.trip)}><b>{x.trip.title}</b><span>{x.data.memories||x.data.ideas||x.data.shared_notes}</span></button>):<p>No journal entries yet.</p>}</div></section>}

function Field({label,children}){return <label className="field">{label}{children}</label>}
