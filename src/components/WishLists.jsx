
import { useMemo, useState } from 'react';
import TripCard from './TripCard';

export default function WishLists({ destinations, personalTripData, sharedTripData, statusOf, favoriteOf, openTrip, toggleFavorite, updatePersonal }) {
  const [active, setActive] = useState('mine');

  const myWishList = useMemo(() =>
    destinations
      .filter(t => personalTripData[t.id]?.wish_list || personalTripData[t.id]?.want_to_visit)
      .sort((a,b) => (personalTripData[a.id]?.wish_rank || 999) - (personalTripData[b.id]?.wish_rank || 999)),
    [destinations, personalTripData]
  );

  const favorites = useMemo(() => destinations.filter(favoriteOf), [destinations, personalTripData]);
  const topShared = useMemo(() => destinations.filter(t => ['Top Pick','Planning','Booked','Bucket List'].includes(statusOf(t))), [destinations, sharedTripData]);

  const notYetPicked = destinations.filter(t => !personalTripData[t.id]?.wish_list && !personalTripData[t.id]?.want_to_visit).slice(0, 24);

  return (
    <>
      <section className="panel">
        <h2>Anthony & Stephanie Wish Lists</h2>
        <p className="muted">This is the personal planning space. Each person can mark trips as their own wish-list picks, add personal notes, rank ideas, and still keep shared trip notes separate.</p>
        <div className="notebookTabs">
          <button className={active==='mine'?'active':''} onClick={()=>setActive('mine')}>My Wish List</button>
          <button className={active==='favorites'?'active':''} onClick={()=>setActive('favorites')}>My Favorites</button>
          <button className={active==='shared'?'active':''} onClick={()=>setActive('shared')}>Shared Picks</button>
          <button className={active==='add'?'active':''} onClick={()=>setActive('add')}>Add Ideas</button>
        </div>
      </section>

      {active === 'mine' && (
        <section className="panel">
          <h2>My Wish List</h2>
          {myWishList.length ? (
            <div className="wishListRows">
              {myWishList.map((trip, index) => (
                <WishRow
                  key={trip.id}
                  trip={trip}
                  index={index}
                  data={personalTripData[trip.id] || {}}
                  openTrip={openTrip}
                  updatePersonal={updatePersonal}
                />
              ))}
            </div>
          ) : (
            <p className="muted">No personal wish-list trips yet. Use “Add Ideas” to add trips to your list.</p>
          )}
        </section>
      )}

      {active === 'favorites' && (
        <section className="grid">
          {favorites.length ? favorites.map(t => (
            <TripCard key={t.id} trip={t} status={statusOf(t)} favorite={favoriteOf(t)} openTrip={openTrip} toggleFavorite={toggleFavorite}/>
          )) : <div className="panel"><p>No favorites yet.</p></div>}
        </section>
      )}

      {active === 'shared' && (
        <section className="grid">
          {topShared.map(t => (
            <TripCard key={t.id} trip={t} status={statusOf(t)} favorite={favoriteOf(t)} openTrip={openTrip} toggleFavorite={toggleFavorite}/>
          ))}
        </section>
      )}

      {active === 'add' && (
        <section className="panel">
          <h2>Add Trips to My Wish List</h2>
          <div className="wishAddGrid">
            {notYetPicked.map(trip => (
              <div className="wishAddCard" key={trip.id}>
                <div>
                  <b>{trip.title}</b>
                  <span>{trip.region} · {trip.idealDays}</span>
                </div>
                <button className="btn gold" onClick={()=>updatePersonal(trip.id,{wish_list:true,want_to_visit:true,wish_rank:myWishList.length+1})}>Add</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function WishRow({ trip, index, data, openTrip, updatePersonal }) {
  const [notes, setNotes] = useState(data.personal_notes || '');
  const [reason, setReason] = useState(data.dream_reason || '');
  const [mustDo, setMustDo] = useState(data.must_do || '');

  const saveNotes = () => updatePersonal(trip.id, {
    personal_notes: notes,
    dream_reason: reason,
    must_do: mustDo
  });

  return (
    <div className="wishRow">
      <div className="wishRank">{data.wish_rank || index + 1}</div>
      <div className="wishMain">
        <button className="linkButton" onClick={()=>openTrip(trip)}><b>{trip.title}</b></button>
        <span>{trip.region} · {trip.subregion} · {trip.idealDays}</span>
        <div className="wishFields">
          <label>Why I want to go<textarea value={reason} onChange={e=>setReason(e.target.value)} onBlur={saveNotes} placeholder="What makes this appealing?" /></label>
          <label>Must-do items<textarea value={mustDo} onChange={e=>setMustDo(e.target.value)} onBlur={saveNotes} placeholder="Restaurants, stadiums, tours, photos..." /></label>
          <label>Personal notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} onBlur={saveNotes} placeholder="Private/personal planning notes..." /></label>
        </div>
      </div>
      <div className="wishActions">
        <button className="btn secondary" onClick={()=>updatePersonal(trip.id,{wish_list:false,want_to_visit:false})}>Remove</button>
        <button className="btn secondary" onClick={()=>updatePersonal(trip.id,{wish_rank:Math.max(1,(data.wish_rank || index+1)-1)})}>Rank ↑</button>
        <button className="btn secondary" onClick={()=>updatePersonal(trip.id,{wish_rank:(data.wish_rank || index+1)+1})}>Rank ↓</button>
      </div>
    </div>
  );
}
