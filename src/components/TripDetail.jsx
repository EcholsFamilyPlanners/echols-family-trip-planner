
import { MapPin, Printer } from 'lucide-react';
import { img, mapUrl, money } from '../utils/helpers';

export default function TripDetail({ trip, shared={}, personal={}, updateShared, updatePersonal, goBack }) {
  const status = shared.status || trip.status || 'Idea';
  const favorite = !!personal.favorite;
  const estimated = estimate(trip);
  return <>
    <button className="btn secondary" onClick={goBack}>← Back</button>
    <section className="detailHero" style={{backgroundImage:`url("${img(trip.hero || trip.title)}")`}}><div><p className="eyebrow">{trip.region} · {trip.subregion}</p><h1>{trip.title}</h1><p>{trip.summary}</p></div></section>
    <section className="panel"><div className="detailActions">
      <select value={status} onChange={e=>updateShared(trip.id,{status:e.target.value})}>{['Idea','Considering','Top Pick','Bucket List','Planning','Booked','Visited'].map(x=><option key={x}>{x}</option>)}</select>
      <label className="toggle"><input type="checkbox" checked={favorite} onChange={e=>updatePersonal(trip.id,{favorite:e.target.checked})}/> My Favorite</label>
      <a className="btn" href={mapUrl(trip.title)} target="_blank"><MapPin size={18}/> Map</a><button className="btn gold" onClick={()=>window.print()}><Printer size={18}/> Print</button>
    </div></section>
    <section className="metrics"><div className="metric"><b>{trip.idealDays}</b><span>Ideal Days</span></div><div className="metric"><b>{trip.bestMonths}</b><span>Best Months</span></div><div className="metric"><b>{trip.budget}</b><span>Budget</span></div><div className="metric"><b>{money(estimated)}</b><span>Rough Estimate</span></div></section>
    <section className="twoCol"><List title="Top Experiences" items={trip.experiences}/><List title="Detours" items={trip.detours} linked/><List title="Sports & Venues" items={trip.sports} linked/><List title="Photo Stops" items={trip.photos} linked/><List title="Hotels" items={trip.hotels} linked/><List title="Restaurants" items={trip.restaurants} linked/></section>
    <section className="panel"><h2>Photo Gallery</h2><div className="photoGrid">{[trip.hero,...(trip.photos||[])].slice(0,8).map(p=><a key={p} className="photo" href={mapUrl(p)} target="_blank" style={{backgroundImage:`url("${img(p)}")`}}><span>{p}</span></a>)}</div></section>
    <section className="panel"><h2>Itinerary</h2><ol>{trip.itinerary?.map((x,i)=><li key={i}><b>Day {i+1}:</b> {x.replace(/^Day \d+:\s*/,'')}</li>)}</ol></section>
    <section className="panel"><h2>Shared Notes</h2><div className="noteGrid">
      <Note label="Ideas" value={shared.ideas||''} onChange={v=>updateShared(trip.id,{ideas:v})}/>
      <Note label="Restaurants" value={shared.restaurant_notes||''} onChange={v=>updateShared(trip.id,{restaurant_notes:v})}/>
      <Note label="Memories" value={shared.memories||''} onChange={v=>updateShared(trip.id,{memories:v})}/>
      <Note label="Packing" value={shared.packing||''} onChange={v=>updateShared(trip.id,{packing:v})}/>
    </div></section>
  </>
}
function estimate(trip){const days=parseInt(String(trip.idealDays).match(/\d+/)?.[0]||5,10);const hotel=trip.budget==='Bucket List'?450:trip.budget==='Premium'?325:225;const food=trip.budget==='Bucket List'?220:trip.budget==='Premium'?175:130;const travel=trip.region==='United States'?700:trip.region==='Bucket List'?2200:1400;return (hotel+food+75)*days+travel}
function List({title,items=[],linked}){return <section className="panel"><h2>{title}</h2><ul>{items.map(x=><li key={x}>{linked?<a href={mapUrl(x)} target="_blank">{x}</a>:x}</li>)}</ul></section>}
function Note({label,value,onChange}){return <label><b>{label}</b><textarea value={value} onChange={e=>onChange(e.target.value)}/></label>}
