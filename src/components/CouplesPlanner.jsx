
import TripCard from './TripCard';

export default function CouplesPlanner({
  destinations,
  householdMembers,
  allPersonalTripData,
  sharedTripData,
  statusOf,
  favoriteOf,
  openTrip,
  toggleFavorite
}) {
  const members = normalizeMembers(householdMembers, allPersonalTripData);
  const picksByUser = Object.fromEntries(members.map(m => [m.user_id, getWishTrips(destinations, allPersonalTripData, m.user_id)]));
  const bothWant = getBothWant(destinations, members, allPersonalTripData);
  const sharedQueue = destinations.filter(t => ['Considering','Top Pick','Planning','Booked','Bucket List'].includes(statusOf(t)));

  return (
    <>
      <section className="panel">
        <h2>Couples Planner</h2>
        <p className="muted">This section is focused on functionality: each person’s wish list and personal notes, plus the trips you both want to consider together.</p>
      </section>

      <section className="couplesGrid">
        {members.map(member => (
          <PersonPanel
            key={member.user_id}
            member={member}
            trips={picksByUser[member.user_id] || []}
            allPersonalTripData={allPersonalTripData}
            openTrip={openTrip}
          />
        ))}
      </section>

      <section className="panel">
        <h2>Trips You Both Want</h2>
        {bothWant.length ? (
          <div className="grid">
            {bothWant.map(trip => (
              <TripCard key={trip.id} trip={trip} status={statusOf(trip)} favorite={favoriteOf(trip)} openTrip={openTrip} toggleFavorite={toggleFavorite}/>
            ))}
          </div>
        ) : (
          <p className="muted">No overlap yet. Add trips to each person’s wish list and they’ll appear here when both of you want the same destination.</p>
        )}
      </section>

      <section className="panel">
        <h2>Shared Planning Queue</h2>
        {sharedQueue.length ? (
          <div className="planningRows">
            {sharedQueue.map(trip => (
              <div className="planningRow" key={trip.id} onClick={()=>openTrip(trip)}>
                <b>{trip.title}</b>
                <span>{statusOf(trip)} · {trip.region} · {trip.idealDays}</span>
                <small>{sharedTripData[trip.id]?.shared_notes || sharedTripData[trip.id]?.ideas || trip.summary}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No shared planning queue yet. Mark trips as Considering, Top Pick, Planning, Booked, or Bucket List.</p>
        )}
      </section>
    </>
  );
}

function PersonPanel({ member, trips, allPersonalTripData, openTrip }) {
  return (
    <section className="panel personPanel">
      <h2>{member.display_name || member.nickname || member.email || 'Traveler'}</h2>
      <p className="muted">{trips.length} wish-list trips</p>

      {trips.length ? (
        <div className="personTripList">
          {trips.map((trip, i) => {
            const row = allPersonalTripData.find(x => x.user_id === member.user_id && x.trip_id === trip.id) || {};
            return (
              <button className="personTripRow" key={trip.id} onClick={()=>openTrip(trip)}>
                <b>{row.wish_rank || i + 1}. {trip.title}</b>
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
    </section>
  );
}

function normalizeMembers(householdMembers, personalRows) {
  if (householdMembers?.length) return householdMembers;

  const ids = [...new Set((personalRows || []).map(x => x.user_id).filter(Boolean))];
  return ids.map((id, index) => ({
    user_id: id,
    display_name: index === 0 ? 'Anthony' : index === 1 ? 'Stephanie' : `Traveler ${index + 1}`,
    email: ''
  }));
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
