
import { useMemo, useState } from 'react';
import TripCard from './TripCard';

export default function TripLibrary({ destinations, statusOf, favoriteOf, voteOf, coverPhotos, openTrip, toggleFavorite }) {
  const [f,setF]=useState({region:'',length:'',season:'',budget:'',q:''});
  const regions=[...new Set(destinations.map(d=>d.region))].sort();
  const filtered=useMemo(()=>destinations.filter(d=>
    (!f.region||d.region===f.region)&&(!f.length||d.length?.includes(f.length))&&(!f.season||d.seasons?.includes(f.season))&&(!f.budget||d.budget===f.budget)&&(!f.q||JSON.stringify(d).toLowerCase().includes(f.q.toLowerCase()))
  ).sort((a,b)=>a.title.localeCompare(b.title)),[destinations,f]);
  return <>
    <section className="panel"><h2>Trip Library</h2><div className="filters">
      <Field label="Region"><select value={f.region} onChange={e=>setF({...f,region:e.target.value})}><option value="">All</option>{regions.map(x=><option key={x}>{x}</option>)}</select></Field>
      <Field label="Length"><select value={f.length} onChange={e=>setF({...f,length:e.target.value})}><option value="">Any</option>{['3-4','5-7','8-10','10+'].map(x=><option key={x}>{x}</option>)}</select></Field>
      <Field label="Season"><select value={f.season} onChange={e=>setF({...f,season:e.target.value})}><option value="">Any</option>{['Spring','Summer','Fall','Winter'].map(x=><option key={x}>{x}</option>)}</select></Field>
      <Field label="Budget"><select value={f.budget} onChange={e=>setF({...f,budget:e.target.value})}><option value="">Any</option>{['Comfortable','Premium','Bucket List','Value'].map(x=><option key={x}>{x}</option>)}</select></Field>
    </div><input className="search" value={f.q} onChange={e=>setF({...f,q:e.target.value})} placeholder="Search trips, stadiums, restaurants..."/></section>
    <section className="grid">{filtered.map(t=><TripCard key={t.id} trip={t} status={statusOf(t)} favorite={favoriteOf(t)} vote={voteOf ? voteOf(t) : null} coverPhoto={coverPhotos?.[t.id]} openTrip={openTrip} toggleFavorite={toggleFavorite}/>)}</section>
  </>
}
function Field({label,children}){return <label className="field">{label}{children}</label>}
