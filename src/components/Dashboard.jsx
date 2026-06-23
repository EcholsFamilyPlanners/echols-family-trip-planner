
import TripCard from './TripCard';

function Metric({ value, label }) {
  return <div className="metric"><b>{value}</b><span>{label}</span></div>
}

export default function Dashboard({ destinations, statusOf, favoriteOf, openTrip, toggleFavorite, ideaInbox, setIdeaInbox, exportData, importData }) {
  const top = destinations.filter(d => statusOf(d) === 'Top Pick');
  const bucket = destinations.filter(d => statusOf(d) === 'Bucket List');
  const fav = destinations.filter(favoriteOf);
  const visited = destinations.filter(d => statusOf(d) === 'Visited');
  const planning = destinations.filter(d => ['Planning', 'Booked'].includes(statusOf(d)));

  return (
    <>
      <section className="metrics">
        <Metric value={destinations.length} label="Trip Ideas" />
        <Metric value={top.length} label="Top Picks" />
        <Metric value={bucket.length} label="Bucket List" />
        <Metric value={fav.length} label="Favorites" />
        <Metric value={visited.length} label="Visited" />
      </section>

      <section className="split">
        <div className="panel large">
          <p className="eyebrow">Current focus</p>
          <h2>{planning[0]?.title || top[0]?.title || destinations[0]?.title}</h2>
          <p>{planning[0]?.summary || top[0]?.summary || destinations[0]?.summary}</p>
          <div className="actions">
            <button className="btn gold" onClick={() => openTrip(planning[0] || top[0] || destinations[0])}>Open Trip</button>
            <button className="btn secondary" onClick={exportData}>Export Data</button>
            <label className="btn secondary">Import Data<input hidden type="file" accept=".json" onChange={(e) => importData(e.target.files[0])} /></label>
          </div>
        </div>

        <div className="panel">
          <h2>Idea Inbox</h2>
          <textarea value={ideaInbox} onChange={(e) => setIdeaInbox(e.target.value)} placeholder="Add restaurants, destinations, flights, hotels, sports venues, or reminders..." />
        </div>
      </section>

      <section className="panel">
        <h2>Visited Trips</h2>
        {visited.length ? <div className="miniGrid">{visited.map(t => <TripCard key={t.id} trip={t} status={statusOf(t)} favorite={favoriteOf(t)} openTrip={openTrip} toggleFavorite={toggleFavorite} />)}</div> : <p className="muted">No visited trips yet. Open a trip and set status to Visited.</p>}
      </section>

      <section className="panel">
        <h2>Top Picks</h2>
        <div className="miniGrid">{top.slice(0, 6).map(t => <TripCard key={t.id} trip={t} status={statusOf(t)} favorite={favoriteOf(t)} openTrip={openTrip} toggleFavorite={toggleFavorite} />)}</div>
      </section>
    </>
  );
}
