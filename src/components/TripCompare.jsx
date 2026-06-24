
import { useMemo, useState } from 'react';

const budgetScore = {
  Value: 5,
  Comfortable: 4,
  Premium: 3,
  'Bucket List': 2
};

const budgetLabel = {
  Value: '$',
  Comfortable: '$$',
  Premium: '$$$',
  'Bucket List': '$$$$'
};

export default function TripCompare({
  destinations,
  sharedTripData,
  personalTripData,
  allPersonalTripData,
  householdMembers,
  statusOf,
  openTrip
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [prefs, setPrefs] = useState({
    days: '5-7',
    season: 'Fall',
    budget: 'Comfortable',
    style: 'Food',
    sports: true,
    sharedOnly: false
  });

  const selectedTrips = destinations.filter(t => selectedIds.includes(t.id));

  const recommendations = useMemo(() => {
    return destinations
      .filter(t => !prefs.sharedOnly || ['Considering','Top Pick','Planning','Booked','Bucket List'].includes(statusOf(t)))
      .map(trip => ({
        trip,
        score: scoreTrip(trip, prefs, sharedTripData, personalTripData, allPersonalTripData, householdMembers),
        reasons: explainTrip(trip, prefs, sharedTripData, personalTripData, allPersonalTripData, householdMembers)
      }))
      .sort((a,b) => b.score - a.score)
      .slice(0, 12);
  }, [destinations, prefs, sharedTripData, personalTripData, allPersonalTripData, householdMembers]);

  const addTrip = (id) => {
    if (!id || selectedIds.includes(id)) return;
    setSelectedIds([...selectedIds, id].slice(0, 5));
  };

  const removeTrip = (id) => setSelectedIds(selectedIds.filter(x => x !== id));

  return (
    <>
      <section className="panel">
        <h2>Trip Decision Tools</h2>
        <p className="muted">Compare trips side-by-side and rank your best options by season, budget, length, travel style, sports stops, and personal wish-list interest.</p>

        <div className="decisionControls">
          <Field label="Days">
            <select value={prefs.days} onChange={e=>setPrefs({...prefs,days:e.target.value})}>
              {['3-4','5-7','8-10','10+'].map(x=><option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Season">
            <select value={prefs.season} onChange={e=>setPrefs({...prefs,season:e.target.value})}>
              {['Spring','Summer','Fall','Winter'].map(x=><option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Budget">
            <select value={prefs.budget} onChange={e=>setPrefs({...prefs,budget:e.target.value})}>
              {['Value','Comfortable','Premium','Bucket List'].map(x=><option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Style">
            <select value={prefs.style} onChange={e=>setPrefs({...prefs,style:e.target.value})}>
              {['Food','Romantic','Photography','Sports','Road Trip','Mountains','Ocean','City','History','Relaxing','National Parks','Weekend'].map(x=><option key={x}>{x}</option>)}
            </select>
          </Field>
        </div>

        <div className="toggleRow">
          <label><input type="checkbox" checked={prefs.sports} onChange={e=>setPrefs({...prefs,sports:e.target.checked})}/> Prioritize sports venues</label>
          <label><input type="checkbox" checked={prefs.sharedOnly} onChange={e=>setPrefs({...prefs,sharedOnly:e.target.checked})}/> Only shared planning picks</label>
        </div>
      </section>

      <section className="panel">
        <h2>Compare Specific Trips</h2>
        <div className="comparePicker">
          <select onChange={e=>{addTrip(e.target.value); e.target.value='';}}>
            <option value="">Add a trip to compare...</option>
            {destinations.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <button className="btn secondary" onClick={()=>setSelectedIds([])}>Clear</button>
        </div>

        {selectedTrips.length ? (
          <div className="comparisonTableWrap">
            <table className="comparisonTable">
              <thead>
                <tr>
                  <th>Factor</th>
                  {selectedTrips.map(t => <th key={t.id}>{t.title}<button className="tinyRemove" onClick={()=>removeTrip(t.id)}>×</button></th>)}
                </tr>
              </thead>
              <tbody>
                <Row label="Score">{selectedTrips.map(t => <ScoreCell key={t.id} value={scoreTrip(t,prefs,sharedTripData,personalTripData,allPersonalTripData,householdMembers)} />)}</Row>
                <Row label="Status">{selectedTrips.map(t => <td key={t.id}>{statusOf(t)}</td>)}</Row>
                <Row label="Region">{selectedTrips.map(t => <td key={t.id}>{t.region}</td>)}</Row>
                <Row label="Days">{selectedTrips.map(t => <td key={t.id}>{t.idealDays}</td>)}</Row>
                <Row label="Best Months">{selectedTrips.map(t => <td key={t.id}>{t.bestMonths}</td>)}</Row>
                <Row label="Budget">{selectedTrips.map(t => <td key={t.id}>{budgetLabel[t.budget] || t.budget}<br/><small>{t.budget}</small></td>)}</Row>
                <Row label="Best For">{selectedTrips.map(t => <td key={t.id}>{(t.styles || []).slice(0,5).join(', ')}</td>)}</Row>
                <Row label="Sports">{selectedTrips.map(t => <td key={t.id}>{(t.sports || []).slice(0,4).join(', ') || 'None listed'}</td>)}</Row>
                <Row label="Anthony/Stephanie Interest">{selectedTrips.map(t => <td key={t.id}>{interestSummary(t, allPersonalTripData, householdMembers)}</td>)}</Row>
                <Row label="Open">{selectedTrips.map(t => <td key={t.id}><button className="btn gold" onClick={()=>openTrip(t)}>Open</button></td>)}</Row>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Add 2–5 trips above to compare them side-by-side.</p>
        )}
      </section>

      <section className="panel">
        <h2>Best Matches Right Now</h2>
        <div className="recommendationRows">
          {recommendations.map(({trip, score, reasons}, index) => (
            <div className="recommendationRow" key={trip.id}>
              <div className="rankBadge">{index + 1}</div>
              <div>
                <button className="linkButton" onClick={()=>openTrip(trip)}><b>{trip.title}</b></button>
                <span>{trip.region} · {trip.idealDays} · {trip.budget} · {statusOf(trip)}</span>
                <small>{reasons.join(' · ')}</small>
              </div>
              <ScoreMeter score={score} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Field({label,children}) {
  return <label className="field">{label}{children}</label>;
}

function Row({label, children}) {
  return <tr><td><b>{label}</b></td>{children}</tr>;
}

function ScoreCell({value}) {
  return <td><ScoreMeter score={value}/></td>
}

function ScoreMeter({score}) {
  return (
    <div className="scoreMeter">
      <b>{score}</b>
      <div><span style={{width:`${Math.min(100, Math.max(0, score))}%`}} /></div>
    </div>
  );
}

function scoreTrip(trip, prefs, sharedTripData, personalTripData, allPersonalTripData, householdMembers) {
  let score = 0;

  if (trip.length?.includes(prefs.days)) score += 20;
  if (trip.seasons?.includes(prefs.season)) score += 20;
  if (trip.budget === prefs.budget) score += 15;
  else if (budgetScore[trip.budget] >= budgetScore[prefs.budget]) score += 8;

  if (trip.styles?.includes(prefs.style)) score += 15;
  if (prefs.sports && (trip.sports || []).length) score += 10;

  const sharedStatus = sharedTripData[trip.id]?.status || trip.status;
  if (sharedStatus === 'Top Pick') score += 12;
  if (sharedStatus === 'Planning' || sharedStatus === 'Booked') score += 15;
  if (sharedStatus === 'Bucket List') score += 8;

  const currentUserInterest = personalTripData[trip.id];
  if (currentUserInterest?.favorite) score += 10;
  if (currentUserInterest?.wish_list || currentUserInterest?.want_to_visit) score += 12;

  const bothWant = householdMembers?.length >= 2 && householdMembers.every(m =>
    allPersonalTripData.some(r => r.user_id === m.user_id && r.trip_id === trip.id && (r.wish_list || r.want_to_visit || r.favorite))
  );
  if (bothWant) score += 18;

  return Math.min(100, score);
}

function explainTrip(trip, prefs, sharedTripData, personalTripData, allPersonalTripData, householdMembers) {
  const reasons = [];
  if (trip.length?.includes(prefs.days)) reasons.push('fits trip length');
  if (trip.seasons?.includes(prefs.season)) reasons.push(`good for ${prefs.season}`);
  if (trip.budget === prefs.budget) reasons.push('matches budget');
  if (trip.styles?.includes(prefs.style)) reasons.push(`matches ${prefs.style}`);
  if (prefs.sports && (trip.sports || []).length) reasons.push('has sports venues');

  const bothWant = householdMembers?.length >= 2 && householdMembers.every(m =>
    allPersonalTripData.some(r => r.user_id === m.user_id && r.trip_id === trip.id && (r.wish_list || r.want_to_visit || r.favorite))
  );
  if (bothWant) reasons.push('both of you want it');

  const sharedStatus = sharedTripData[trip.id]?.status || trip.status;
  if (['Top Pick','Planning','Booked','Bucket List'].includes(sharedStatus)) reasons.push(sharedStatus);

  return reasons.length ? reasons : ['general match'];
}

function interestSummary(trip, rows, members) {
  if (!members?.length) return 'No household data yet';
  const lines = members.map(m => {
    const row = rows.find(r => r.user_id === m.user_id && r.trip_id === trip.id);
    const name = m.display_name || m.nickname || m.email || 'Traveler';
    if (!row) return `${name}: no rating`;
    const flags = [];
    if (row.favorite) flags.push('favorite');
    if (row.wish_list || row.want_to_visit) flags.push('wish list');
    if (row.personal_rating) flags.push(`${row.personal_rating}/5`);
    return `${name}: ${flags.length ? flags.join(', ') : 'not marked'}`;
  });
  return lines.join('\n');
}
