import { useState, useEffect } from 'react';
import { loadTripReservations, saveReservation, deleteReservation } from '../services/travelOsService';

const TYPES = ['Flight','Hotel','Restaurant','Activity','Car','Other'];
const TYPE_ICON = { Flight:'✈️', Hotel:'🏨', Restaurant:'🍽️', Activity:'🎯', Car:'🚗', Other:'📋' };
const STAY_TYPES = ['Hotel','Car']; // these get check-in/check-out instead of a single date
const BLANK = { name:'', res_type:'Flight', confirmation:'', res_date:'', checkout_date:'', cost:'', status:'Pending', url:'', notes:'' };

const STATUS_COLORS = { Pending:'pending', Confirmed:'confirmed', Cancelled:'cancelled' };

function money(n) {
  return Number(n||0).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

function nightsBetween(start, end) {
  if (!start || !end) return null;
  const a = new Date(start + 'T12:00:00');
  const b = new Date(end + 'T12:00:00');
  const diff = Math.round((b - a) / (1000*60*60*24));
  return diff > 0 ? diff : null;
}

export default function TripReservations({ tripId }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await loadTripReservations(tripId);
    setReservations(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tripId]);

  const save = async () => {
    if (!form?.name?.trim()) return alert('Reservation name is required.');
    await saveReservation({
      ...form,
      trip_id: tripId,
      cost: form.cost ? Number(form.cost) : null,
      res_date: form.res_date || null,
      checkout_date: STAY_TYPES.includes(form.res_type) ? (form.checkout_date || null) : null,
    });
    setForm(null);
    await load();
  };

  const remove = async (id) => {
    if (!confirm('Remove this reservation?')) return;
    await deleteReservation(id);
    await load();
  };

  const totalCost = reservations.filter(r => r.status !== 'Cancelled').reduce((s,r) => s + (Number(r.cost)||0), 0);
  const confirmed = reservations.filter(r => r.status === 'Confirmed').length;

  if (loading) return <p className="muted">Loading reservations...</p>;

  return (
    <section className="panel resPanel">
      <div className="resHeader">
        <div>
          <h2>🗓️ Reservations</h2>
          {reservations.length > 0 && (
            <p className="muted" style={{margin:'.25rem 0 0'}}>
              {confirmed} confirmed · {reservations.length} total
              {totalCost > 0 && ` · ${money(totalCost)} booked`}
            </p>
          )}
        </div>
        <button className="btn gold" onClick={() => setForm({...BLANK})}>+ Add Reservation</button>
      </div>

      {form && (
        <div className="shortlistForm">
          <h3>{form.id ? 'Edit Reservation' : 'New Reservation'}</h3>
          <div className="shortlistFormGrid">
            <label>Name *<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Delta Flight DL241"/></label>
            <label>Type
              <select value={form.res_type} onChange={e=>setForm({...form,res_type:e.target.value})}>
                {TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </label>
            <label>Confirmation #<input value={form.confirmation} onChange={e=>setForm({...form,confirmation:e.target.value})} placeholder="e.g. ABC123"/></label>

            {STAY_TYPES.includes(form.res_type) ? (
              <>
                <label>Check-in<input type="date" value={form.res_date} onChange={e=>setForm({...form,res_date:e.target.value})}/></label>
                <label>Check-out<input type="date" value={form.checkout_date} onChange={e=>setForm({...form,checkout_date:e.target.value})}/></label>
              </>
            ) : (
              <label>Date<input type="date" value={form.res_date} onChange={e=>setForm({...form,res_date:e.target.value})}/></label>
            )}

            <label>Cost ($)<input type="number" value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})} placeholder="0"/></label>
            <label>Status
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                {['Pending','Confirmed','Cancelled'].map(s=><option key={s}>{s}</option>)}
              </select>
            </label>
            <label>Website / Link<input value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://..."/></label>
          </div>
          <label>Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Seat numbers, check-in time, cancellation policy..."/></label>
          <div className="formActions">
            <button className="btn gold" onClick={save}>Save Reservation</button>
            <button className="btn secondary" onClick={()=>setForm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {reservations.length === 0 && !form && (
        <p className="muted">No reservations yet. Click Add Reservation to start tracking bookings.</p>
      )}

      <div className="resList">
        {reservations.map(r => {
          const isStay = STAY_TYPES.includes(r.res_type);
          const nights = isStay ? nightsBetween(r.res_date, r.checkout_date) : null;
          return (
            <div key={r.id} className={`resCard ${STATUS_COLORS[r.status]||''}`}>
              <div className="resCardLeft">
                <span className="resIcon">{TYPE_ICON[r.res_type]||'📋'}</span>
                <div className="resCardInfo">
                  <b>{r.name}</b>
                  <div className="resMeta">
                    {isStay ? (
                      <>
                        {r.res_date && <span>📅 {fmtDate(r.res_date)} → {r.checkout_date ? fmtDate(r.checkout_date) : '—'}</span>}
                        {nights && <span>🌙 {nights} night{nights!==1?'s':''}</span>}
                      </>
                    ) : (
                      r.res_date && <span>📅 {fmtDate(r.res_date)}</span>
                    )}
                    {r.confirmation && <span>🔑 {r.confirmation}</span>}
                    {r.cost && <span>💰 {money(r.cost)}</span>}
                  </div>
                  {r.notes && <p className="resNotes">{r.notes}</p>}
                </div>
              </div>
              <div className="resCardRight">
                <span className={`statusPill ${r.status.toLowerCase()}`}>{r.status}</span>
                <div className="resActions">
                  {r.url && <a className="btn secondary small" href={r.url} target="_blank">Link</a>}
                  <button className="btn secondary small" onClick={()=>setForm({...r, res_date: r.res_date||'', checkout_date: r.checkout_date||'', cost: r.cost??'', confirmation: r.confirmation||'', url: r.url||'', notes: r.notes||''})}>Edit</button>
                  <button className="btn secondary small danger" onClick={()=>remove(r.id)}>✕</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
