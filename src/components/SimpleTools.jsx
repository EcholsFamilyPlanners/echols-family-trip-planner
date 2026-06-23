
import { mapUrl, money } from '../utils/helpers';

export function TripFinder({ destinations, openTrip }) {
  const [prefs, setPrefs] = React.useState({ days:'5-7', season:'Fall', budget:'Comfortable', style:'Food' });
  const score = (d) => {
    let s = 0;
    if (d.length?.includes(prefs.days)) s += 30;
    if (d.seasons?.includes(prefs.season)) s += 25;
    if (d.budget === prefs.budget) s += 20;
    if (d.styles?.includes(prefs.style)) s += 25;
    return s;
  };
  const ranked = [...destinations].map(d => ({...d, score:score(d)})).sort((a,b)=>b.score-a.score).slice(0,12);
  return <section className="panel"><h2>Trip Finder</h2><div className="filters">
    <Field label="Days"><select value={prefs.days} onChange={e=>setPrefs({...prefs,days:e.target.value})}>{['3-4','5-7','8-10','10+'].map(x=><option key={x}>{x}</option>)}</select></Field>
    <Field label="Season"><select value={prefs.season} onChange={e=>setPrefs({...prefs,season:e.target.value})}>{['Spring','Summer','Fall','Winter'].map(x=><option key={x}>{x}</option>)}</select></Field>
    <Field label="Budget"><select value={prefs.budget} onChange={e=>setPrefs({...prefs,budget:e.target.value})}>{['Comfortable','Premium','Bucket List','Value'].map(x=><option key={x}>{x}</option>)}</select></Field>
    <Field label="Style"><select value={prefs.style} onChange={e=>setPrefs({...prefs,style:e.target.value})}>{['Food','Romantic','Photography','Sports','Road Trip','Mountains','Ocean','City','History','Relaxing'].map(x=><option key={x}>{x}</option>)}</select></Field>
  </div><div className="listButtons">{ranked.map((d,i)=><button key={d.id} onClick={()=>openTrip(d)}><b>{i+1}. {d.title}</b><span>{d.score}% match · {d.region} · {d.idealDays}</span></button>)}</div></section>
}

export function Budget() {
  const [days,setDays]=React.useState(5), [hotel,setHotel]=React.useState(225), [food,setFood]=React.useState(130), [flight,setFlight]=React.useState(650), [car,setCar]=React.useState(60), [activity,setActivity]=React.useState(75);
  const total = (Number(hotel)+Number(food)+Number(car)+Number(activity))*Number(days)+Number(flight)*2;
  return <section className="panel"><h2>Cost Estimator</h2><div className="filters">
    <Field label="Days"><input type="number" value={days} onChange={e=>setDays(e.target.value)} /></Field>
    <Field label="Hotel/Night"><input type="number" value={hotel} onChange={e=>setHotel(e.target.value)} /></Field>
    <Field label="Food/Day"><input type="number" value={food} onChange={e=>setFood(e.target.value)} /></Field>
    <Field label="Flight/Person"><input type="number" value={flight} onChange={e=>setFlight(e.target.value)} /></Field>
    <Field label="Car/Day"><input type="number" value={car} onChange={e=>setCar(e.target.value)} /></Field>
    <Field label="Activities/Day"><input type="number" value={activity} onChange={e=>setActivity(e.target.value)} /></Field>
  </div><div className="total"><b>{money(total)}</b><span>Estimated for two travelers</span></div></section>
}

export function Stadiums({ destinations }) {
  const venues = destinations.flatMap(d => (d.sports || []).map(v => ({ venue:v, trip:d.title, region:d.region })));
  return <section className="panel"><h2>Stadium & Iconic Venue Tracker</h2><div className="venueGrid">{venues.map((v,i)=><a key={i} href={mapUrl(v.venue)} target="_blank"><b>{v.venue}</b><span>{v.trip} · {v.region}</span></a>)}</div></section>
}

export function Journal({ destinations, tripData, openTrip }) {
  const entries = destinations.map(t => ({ trip:t, data:tripData[t.id] || {} })).filter(x => x.data.ideas || x.data.memories || x.data.restaurantNotes || x.data.packing);
  return <section className="panel"><h2>Journal</h2><div className="listButtons">{entries.length ? entries.map(x=><button key={x.trip.id} onClick={()=>openTrip(x.trip)}><b>{x.trip.title}</b><span>{x.data.memories || x.data.ideas || x.data.restaurantNotes || x.data.packing}</span></button>) : <p>No notes yet.</p>}</div></section>
}

export function SyncPlan() {
  return <section className="panel">
    <h2>Shared Sync</h2>
    <p>This V2.2 build connects to Supabase. Once your Netlify environment variables are set and you sign in, shared favorites, statuses, notes, journals, and custom trips sync across devices.</p>
    <div className="syncSteps">
      <div><b>1</b><span>Run the V2.2 SQL in Supabase</span></div>
      <div><b>2</b><span>Add Supabase URL and anon key to Netlify</span></div>
      <div><b>3</b><span>Sign in with magic link</span></div>
      <div><b>4</b><span>Share the site with Stephanie</span></div>
    </div>
  </section>
}

function Field({ label, children }) { return <label className="field">{label}{children}</label> }
