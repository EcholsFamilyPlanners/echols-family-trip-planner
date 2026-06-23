
import { useMemo, useState } from 'react';
import TripCard from './TripCard';

export default function TripLibrary({ destinations, statusOf, favoriteOf, openTrip, toggleFavorite }) {
  const [filters, setFilters] = useState({ region:'', length:'', season:'', budget:'', status:'', q:'' });
  const regions = [...new Set(destinations.map(d => d.region))].sort();

  const filtered = useMemo(() => destinations.filter(d =>
    (!filters.region || d.region === filters.region) &&
    (!filters.length || d.length?.includes(filters.length)) &&
    (!filters.season || d.seasons?.includes(filters.season)) &&
    (!filters.budget || d.budget === filters.budget) &&
    (!filters.status || statusOf(d) === filters.status) &&
    (!filters.q || JSON.stringify(d).toLowerCase().includes(filters.q.toLowerCase()))
  ).sort((a,b) => a.title.localeCompare(b.title)), [destinations, filters]);

  return (
    <>
      <section className="panel">
        <h2>Trip Library</h2>
        <div className="filters">
          <Field label="Region"><select value={filters.region} onChange={e=>setFilters({...filters,region:e.target.value})}><option value="">All</option>{regions.map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="Length"><select value={filters.length} onChange={e=>setFilters({...filters,length:e.target.value})}><option value="">Any</option>{['3-4','5-7','8-10','10+'].map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="Season"><select value={filters.season} onChange={e=>setFilters({...filters,season:e.target.value})}><option value="">Any</option>{['Spring','Summer','Fall','Winter'].map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="Budget"><select value={filters.budget} onChange={e=>setFilters({...filters,budget:e.target.value})}><option value="">Any</option>{['Comfortable','Premium','Bucket List','Value'].map(x=><option key={x}>{x}</option>)}</select></Field>
          <Field label="Status"><select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}><option value="">Any</option>{['Idea','Considering','Top Pick','Bucket List','Planning','Booked','Visited'].map(x=><option key={x}>{x}</option>)}</select></Field>
        </div>
        <input className="search" value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})} placeholder="Search trips, restaurants, stadiums, detours..." />
      </section>
      <section className="grid">{filtered.map(t => <TripCard key={t.id} trip={t} status={statusOf(t)} favorite={favoriteOf(t)} openTrip={openTrip} toggleFavorite={toggleFavorite} />)}</section>
    </>
  );
}

function Field({label, children}) {
  return <label className="field">{label}{children}</label>
}
