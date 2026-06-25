import TripCard from './TripCard';

const VOTE_EMOJI = { love: '❤️', like: '👍', maybe: '🤔', pass: '👋' };
const POSITIVE_VOTES = ['love', 'like'];

export default function CouplesPlanner({
  destinations,
  householdMembers,
  allPersonalTripData,
  sharedTripData,
  allVotes,
  myVotes,
  statusOf,
  favoriteOf,
  openTrip,
  toggleFavorite
}) {
  const members = normalizeMembers(householdMembers, allPersonalTripData);
  const picksByUser = Object.fromEntries(members.map(m => [m.user_id, getWishTrips(destinations, allPersonalTripData, m.user_id)]));
  const bothWant = getBothWant(destinations, members, allPersonalTripData);
  const sharedQueue = destinations.filter(t => ['Considering','Top Pick','Planning','Booked','Bucket List'].includes(statusOf(t)));

  // Trips where both members voted love or like
  const bothLove = getBothVotedPositive(destinations, members, allVotes);

  // Per-member vote map for display
  const votesByUser = {};
  (allVotes || []).forEach(v => {
    if (!votesByUser[v.user_id]) votesByUser[v.user_id] = {};
    votesByUser[v.user_id][v.trip_id] = v.vote;
  });

  return (
    <>
      <section className="panel">
        <h2>Together</h2>
        <p className="muted">Each person's wish list, vote summaries, and the trips you both want to take.</p>
      </section>

      {/* Both voted Love or Like */}
      {bothLove.length > 0 && (
        <section className="panel bothLovePanel">
          <h2>❤️ Trips You Both Love</h2>
          <p className="muted">Both Anthony and Stephanie voted Love or Like on these trips.</p>
          <div className="grid">
            {bothLove.map(trip => (
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
          <p className="muted">No overlap yet. Add trips to each person's wish list and they'll appear here when both of you want the same destination.</p>
        )}
      </section>

      <section className="panel">
        <h2>Shared Planning Queue</h2>
        {sharedQueue.length ? (
          <div className="planningRows">
            {sharedQueue.map(trip => {
              // Show how each member voted
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
                {row.personal_notes && <small><b>Notes:</b> {row.personal_notes}</small>}
              </button>
            );
          })}
        </div>
      ) : (
        <p>No wish-list trips yet.</p>
      )}

      {voteEntries.length > 0 && (
        <div className="votesSummary">
          <p className="muted" style={{marginTop:'1rem'}}><b>Recent votes:</b></p>
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
  return destinations.filter(t =>
    memberIds.every(uid =>
      allVotes.some(v => v.user_id === uid && v.trip_id === t.id && POSITIVE_VOTES.includes(v.vote))
    )
  );
}
