
import { useState } from 'react';
import { createHouseholdMemberByEmail, saveHouseholdMember, unarchiveTrip } from '../services/travelOsService';

export default function People({ householdMembers, session, refresh, destinations, archivedIds, allDestinations }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ email:'', display_name:'', nickname:'' });
  const [restoring, setRestoring] = useState(null);

  const save = async (member) => {
    await saveHouseholdMember(member);
    setEditing(null);
    await refresh();
  };

  const addPlaceholder = async () => {
    if (!form.email.trim()) return alert('Add an email address.');
    await createHouseholdMemberByEmail(form);
    setForm({ email:'', display_name:'', nickname:'' });
    await refresh();
  };

  const restore = async (tripId) => {
    setRestoring(tripId);
    try {
      await unarchiveTrip(tripId);
      await refresh();
    } finally {
      setRestoring(null);
    }
  };

  const archivedTrips = (allDestinations || []).filter(d => (archivedIds || []).includes(d.id));

  return (
    <>
      <section className="panel">
        <h2>People & Household</h2>
        <p className="muted">Set up Anthony and Stephanie here so the Together page can reliably show both wish lists and notes.</p>
      </section>

      <section className="peopleGrid">
        {householdMembers.map(member => (
          <section className="panel personEditPanel" key={member.id || member.user_id || member.email}>
            {editing === (member.id || member.user_id || member.email) ? (
              <EditMember member={member} save={save} cancel={()=>setEditing(null)} />
            ) : (
              <>
                <h2>{member.display_name || member.nickname || member.email || 'Traveler'}</h2>
                <p><b>Email:</b> {member.email || 'Not linked yet'}</p>
                <p><b>Nickname:</b> {member.nickname || 'Not set'}</p>
                <p><b>Role:</b> {member.role || 'member'}</p>
                <p><b>Status:</b> {member.user_id ? 'Signed-in account linked' : 'Placeholder / waiting for sign in'}</p>
                <button className="btn gold" onClick={()=>setEditing(member.id || member.user_id || member.email)}>Edit</button>
              </>
            )}
          </section>
        ))}
      </section>

      <section className="panel">
        <h2>Add Stephanie / Household Member</h2>
        <p className="muted">Use this if Stephanie signed in but does not appear, or if you want to create a placeholder before she signs in.</p>
        <div className="peopleAdd">
          <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="email@example.com" />
          <input value={form.display_name} onChange={e=>setForm({...form,display_name:e.target.value})} placeholder="Display name, e.g. Stephanie" />
          <input value={form.nickname} onChange={e=>setForm({...form,nickname:e.target.value})} placeholder="Nickname" />
          <button className="btn gold" onClick={addPlaceholder}>Add Person</button>
        </div>
      </section>

      <section className="panel">
        <h2>🗄️ Archived Trips</h2>
        <p className="muted">Built-in trips you removed from your library. Your notes, votes, and photos for these are safe and waiting if you want them back.</p>
        {archivedTrips.length === 0 ? (
          <p className="muted">No archived trips.</p>
        ) : (
          <div className="archivedList">
            {archivedTrips.map(trip => (
              <div className="archivedRow" key={trip.id}>
                <div>
                  <b>{trip.title}</b>
                  <span className="muted"> · {trip.region}</span>
                </div>
                <button className="btn gold small" onClick={()=>restore(trip.id)} disabled={restoring===trip.id}>
                  {restoring===trip.id ? 'Restoring...' : 'Restore'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function EditMember({ member, save, cancel }) {
  const [draft, setDraft] = useState({
    ...member,
    display_name: member.display_name || '',
    nickname: member.nickname || '',
    email: member.email || '',
    role: member.role || 'member',
    is_active: member.is_active !== false
  });

  return (
    <>
      <h2>Edit Person</h2>
      <div className="peopleForm">
        <label>Display Name<input value={draft.display_name} onChange={e=>setDraft({...draft,display_name:e.target.value})}/></label>
        <label>Nickname<input value={draft.nickname} onChange={e=>setDraft({...draft,nickname:e.target.value})}/></label>
        <label>Email<input value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})}/></label>
        <label>Role<input value={draft.role} onChange={e=>setDraft({...draft,role:e.target.value})}/></label>
      </div>
      <div className="actions">
        <button className="btn gold" onClick={()=>save(draft)}>Save</button>
        <button className="btn secondary" onClick={cancel}>Cancel</button>
      </div>
    </>
  );
}
