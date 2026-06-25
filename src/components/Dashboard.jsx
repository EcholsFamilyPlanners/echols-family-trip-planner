import TripCard from './TripCard';

function Metric({value,label}){return <div className="metric"><b>{value}</b><span>{label}</span></div>}

export default function Dashboard({ destinations, statusOf, favoriteOf, voteOf, openTrip, toggleFavorite, venues, packingItems, ideaInbox, setIdeaInbox }) {
  const top = destinations.filter(d=>statusOf(d)==='Top Pick');
  const visited = destinations.filter(d=>statusOf(d)==='Visited');
  const bucket = destinations.filter(d=>statusOf(d)==='Bucket List');
  const favorites = destinations.filter(favoriteOf);
  const venueVisited = venues.filter(v=>v.visited).length;
  const myLoved = destinations.filter(d => voteOf && ['love','like'].includes(voteOf(d)));

  return <>
    <section className="metrics">
      <Metric value={destinations.length} label="Trip Ideas"/>
      <Metric value={top.length} label="Top Picks"/>
      <Metric value={bucket.length} label="Bucket List"/>
      <Metric value={favorites.length} label="Favorites"/>
      <Metric value={visited.length} label="Visited Trips"/>
      <Metric value={venueVisited} label="Venues Visited"/>
    </section>
    <section className="split">
      <div className="panel large"><p className="eyebrow">Travel OS</p><h2>{top[0]?.title || destinations[0]?.title}</h2><p>{top[0]?.summary || destinations[0]?.summary}</p></div>
      <div className="panel"><h2>Idea Inbox</h2><textarea value={ideaInbox} onChange={e=>setIdeaInbox(e.target.value)} placeholder="Capture trip ideas, hotels, restaurants, sports venues..."/></div>
    </section>
    {myLoved.length > 0 && (
      <section className="panel">
        <h2>❤️ My Loved Trips</h2>
        <p className="muted">Trips you voted Love or Like.</p>
        <div className="miniGrid">
          {myLoved.map(t=><TripCard key={t.id} trip={t} status={statusOf(t)} favorite={favoriteOf(t)} vote={voteOf(t)} openTrip={openTrip} toggleFavorite={toggleFavorite}/>)}
        </div>
      </section>
    )}
    <section className="panel"><h2>Top Picks</h2><div className="miniGrid">{top.slice(0,6).map(t=><TripCard key={t.id} trip={t} status={statusOf(t)} favorite={favoriteOf(t)} vote={voteOf ? voteOf(t) : null} openTrip={openTrip} toggleFavorite={toggleFavorite}/>)}</div></section>
  </>
}
