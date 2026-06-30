
import { useState, useEffect } from 'react';
import { createHouseholdMemberByEmail, saveHouseholdMember, unarchiveTrip, loadSkylightFrames, saveSkylightFrame, deleteSkylightFrame } from '../services/travelOsService';

export default function People({ householdMembers, session, refresh, destinations, archivedIds, allDestinations }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ email:'', display_name:'', nickname:'' });
  const [restoring, setRestoring] = useState(null);
  const [frames, setFrames] = useState([]);
  const [frameForm, setFrameForm] = useState(null);

  const loadFrames = async () => setFrames(await loadSkylightFrames());
  useEffect(() => { loadFrames(); }, []);

  const saveFrame = async () => {
    if (!frameForm?.name?.trim() || !frameForm?.email?.trim()) return alert('Name and email are required.');
    await saveSkylightFrame(frameForm);
    setFrameForm(null);
    await loadFrames();
  };

  const removeFrame = async (id) => {
    if (!confirm('Remove this frame?')) return;
    await deleteSkylightFrame(id);
    await loadFrames();
  };

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

      <section className="panel">
        <h2>🖼️ Skylight Frames</h2>
        <p className="muted">Add your Skylight frame email addresses here so you can send trip photos straight to them from the Memories tab.</p>

        {frameForm && (
          <div className="shortlistForm">
            <h3>{frameForm.id ? 'Edit Frame' : 'New Frame'}</h3>
            <div className="shortlistFormGrid">
              <label>Frame Name<input value={frameForm.name} onChange={e=>setFrameForm({...frameForm,name:e.target.value})} placeholder="e.g. Mom & Dad's Kitchen"/></label>
              <label>Frame Email<input value={frameForm.email} onChange={e=>setFrameForm({...frameForm,email:e.target.value})} placeholder="abc123@ourskylight.com"/></label>
            </div>
            <label className="toggle" style={{margin:'.5rem 0'}}>
              <input type="checkbox" checked={!!frameForm.auto_send} onChange={e=>setFrameForm({...frameForm,auto_send:e.target.checked})}/> Auto-send new trip photos to this frame
            </label>
            <div className="formActions">
              <button className="btn gold" onClick={saveFrame}>Save Frame</button>
              <button className="btn secondary" onClick={()=>setFrameForm(null)}>Cancel</button>
            </div>
          </div>
        )}

        {frames.length === 0 && !frameForm && <p className="muted">No frames added yet.</p>}

        <div className="archivedList">
          {frames.map(f => (
            <div className="archivedRow" key={f.id}>
              <div>
                <b>{f.name}</b>
                <span className="muted"> · {f.email}</span>
                {f.auto_send && <span className="votePill love" style={{marginLeft:'.5rem'}}>Auto-send</span>}
              </div>
              <div style={{display:'flex',gap:'.4rem'}}>
                <button className="btn secondary small" onClick={()=>setFrameForm({...f})}>Edit</button>
                <button className="btn secondary small danger" onClick={()=>removeFrame(f.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>

        {!frameForm && (
          <button className="btn gold" style={{marginTop:'1rem'}} onClick={()=>setFrameForm({name:'',email:'',auto_send:false})}>+ Add Frame</button>
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
