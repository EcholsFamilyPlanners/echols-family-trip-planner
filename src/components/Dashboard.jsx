import React from 'react';
import TripCard from './TripCard';

function Metric({value,label}){return <div className="metric"><b>{value}</b><span>{label}</span></div>}

const ACTION_ICON = {
  vote: '🗳️', wish_list: '⭐', status: '📌', note: '📝', together_note: '💬'
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Dashboard({ destinations, statusOf, favoriteOf, voteOf, openTrip, toggleFavorite, venues, activityFeed, refresh }) {
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
      <div className="panel"><h2>Idea Inbox</h2><IdeaInbox/></div>
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

    <section className="panel">
      <h2>Top Picks</h2>
      <div className="miniGrid">
        {top.slice(0,6).map(t=><TripCard key={t.id} trip={t} status={statusOf(t)} favorite={favoriteOf(t)} vote={voteOf ? voteOf(t) : null} openTrip={openTrip} toggleFavorite={toggleFavorite}/>)}
      </div>
    </section>

    <section className="panel activityPanel">
      <div className="activityHeader">
        <h2>📋 Recent Activity</h2>
        <button className="btn secondary small" onClick={refresh}>Refresh</button>
      </div>
      {activityFeed && activityFeed.length > 0 ? (
        <div className="activityList">
          {activityFeed.map(item => (
            <div className="activityItem" key={item.id}>
              <span className="activityIcon">{ACTION_ICON[item.action_type] || '📌'}</span>
              <div className="activityBody">
                <span className="activityActor">{item.actor_name}</span>
                {item.trip_title && <span className="activityTrip"> · {item.trip_title}</span>}
                {item.detail && <span className="activityDetail"> — {item.detail}</span>}
              </div>
              <span className="activityTime">{timeAgo(item.created_at)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No activity yet. Start voting on trips or updating your wish list and it will show up here.</p>
      )}
    </section>
  </>
}

// Keep idea inbox self-contained with local state to avoid prop drilling
function IdeaInbox() {
  const key = 'travelos_v3_idea_inbox';
  const [val, setVal] = React.useState(() => localStorage.getItem(key) || '');
  const save = v => { setVal(v); localStorage.setItem(key, v); };
  return <textarea value={val} onChange={e=>save(e.target.value)} placeholder="Capture trip ideas, hotels, restaurants, sports venues..."/>;
}
