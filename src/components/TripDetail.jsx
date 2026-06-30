
import { useState } from 'react';
import { MapPin, Printer } from 'lucide-react';
import { img, mapUrl, money } from '../utils/helpers';
import HotelShortlist from './HotelShortlist';
import TripBudget from './TripBudget';
import TripReservations from './TripReservations';
import TripPhotos from './TripPhotos';
import TripJournal from './TripJournal';
import PdfImport from './PdfImport';
import DeleteTripModal from './DeleteTripModal';
import MergeTripsModal from './MergeTripsModal';
import ItineraryBuilder from './ItineraryBuilder';

const VOTES = [
  { value: 'love',  label: '❤️ Love' },
  { value: 'like',  label: '👍 Like' },
  { value: 'maybe', label: '🤔 Maybe' },
  { value: 'pass',  label: '👋 Pass' },
];

export default function TripDetail({ trip, shared={}, personal={}, myVote, castVote, updateShared, updatePersonal, goBack, actorName, isCustom, onTripDeleted, allDestinations, customTrips, destPhoto }) {
  const [tab, setTab] = useState('overview');
  const [voting, setVoting] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const status = shared.status || trip.status || 'Idea';
  const favorite = !!personal.favorite;
  const estimated = estimate(trip);
  const heroUrl = coverPhoto || destPhoto || img(trip.id);

  const handleVote = async (v) => {
    if (voting) return;
    setVoting(true);
    try { await castVote(trip.id, v); } finally { setVoting(false); }
  };

  return <>
    <button className="btn secondary" onClick={goBack}>← Back</button>

    <section className="detailHero" style={{backgroundImage:`url("${heroUrl}")`}}>
      <div>
        <p className="eyebrow">{trip.region} · {trip.subregion}</p>
        <h1>{trip.title}</h1>
        <p>{trip.summary}</p>
      </div>
    </section>

    <section className="panel">
      <div className="detailActions">
        <select value={status} onChange={e=>updateShared(trip.id,{status:e.target.value})}>
          {['Idea','Considering','Top Pick','Bucket List','Planning','Booked','Visited'].map(x=><option key={x}>{x}</option>)}
        </select>
        <label className="toggle"><input type="checkbox" checked={favorite} onChange={e=>updatePersonal(trip.id,{favorite:e.target.checked})}/> My Favorite</label>
        <label className="toggle"><input type="checkbox" checked={!!personal.wish_list || !!personal.want_to_visit} onChange={e=>updatePersonal(trip.id,{wish_list:e.target.checked,want_to_visit:e.target.checked})}/> My Wish List</label>
        <a className="btn" href={mapUrl(trip.title)} target="_blank"><MapPin size={18}/> Map</a>
        <button className="btn gold" onClick={()=>window.print()}><Printer size={18}/> Print</button>
        <PdfImport tripId={trip.id} sharedNotes={shared} onImported={async()=>{ if(typeof window!=='undefined') window.location.reload(); }} />
        <button className="btn danger-outline" onClick={()=>setShowDelete(true)}>🗑️ {isCustom ? 'Delete' : 'Remove'} Trip</button>
        <button className="btn secondary" onClick={()=>setShowMerge(true)}>🔗 Merge with Another Trip</button>
      </div>
    </section>

    {showDelete && (
      <DeleteTripModal
        trip={trip}
        isCustom={isCustom}
        onClose={()=>setShowDelete(false)}
        onDeleted={async()=>{ if (onTripDeleted) await onTripDeleted(); goBack(); }}
      />
    )}

    {showMerge && (
      <MergeTripsModal
        trip={trip}
        allDestinations={allDestinations || []}
        customTrips={customTrips || []}
        onClose={()=>setShowMerge(false)}
        onMerged={async()=>{ if (onTripDeleted) await onTripDeleted(); goBack(); }}
      />
    )}

    <section className="panel votePanel">
      <h3>My Vote</h3>
      <p className="muted">How excited are you about this trip?</p>
      <div className="voteButtons">
        {VOTES.map(v => (
          <button
            key={v.value}
            className={`voteBtn ${myVote === v.value ? 'active' : ''}`}
            onClick={() => handleVote(v.value)}
            disabled={voting}
          >
            {v.label}
          </button>
        ))}
      </div>
      {myVote && <p className="voteConfirm">Your vote: <b>{VOTES.find(v=>v.value===myVote)?.label}</b></p>}
    </section>

    <section className="metrics">
      <div className="metric"><b>{trip.idealDays}</b><span>Ideal Days</span></div>
      <div className="metric"><b>{trip.bestMonths}</b><span>Best Months</span></div>
      <div className="metric"><b>{trip.budget}</b><span>Budget</span></div>
      <div className="metric"><b>{money(estimated)}</b><span>Rough Estimate</span></div>
    </section>

    <section className="panel notebookTabs">
      {[
        ['overview','Overview'],
        ['plan','Plan'],
        ['itinerary','Itinerary'],
        ['food','Food & Hotels'],
        ['sports','Sports'],
        ['packing','Packing'],
        ['memories','Memories'],
        ['personal','My Notes']
      ].map(([key,label]) => (
        <button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>
      ))}
    </section>

    {tab === 'overview' && <Overview trip={trip} shared={shared} updateShared={updateShared} />}
    {tab === 'plan' && <Planning trip={trip} shared={shared} updateShared={updateShared} />}
    {tab === 'itinerary' && <Itinerary trip={trip} shared={shared} updateShared={updateShared} />}
    {tab === 'food' && <FoodHotels trip={trip} shared={shared} updateShared={updateShared} />}
    {tab === 'sports' && <Sports trip={trip} />}
    {tab === 'packing' && <PackingNotes trip={trip} shared={shared} updateShared={updateShared} />}
    {tab === 'memories' && <Memories trip={trip} shared={shared} updateShared={updateShared} setCoverPhoto={setCoverPhoto} actorName={actorName} />}
    {tab === 'personal' && <PersonalNotes trip={trip} personal={personal} updatePersonal={updatePersonal} />}
  </>
}

function Overview({ trip, shared, updateShared }) {
  return <>
    <section className="twoCol">
      <List title="Top Experiences" items={trip.experiences}/>
      <List title="Worth the Detour" items={trip.detours} linked/>
      <List title="Photo Stops" items={trip.photos} linked/>
      <List title="Map Ideas" items={[trip.title, ...(trip.detours || []).slice(0,3), ...(trip.photos || []).slice(0,3)]} linked/>
    </section>
    <section className="panel">
      <h2>Shared Overview Notes</h2>
      <textarea value={shared.shared_notes || ''} onChange={e=>updateShared(trip.id,{shared_notes:e.target.value})} placeholder="Why this trip matters, best timing, overall plan..." />
    </section>
    <PhotoGallery trip={trip}/>
  </>
}

function Planning({ trip, shared, updateShared }) {
  return <>
    <TripBudget tripId={trip.id} />
    <TripReservations tripId={trip.id} />
    <section className="twoCol">
      <section className="panel"><h2>Flight Notes</h2><textarea value={shared.flight_notes || ''} onChange={e=>updateShared(trip.id,{flight_notes:e.target.value})} placeholder="Airports, routes, flight times, airline notes..." /></section>
      <section className="panel"><h2>Documents</h2><textarea value={shared.document_notes || ''} onChange={e=>updateShared(trip.id,{document_notes:e.target.value})} placeholder="Tickets, passes, links, reservation details..." /></section>
      <section className="panel checklistPanel"><h2>Planning Checklist</h2><Checklist items={['Flights researched','Hotel shortlist saved','Restaurants researched','Sports venues checked','Maps saved','Packing started','Budget reviewed','Printable itinerary ready']} /></section>
      <section className="panel"><h2>Map Notes</h2><textarea value={shared.map_notes || ''} onChange={e=>updateShared(trip.id,{map_notes:e.target.value})} placeholder="Neighborhoods, scenic routes, parking, walking areas..." /></section>
    </section>
  </>
}

function Itinerary({ trip, shared, updateShared }) {
  return <>
    <ItineraryBuilder tripId={trip.id} />
    <section className="panel">
      <h2>Sample Itinerary (Reference)</h2>
      <p className="muted">Suggested itinerary from the destination guide — use it for inspiration when building your day-by-day plan above.</p>
      <ol>{trip.itinerary?.map((x,i)=><li key={i}><b>Day {i+1}:</b> {x.replace(/^Day \d+:\s*/,'')}</li>)}</ol>
    </section>
    <section className="panel">
      <h2>General Itinerary Notes</h2>
      <textarea value={shared.itinerary_notes || ''} onChange={e=>updateShared(trip.id,{itinerary_notes:e.target.value})} placeholder="Overall pacing notes, things to keep in mind, alternate plans..." />
    </section>
  </>
}

function FoodHotels({ trip, shared, updateShared }) {
  return <>
    <HotelShortlist tripId={trip.id} />
    <section className="twoCol">
      <section className="panel"><h2>Hotel Notes</h2><textarea value={shared.hotel_notes || ''} onChange={e=>updateShared(trip.id,{hotel_notes:e.target.value})} placeholder="Overall hotel strategy, neighborhoods to stay in, notes on timing..." /></section>
      <section className="panel"><h2>Restaurant Notes</h2><textarea value={shared.restaurant_notes || ''} onChange={e=>updateShared(trip.id,{restaurant_notes:e.target.value})} placeholder="Overall dining strategy, areas to eat in, reservation tips..." /></section>
    </section>
  </>
}

function Sports({ trip }) {
  return <section className="twoCol">
    <List title="Sports & Iconic Venues" items={trip.sports} linked/>
    <section className="panel">
      <h2>Sports Nearby</h2>
      <p>Use the main <b>Sports</b> tracker to add custom venues and mark them visited separately.</p>
      <ul>{trip.sports?.map(v=><li key={v}><a href={mapUrl(v)} target="_blank">{v}</a></li>)}</ul>
    </section>
  </section>
}

function PackingNotes({ trip, shared, updateShared }) {
  return <section className="twoCol">
    <section className="panel">
      <h2>Trip Packing Notes</h2>
      <textarea value={shared.packing || ''} onChange={e=>updateShared(trip.id,{packing:e.target.value})} placeholder="Trip-specific packing notes..." />
    </section>
    <section className="panel">
      <h2>Packing Manager</h2>
      <p>Use the main <b>Packing</b> page for reusable templates like Weekend Flight, Road Trip, Europe, and Golf Weekend.</p>
    </section>
  </section>
}

function Memories({ trip, shared, updateShared, setCoverPhoto, actorName }) {
  return <>
    <TripPhotos tripId={trip.id} onCoverChange={setCoverPhoto} tripTitle={trip.title} />
    <TripJournal tripId={trip.id} actorName={actorName} />
    <section className="twoCol">
      <section className="panel"><h2>Memories</h2><textarea value={shared.memories || ''} onChange={e=>updateShared(trip.id,{memories:e.target.value})} placeholder="Favorite moments, meals, photos, stories..." /></section>
      <section className="panel"><h2>Post-Trip Summary</h2><textarea value={shared.post_trip_summary || ''} onChange={e=>updateShared(trip.id,{post_trip_summary:e.target.value})} placeholder="Overall trip recap..." /></section>
      <section className="panel"><h2>What Worked</h2><textarea value={shared.what_worked || ''} onChange={e=>updateShared(trip.id,{what_worked:e.target.value})} placeholder="Best decisions, favorite places, what to repeat..." /></section>
      <section className="panel"><h2>What We'd Change</h2><textarea value={shared.what_to_change || ''} onChange={e=>updateShared(trip.id,{what_to_change:e.target.value})} placeholder="What to do differently next time..." /></section>
    </section>
  </>
}

function PersonalNotes({ trip, personal, updatePersonal }) {
  return <section className="twoCol">
    <section className="panel">
      <h2>My Wish List Notes</h2>
      <label className="toggle blockToggle"><input type="checkbox" checked={!!personal.wish_list || !!personal.want_to_visit} onChange={e=>updatePersonal(trip.id,{wish_list:e.target.checked,want_to_visit:e.target.checked})}/> Add this trip to my personal wish list</label>
      <textarea value={personal.dream_reason || ''} onChange={e=>updatePersonal(trip.id,{dream_reason:e.target.value})} placeholder="Why do I want to take this trip?" />
    </section>
    <section className="panel">
      <h2>My Must-Do List</h2>
      <textarea value={personal.must_do || ''} onChange={e=>updatePersonal(trip.id,{must_do:e.target.value})} placeholder="Personal must-do items, restaurants, venues, photos..." />
    </section>
    <section className="panel">
      <h2>My Personal Notes</h2>
      <textarea value={personal.personal_notes || ''} onChange={e=>updatePersonal(trip.id,{personal_notes:e.target.value})} placeholder="Notes just for my planning preferences..." />
    </section>
    <section className="panel">
      <h2>My Rating / Rank</h2>
      <div className="personalGrid">
        <label>Wish Rank<input type="number" value={personal.wish_rank || ''} onChange={e=>updatePersonal(trip.id,{wish_rank:Number(e.target.value) || null})} /></label>
        <label>Personal Rating<input type="number" min="1" max="5" value={personal.personal_rating || ''} onChange={e=>updatePersonal(trip.id,{personal_rating:Number(e.target.value) || null})} /></label>
      </div>
    </section>
  </section>
}

function PhotoGallery({ trip }) {
  // Generate a small grid of stable scenic photos for this destination
  const photoIds = Array.from({length: 6}, (_, i) => {
    let hash = 0;
    for (let c of `${trip.id}-photo-${i}`) hash = ((hash << 5) - hash) + c.charCodeAt(0);
    return 100 + (Math.abs(hash) % 800);
  });
  return <section className="panel">
    <h2>Destination Photos</h2>
    <p className="muted">Scenic previews. After your trip, add your own photos in the Memories tab.</p>
    <div className="photoGrid">
      {photoIds.map((pid, i) => (
        <a key={i} className="photo" href={mapUrl(trip.title)} target="_blank"
          style={{backgroundImage:`url("https://picsum.photos/id/${pid}/600/400")`}}>
        </a>
      ))}
    </div>
  </section>
}

function Checklist({ items }) {
  return <div className="checkGrid">{items.map(x => <label key={x}><input type="checkbox" /> {x}</label>)}</div>
}

function List({title,items=[],linked}) {
  return <section className="panel"><h2>{title}</h2><ul>{items.map(x=><li key={x}>{linked?<a href={mapUrl(x)} target="_blank">{x}</a>:x}</li>)}</ul></section>
}

function estimate(trip){
  const days=parseInt(String(trip.idealDays).match(/\d+/)?.[0]||5,10);
  const hotel=trip.budget==='Bucket List'?450:trip.budget==='Premium'?325:225;
  const food=trip.budget==='Bucket List'?220:trip.budget==='Premium'?175:130;
  const travel=trip.region==='United States'?700:trip.region==='Bucket List'?2200:1400;
  return (hotel+food+75)*days+travel;
}
