
import { MapPin, Printer } from 'lucide-react';
import { img, mapUrl, money } from '../utils/helpers';

export default function TripDetail({ trip, data, status, favorite, updateTrip, goBack }) {
  const estimated = estimateTrip(trip);

  return (
    <>
      <button className="btn secondary" onClick={goBack}>← Back</button>

      <section className="detailHero" style={{ backgroundImage: `url("${img(trip.hero || trip.title)}")` }}>
        <div>
          <p className="eyebrow">{trip.region} · {trip.subregion}</p>
          <h1>{trip.title}</h1>
          <p>{trip.summary}</p>
        </div>
      </section>

      <section className="panel">
        <div className="detailActions">
          <select value={status} onChange={(e) => updateTrip(trip.id, { status: e.target.value })}>
            {['Idea','Considering','Top Pick','Bucket List','Planning','Booked','Visited'].map(x => <option key={x}>{x}</option>)}
          </select>
          <label className="toggle"><input type="checkbox" checked={favorite} onChange={(e) => updateTrip(trip.id, { favorite: e.target.checked })} /> Favorite</label>
          <a className="btn" target="_blank" href={mapUrl(trip.title)}><MapPin size={18}/> Map</a>
          <button className="btn gold" onClick={() => window.print()}><Printer size={18}/> Print</button>
        </div>
      </section>

      <section className="metrics">
        <div className="metric"><b>{trip.idealDays}</b><span>Ideal Days</span></div>
        <div className="metric"><b>{trip.bestMonths}</b><span>Best Months</span></div>
        <div className="metric"><b>{trip.budget}</b><span>Budget Style</span></div>
        <div className="metric"><b>{money(estimated)}</b><span>Rough Estimate</span></div>
      </section>

      <section className="twoCol">
        <List title="Top Experiences" items={trip.experiences} />
        <List title="Worth the Detour" items={trip.detours} linked />
        <List title="Sports & Venues" items={trip.sports} linked />
        <List title="Photo Stops" items={trip.photos} linked />
        <List title="Hotels" items={trip.hotels} linked />
        <List title="Restaurants" items={trip.restaurants} linked />
      </section>

      <section className="panel">
        <h2>Photo Gallery</h2>
        <div className="photoGrid">{[trip.hero, ...(trip.photos || [])].slice(0,8).map(p => <a key={p} className="photo" href={mapUrl(p)} target="_blank" style={{ backgroundImage:`url("${img(p)}")` }}><span>{p}</span></a>)}</div>
      </section>

      <section className="panel">
        <h2>Sample Itinerary</h2>
        <ol>{trip.itinerary?.map((x,i) => <li key={i}><b>Day {i+1}:</b> {x.replace(/^Day \d+:\s*/, '')}</li>)}</ol>
      </section>

      <section className="panel">
        <h2>Shared Planning Notes</h2>
        <div className="noteGrid">
          <Note label="Ideas" value={data.ideas || ''} onChange={v=>updateTrip(trip.id,{ideas:v})} />
          <Note label="Restaurants" value={data.restaurantNotes || ''} onChange={v=>updateTrip(trip.id,{restaurantNotes:v})} />
          <Note label="Memories" value={data.memories || ''} onChange={v=>updateTrip(trip.id,{memories:v})} />
          <Note label="Packing" value={data.packing || ''} onChange={v=>updateTrip(trip.id,{packing:v})} />
        </div>
      </section>
    </>
  );
}

function estimateTrip(trip) {
  const days = parseInt(String(trip.idealDays).match(/\d+/)?.[0] || 5, 10);
  const hotel = trip.budget === 'Bucket List' ? 450 : trip.budget === 'Premium' ? 325 : 225;
  const food = trip.budget === 'Bucket List' ? 220 : trip.budget === 'Premium' ? 175 : 130;
  const travel = trip.region === 'United States' ? 700 : trip.region === 'Bucket List' ? 2200 : 1400;
  return (hotel + food + 75) * days + travel;
}

function List({ title, items=[], linked=false }) {
  return <section className="panel"><h2>{title}</h2><ul>{items.map(x => <li key={x}>{linked ? <a target="_blank" href={mapUrl(x)}>{x}</a> : x}</li>)}</ul></section>
}

function Note({ label, value, onChange }) {
  return <label><b>{label}</b><textarea value={value} onChange={(e) => onChange(e.target.value)} /></label>
}
