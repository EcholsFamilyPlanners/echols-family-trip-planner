import React, { useState } from 'react';
import TripCard from './TripCard';

function Metric({value,label}){return <div className="metric"><b>{value}</b><span>{label}</span></div>}

const ACTION_ICON = { vote:'🗳️', wish_list:'⭐', status:'📌', note:'📝', together_note:'💬' };
const VOTE_ORDER = { love: 0, like: 1, maybe: 2, pass: 3, null: 4 };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs/24)}d ago`;
}

export default function Dashboard({ destinations, statusOf, favoriteOf, voteOf, coverPhotos, openTrip, toggleFavorite, venues, activityFeed, refresh }) {
  const [tab, setTab] = useState('overview');

  const top = destinations.filter(d=>statusOf(d)==='Top Pick');
  const visited = destinations.filter(d=>statusOf(d)==='Visited');
  const bucket = destinations.filter(d=>statusOf(d)==='Bucket List');
  const favorites = destinations.filter(favoriteOf);
  const venueVisited = venues.filter(v=>v.visited).length;
  const myLoved = destinations.filter(d => voteOf && ['love','like'].includes(voteOf(d)));

  // Ranked trips — all voted trips sorted by vote then status
  const STATUS_SCORE = { 'Top Pick':3,'Planning':3,'Booked':3,'Considering':2,'Bucket List':1 };
  const rankedTrips = destinations
    .filter(d => voteOf && voteOf(d))
    .sort((a, b) => {
      const va = VOTE_ORDER[voteOf(a)] ?? 4;
      const vb = VOTE_ORDER[voteOf(b)] ?? 4;
      if (va !== vb) return va - vb;
      return (STATUS_SCORE[statusOf(b)]||0) - (STATUS_SCORE[statusOf(a)]||0);
    });

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

    {/* Dashboard tabs */}
    <section className="panel dashTabs">
      <div className="tabs">
        <button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>Overview</button>
        <button className={tab==='ranked'?'active':''} onClick={()=>setTab('ranked')}>
          Ranked Trips {rankedTrips.length > 0 && <span className="tabBadge">{rankedTrips.length}</span>}
        </button>
        <button className={tab==='activity'?'active':''} onClick={()=>setTab('activity')}>Recent Activity</button>
      </div>

      {tab === 'overview' && <>
        {myLoved.length > 0 && (
          <div style={{marginTop:'1rem'}}>
            <h3>❤️ My Loved Trips</h3>
            <p className="muted">Trips you voted Love or Like.</p>
            <div className="miniGrid">
              {myLoved.map(t=><TripCard key={t.id} trip={t} status={statusOf(t)} favorite={favoriteOf(t)} vote={voteOf(t)} coverPhoto={coverPhotos?.[t.id]} openTrip={openTrip} toggleFavorite={toggleFavorite}/>)}
            </div>
          </div>
        )}
        <div style={{marginTop:'1.5rem'}}>
          <h3>Top Picks</h3>
          <div className="miniGrid">
            {top.slice(0,6).map(t=><TripCard key={t.id} trip={t} status={statusOf(t)} favorite={favoriteOf(t)} vote={voteOf?voteOf(t):null} coverPhoto={coverPhotos?.[t.id]} openTrip={openTrip} toggleFavorite={toggleFavorite}/>)}
          </div>
        </div>
      </>}

      {tab === 'ranked' && (
        <div style={{marginTop:'1rem'}}>
          <p className="muted">All trips you've voted on, ranked by your enthusiasm. Go to the <b>Decision Engine</b> to find new matches.</p>
          {rankedTrips.length === 0 ? (
            <p className="muted">No votes yet. Open any trip and cast a vote to see it here.</p>
          ) : (
            <div className="rankedList">
              {rankedTrips.map((t, i) => {
                const vote = voteOf(t);
                const EMOJI = { love:'❤️', like:'👍', maybe:'🤔', pass:'👋' };
                return (
                  <div className="rankedRow" key={t.id} onClick={()=>openTrip(t)}>
                    <span className="rankedNum">{i+1}</span>
                    <span className="rankedEmoji">{EMOJI[vote]}</span>
                    <div className="rankedInfo">
                      <b>{t.title}</b>
                      <span>{t.region} · {t.idealDays} · {statusOf(t)}</span>
                    </div>
                    <span className="rankedBudget">{t.budget}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div style={{marginTop:'1rem'}}>
          <div className="activityHeader">
            <span/>
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
            <p className="muted">No activity yet. Start voting on trips and it will show up here.</p>
          )}
        </div>
      )}
    </section>
  </>
}

function IdeaInbox() {
  const key = 'travelos_v3_idea_inbox';
  const [val, setVal] = React.useState(() => localStorage.getItem(key) || '');
  const save = v => { setVal(v); localStorage.setItem(key, v); };
  return <textarea value={val} onChange={e=>save(e.target.value)} placeholder="Capture trip ideas, hotels, restaurants, sports venues..."/>;
}
