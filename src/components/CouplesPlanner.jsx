import { useState } from 'react';
import TripCard from './TripCard';

const VOTE_EMOJI = { love: '❤️', like: '👍', maybe: '🤔', pass: '👋' };
const POSITIVE_VOTES = ['love', 'like'];
const VOTE_SCORE = { love: 2, like: 1, maybe: 0, pass: -1 };

export default function CouplesPlanner({
  destinations, householdMembers, allPersonalTripData, sharedTripData,
  allVotes, myVotes, togetherNotes, updateTogetherNotes,
  statusOf, favoriteOf, openTrip, toggleFavorite
}) {
  const [notes, setNotes] = useState(togetherNotes || '');
  const [saving, setSaving] = useState(false);

  const members = normalizeMembers(householdMembers, allPersonalTripData);
  const picksByUser = Object.fromEntries(members.map(m => [m.user_id, getWishTrips(destinations, allPersonalTripData, m.user_id)]));
  const bothWant = getBothWant(destinations, members, allPersonalTripData);
  const sharedQueue = destinations.filter(t => ['Considering','Top Pick','Planning','Booked','Bucket List'].includes(statusOf(t)));
  const bothLove = getBothVotedPositive(destinations, members, allVotes);
  const letsDecide = getTopCandidate(destinations, members, allVotes, statusOf);

  const votesByUser = {};
  (allVotes || []).forEach(v => {
    if (!votesByUser[v.user_id]) votesByUser[v.user_id] = {};
    votesByUser[v.user_id][v.trip_id] = v.vote;
  });

  const handleNotesSave = async () => {
    setSaving(true);
    try { await updateTogetherNotes(notes); } finally { setSaving(false); }
  };

  return (
    <>
      <section className="panel">
        <h2>Together</h2>
        <p className="muted">Shared planning notes, each person's wish list, and the trips you both love.</p>
      </section>

      {/* Shared planning notes */}
      <section className="panel togetherNotesPanel">
        <h2>📝 Shared Planning Notes</h2>
        <p className="muted">A shared space for both of you — current ideas, trips you're thinking about, things to research.</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Thinking about Scotland for next fall. Anthony wants golf, Stephanie wants castles. Need to check flight prices in January..."
          rows={5}
        />
        <button className="btn gold" onClick={handleNotesSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Notes'}
        </button>
      </section>

      {/* Let's Decide highlight */}
      {letsDecide && (
        <section className="panel letsDecidePanel">
          <h2>🎯 Let's Decide</h2>
          <p className="muted">Based on your votes and planning status, this is your strongest candidate right now.</p>
          <div className="letsDecideCard" onClick={() => openTrip(letsDecide.trip)}>
            <div>
              <h3>{letsDecide.trip.title}</h3>
              <p>{letsDecide.trip.region} · {letsDecide.trip.idealDays} · {letsDecide.trip.budget}</p>
              <p className="muted">{letsDecide.reason}</p>
            </div>
            <button className="btn gold">Open Trip →</button>
          </div>
        </section>
      )}

      {/* Trips you both love */}
      {bothLove.length > 0 && (
        <section className="panel bothLovePanel">
          <h2>❤️ Trips You Both Love</h2>
          <p className="muted">Both voted Love or Like — sorted by combined enthusiasm.</p>
          <div className="grid">
            {bothLove.map(({trip, score}) => (
              <TripCard key={trip.id} trip={trip} status={statusOf(trip)} favorite={favoriteOf(trip)} vote={myVotes?.[trip.id] || null} openTrip={openTrip} toggleFavorite={toggleFavorite}/>
            ))}
          </div>
        </section>
      )}

      {/* Side-by-side member panels */}
      <section className="couplesGrid">
        {members.map(member => (
          <PersonPanel
            key={member.user_id}
            member={member}
            trips={picksByUser[member.user_id] || []}
            allPersonalTripData={allPersonalTripData}
            votes={votesByUser[member.user_id] || {}}
            openTrip={openTrip}
          />
        ))}
      </section>

      {/* Trips both wish-listed */}
      <section className="panel">
        <h2>Trips You Both Want</h2>
        {bothWant.length ? (
          <div className="grid">
            {bothWant.map(trip => (
              <TripCard key={trip.id} trip={trip} status={statusOf(trip)} favorite={favoriteOf(trip)} vote={myVotes?.[trip.id] || null} openTrip={openTrip} toggleFavorite={toggleFavorite}/>
            ))}
          </div>
        ) : (
          <p className="muted">No overlap yet. Add trips to each person's wish list and they'll appear here.</p>
        )}
      </section>

      {/* Shared planning queue */}
      <section className="panel">
        <h2>Shared Planning Queue</h2>
        {sharedQueue.length ? (
          <div className="planningRows">
            {sharedQueue.map(trip => {
              const voteSummary = members.map(m => {
                const v = votesByUser[m.user_id]?.[trip.id];
                return v ? `${m.display_name || m.nickname || 'Traveler'}: ${VOTE_EMOJI[v]}` : null;
              }).filter(Boolean).join('  ');
              return (
                <div className="planningRow" key={trip.id} onClick={()=>openTrip(trip)}>
                  <b>{trip.title}</b>
                  <span>{statusOf(trip)} · {trip.region} · {trip.idealDays}</span>
                  {voteSummary && <span className="planningVotes">{voteSummary}</span>}
                  <small>{sharedTripData[trip.id]?.shared_notes || sharedTripData[trip.id]?.ideas || trip.summary}</small>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted">No shared planning queue yet. Mark trips as Considering, Top Pick, Planning, Booked, or Bucket List.</p>
        )}
      </section>
    </>
  );
}

function PersonPanel({ member, trips, allPersonalTripData, votes, openTrip }) {
  const voteEntries = Object.entries(votes);
  const loveLike = voteEntries.filter(([,v]) => POSITIVE_VOTES.includes(v)).length;
  return (
    <section className="panel personPanel">
      <h2>{member.display_name || member.nickname || member.email || 'Traveler'}</h2>
      <p className="muted">{trips.length} wish-list trips · {loveLike} Love/Like votes</p>
      {trips.length ? (
        <div className="personTripList">
          {trips.map((trip, i) => {
            const row = allPersonalTripData.find(x => x.user_id === member.user_id && x.trip_id === trip.id) || {};
            const vote = votes[trip.id];
            return (
              <button className="personTripRow" key={trip.id} onClick={()=>openTrip(trip)}>
                <b>{row.wish_rank || i + 1}. {trip.title} {vote ? VOTE_EMOJI[vote] : ''}</b>
                <span>{trip.region} · {trip.idealDays}</span>
                {row.dream_reason && <small><b>Why:</b> {row.dream_reason}</small>}
                {row.must_do && <small><b>Must do:</b> {row.must_do}</small>}
              </button>
            );
          })}
        </div>
      ) : (
        <p>No wish-list trips yet.</p>
      )}
      {voteEntries.length > 0 && (
        <div className="votesSummary">
          <p className="muted" style={{marginTop:'1rem'}}><b>Vote summary:</b></p>
          <div className="votePills">
            {(['love','like','maybe','pass']).map(v => {
              const count = voteEntries.filter(([,vote]) => vote === v).length;
              return count > 0 ? <span key={v} className={`votePill ${v}`}>{VOTE_EMOJI[v]} {count}</span> : null;
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function normalizeMembers(householdMembers, personalRows) {
  const real = (householdMembers || []).filter(m => m.is_active !== false);
  const hasAnthony = real.some(m => String(m.display_name || m.nickname || m.email || '').toLowerCase().includes('anthony') || String(m.email || '').toLowerCase().includes('acechols'));
  const hasStephanie = real.some(m => String(m.display_name || m.nickname || m.email || '').toLowerCase().includes('steph'));
  const result = [...real];
  if (!hasAnthony) {
    const row = (personalRows || [])[0];
    result.push({ user_id: row?.user_id || 'anthony-placeholder', display_name: 'Anthony', email: row?.email || '', placeholder: true });
  }
  if (!hasStephanie) {
    result.push({ user_id: 'stephanie-placeholder', display_name: 'Stephanie', email: '', placeholder: true });
  }
  return result.slice(0, 4);
}

function getWishTrips(destinations, rows, userId) {
  return destinations
    .filter(t => rows.some(r => r.user_id === userId && r.trip_id === t.id && (r.wish_list || r.want_to_visit || r.favorite)))
    .sort((a,b) => {
      const ar = rows.find(r => r.user_id === userId && r.trip_id === a.id)?.wish_rank || 999;
      const br = rows.find(r => r.user_id === userId && r.trip_id === b.id)?.wish_rank || 999;
      return ar - br;
    });
}

function getBothWant(destinations, members, rows) {
  if (members.length < 2) return [];
  const memberIds = members.map(m => m.user_id);
  return destinations.filter(t => memberIds.every(id =>
    rows.some(r => r.user_id === id && r.trip_id === t.id && (r.wish_list || r.want_to_visit || r.favorite))
  ));
}

function getBothVotedPositive(destinations, members, allVotes) {
  if (!allVotes || allVotes.length === 0 || members.length < 2) return [];
  const memberIds = members.map(m => m.user_id).filter(id => !id.includes('placeholder'));
  if (memberIds.length < 2) return [];
  return destinations
    .filter(t => memberIds.every(uid =>
      allVotes.some(v => v.user_id === uid && v.trip_id === t.id && POSITIVE_VOTES.includes(v.vote))
    ))
    .map(trip => {
      const score = memberIds.reduce((sum, uid) => {
        const v = allVotes.find(v => v.user_id === uid && v.trip_id === trip.id);
        return sum + (v ? (VOTE_SCORE[v.vote] || 0) : 0);
      }, 0);
      return { trip, score };
    })
    .sort((a, b) => b.score - a.score);
}

function getTopCandidate(destinations, members, allVotes, statusOf) {
  if (!allVotes || members.length < 2) return null;
  const memberIds = members.map(m => m.user_id).filter(id => !id.includes('placeholder'));
  if (memberIds.length < 2) return null;

  const STATUS_SCORE = { 'Top Pick': 3, 'Planning': 3, 'Booked': 3, 'Considering': 2, 'Bucket List': 1, 'Idea': 0 };

  const scored = destinations.map(trip => {
    const voteScore = memberIds.reduce((sum, uid) => {
      const v = allVotes.find(v => v.user_id === uid && v.trip_id === trip.id);
      return sum + (v ? (VOTE_SCORE[v.vote] || 0) : 0);
    }, 0);
    const statusScore = STATUS_SCORE[statusOf(trip)] || 0;
    const total = voteScore + statusScore;
    return { trip, voteScore, statusScore, total };
  }).filter(x => x.total > 0).sort((a, b) => b.total - a.total);

  if (!scored.length) return null;
  const top = scored[0];

  let reason = '';
  if (top.voteScore >= 4) reason = 'Both of you voted Love — this is the clear favorite.';
  else if (top.voteScore >= 3) reason = 'Strong votes from both of you.';
  else if (top.statusScore >= 3) reason = `Already marked as ${statusOf(top.trip)} — ready to plan.`;
  else reason = 'Highest combined vote and planning score.';

  return { trip: top.trip, reason };
}
