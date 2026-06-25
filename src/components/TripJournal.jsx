import { useState, useEffect } from 'react';
import { loadTripJournal, saveJournalEntry, deleteJournalEntry } from '../services/travelOsService';

const BLANK = { entry_date: '', title: '', body: '', rating: '', author_name: '' };
const STARS = [1,2,3,4,5];

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday:'long', month:'long', day:'numeric', year:'numeric'
  });
}

export default function TripJournal({ tripId, actorName }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await loadTripJournal(tripId);
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tripId]);

  const save = async () => {
    if (!form?.body?.trim()) return alert('Journal entry cannot be empty.');
    if (!form?.entry_date) return alert('Please add a date for this entry.');
    await saveJournalEntry({
      ...form,
      trip_id: tripId,
      author_name: actorName || form.author_name || 'Traveler',
      rating: form.rating ? Number(form.rating) : null,
    });
    setForm(null);
    await load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this journal entry?')) return;
    await deleteJournalEntry(id);
    if (expanded === id) setExpanded(null);
    await load();
  };

  if (loading) return <p className="muted">Loading journal...</p>;

  return (
    <section className="panel journalPanel">
      <div className="journalHeader">
        <div>
          <h2>📓 Trip Journal</h2>
          <p className="muted">{entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button className="btn gold" onClick={() => setForm({...BLANK, entry_date: today()})}>
          + Add Entry
        </button>
      </div>

      {form && (
        <div className="shortlistForm">
          <h3>{form.id ? 'Edit Entry' : 'New Journal Entry'}</h3>
          <div className="shortlistFormGrid">
            <label>Date *<input type="date" value={form.entry_date} onChange={e=>setForm({...form,entry_date:e.target.value})}/></label>
            <label>Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Day 1 — Arrived in Quebec City"/></label>
          </div>
          <label style={{display:'flex',flexDirection:'column',gap:'.3rem',marginBottom:'.75rem'}}>
            How was it?
            <div className="journalStars">
              {STARS.map(s => (
                <button
                  key={s}
                  className={`starBtn ${Number(form.rating) >= s ? 'on' : ''}`}
                  onClick={() => setForm({...form, rating: form.rating == s ? '' : s})}
                  type="button"
                >★</button>
              ))}
              {form.rating && <span className="muted" style={{fontSize:'.82rem',marginLeft:'.25rem'}}>{ratingLabel(form.rating)}</span>}
            </div>
          </label>
          <label style={{display:'flex',flexDirection:'column',gap:'.3rem'}}>
            Journal Entry *
            <textarea
              value={form.body}
              onChange={e=>setForm({...form,body:e.target.value})}
              placeholder="Write about your day — what you saw, ate, felt, experienced..."
              rows={6}
              style={{resize:'vertical'}}
            />
          </label>
          <div className="formActions" style={{marginTop:'.75rem'}}>
            <button className="btn gold" onClick={save}>Save Entry</button>
            <button className="btn secondary" onClick={()=>setForm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {entries.length === 0 && !form && (
        <div className="journalEmpty">
          <span>📓</span>
          <p>No journal entries yet.</p>
          <small>After your trip, write about each day — the highlights, the meals, the moments you want to remember.</small>
        </div>
      )}

      <div className="journalTimeline">
        {entries.map((entry, i) => (
          <div key={entry.id} className="journalEntry">
            <div className="journalEntryDot">
              <div className="dot"/>
              {i < entries.length - 1 && <div className="line"/>}
            </div>
            <div className="journalEntryBody">
              <div className="journalEntryHeader" onClick={()=>setExpanded(expanded===entry.id?null:entry.id)}>
                <div>
                  <p className="journalDate">{formatDate(entry.entry_date)}</p>
                  {entry.title && <h3>{entry.title}</h3>}
                  {entry.rating && <div className="journalRating">{'★'.repeat(entry.rating)}<span className="muted">{'★'.repeat(5-entry.rating)}</span></div>}
                </div>
                <div className="journalEntryMeta">
                  {entry.author_name && <span className="journalAuthor">{entry.author_name}</span>}
                  <span className="journalToggle">{expanded===entry.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === entry.id && (
                <div className="journalEntryContent">
                  <p>{entry.body}</p>
                  <div className="journalEntryActions">
                    <button className="btn secondary small" onClick={()=>setForm({...entry, rating: entry.rating||''})}>Edit</button>
                    <button className="btn secondary small danger" onClick={()=>remove(entry.id)}>Delete</button>
                  </div>
                </div>
              )}

              {expanded !== entry.id && (
                <p className="journalPreview">{entry.body.slice(0,120)}{entry.body.length > 120 ? '...' : ''}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function today() {
  return new Date().toISOString().slice(0,10);
}

function ratingLabel(r) {
  return ['','Disappointing','Could be better','Good','Great','Amazing!'][Number(r)] || '';
}
