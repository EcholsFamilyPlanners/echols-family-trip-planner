import { useState, useMemo } from 'react';
import { img } from '../utils/helpers';

const VOTE_SCORE  = { love: 3, like: 2, maybe: 1, pass: -2 };
const STATUS_SCORE = { 'Top Pick': 2, 'Planning': 2, 'Booked': 2, 'Considering': 1, 'Bucket List': 1 };
const DRIVE_REGIONS = ['United States']; // only US trips are realistically driveable

const INTERESTS = [
  { id: 'Golf',          label: '⛳ Golf' },
  { id: 'National Parks',label: '🏔️ National Parks' },
  { id: 'Food',          label: '🍽️ Food & Restaurants' },
  { id: 'History',       label: '🏛️ History & Culture' },
  { id: 'Beach',         label: '🏖️ Beaches' },
  { id: 'Relaxing',      label: '😌 Relaxation' },
  { id: 'City',          label: '🌆 Cities' },
  { id: 'Sports',        label: '🏟️ Sports Venues' },
  { id: 'Romantic',      label: '💑 Romantic' },
  { id: 'Mountains',     label: '⛰️ Mountains' },
  { id: 'Road Trip',     label: '🚗 Road Trip' },
  { id: 'Photography',   label: '📷 Photography' },
];

function scoreTrip({ trip, prefs, myVotes, allVotes, allPersonalTripData, householdMembers, statusOf }) {
  let score = 0;
  const reasons = [];
  const misses = [];

  // --- Season (20 pts) ---
  if (prefs.season && trip.seasons?.includes(prefs.season)) {
    score += 20; reasons.push(`Great in ${prefs.season}`);
  } else if (prefs.season) {
    misses.push(`Not ideal in ${prefs.season}`);
  }

  // --- Days (20 pts) ---
  if (prefs.days && trip.length?.includes(prefs.days)) {
    score += 20; reasons.push(`Perfect for ${prefs.days} days`);
  } else if (prefs.days) {
    misses.push(`Usually needs more or fewer days`);
  }

  // --- Budget (15 pts) ---
  if (prefs.budget && trip.budget === prefs.budget) {
    score += 15; reasons.push(`Fits ${prefs.budget} budget`);
  } else if (prefs.budget === 'Comfortable' && trip.budget === 'Value') {
    score += 10; reasons.push('Under budget');
  } else if (prefs.budget) {
    misses.push(`Budget is ${trip.budget}`);
  }

  // --- Fly vs Drive (10 pts) ---
  if (prefs.transport === 'drive') {
    if (DRIVE_REGIONS.includes(trip.region)) {
      score += 10; reasons.push('Driveable from the US');
    } else {
      score -= 5; misses.push('Requires flying internationally');
    }
  } else if (prefs.transport === 'fly') {
    score += 5; // neutral bonus for any trip when flying
  }

  // --- Interests (up to 20 pts) ---
  const matchedInterests = (prefs.interests || []).filter(i =>
    trip.styles?.includes(i) ||
    (i === 'Golf' && trip.sports?.some(s => s.toLowerCase().includes('golf'))) ||
    (i === 'National Parks' && (trip.styles?.includes('National Parks') || trip.experiences?.some(e => e.toLowerCase().includes('national park'))))
  );
  if (matchedInterests.length > 0) {
    const pts = Math.min(matchedInterests.length * 7, 20);
    score += pts;
    reasons.push(`Matches: ${matchedInterests.join(', ')}`);
  }

  // --- Vote boost (up to +3, down to -2) ---
  const myVote = myVotes?.[trip.id];
  if (myVote) {
    const boost = VOTE_SCORE[myVote] || 0;
    score += boost;
    if (boost > 0) reasons.push(`You voted ${myVote === 'love' ? '❤️ Love' : '👍 Like'}`);
    if (boost < 0) misses.push('You voted Pass');
  }

  // --- Partner vote boost ---
  const memberIds = (householdMembers || [])
    .filter(m => m.is_active !== false)
    .map(m => m.user_id);
  const partnerVotes = (allVotes || []).filter(v =>
    v.trip_id === trip.id && memberIds.includes(v.user_id) && v.user_id !== Object.keys(myVotes || {})[0]
  );
  partnerVotes.forEach(v => {
    const boost = VOTE_SCORE[v.vote] || 0;
    if (boost > 0) { score += Math.floor(boost / 2); reasons.push('Partner also loves this'); }
  });

  // --- Status boost ---
  const status = statusOf(trip);
  const sBoost = STATUS_SCORE[status] || 0;
  if (sBoost > 0) { score += sBoost; reasons.push(`Already marked ${status}`); }

  // --- Wish list boost ---
  const onWishList = (allPersonalTripData || []).some(r =>
    r.trip_id === trip.id && (r.wish_list || r.want_to_visit || r.favorite)
  );
  if (onWishList) { score += 1; reasons.push('On your wish list'); }

  return { trip, score, reasons, misses, status };
}

export default function DecisionEngine({
  destinations, myVotes, allVotes, allPersonalTripData,
  householdMembers, statusOf, openTrip
}) {
  const [prefs, setPrefs] = useState({
    season: '', days: '', budget: '', transport: '', interests: []
  });
  const [ran, setRan] = useState(false);

  const toggleInterest = (id) => {
    setPrefs(p => ({
      ...p,
      interests: p.interests.includes(id)
        ? p.interests.filter(x => x !== id)
        : [...p.interests, id]
    }));
  };

  const results = useMemo(() => {
    if (!ran) return [];
    return destinations
      .map(trip => scoreTrip({ trip, prefs, myVotes, allVotes, allPersonalTripData, householdMembers, statusOf }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [ran, prefs, destinations, myVotes, allVotes, allPersonalTripData, householdMembers]);

  const reset = () => { setRan(false); setPrefs({ season:'', days:'', budget:'', transport:'', interests:[] }); };

  return (
    <>
      <section className="panel">
        <h2>🧭 Decision Engine</h2>
        <p className="muted">Tell us what you're looking for and we'll rank every trip by how well it fits — including your votes and wish list.</p>
      </section>

      {!ran ? (
        <section className="panel dePanel">
          <div className="deGrid">
            <Field label="When do you want to travel?">
              <div className="dePills">
                {['Spring','Summer','Fall','Winter'].map(s => (
                  <button key={s} className={`dePill ${prefs.season===s?'active':''}`} onClick={()=>setPrefs(p=>({...p,season:p.season===s?'':s}))}>{s}</button>
                ))}
              </div>
            </Field>

            <Field label="How many days?">
              <div className="dePills">
                {['3-4','5-7','8-10','10+'].map(d => (
                  <button key={d} className={`dePill ${prefs.days===d?'active':''}`} onClick={()=>setPrefs(p=>({...p,days:p.days===d?'':d}))}>{d} days</button>
                ))}
              </div>
            </Field>

            <Field label="What's your budget?">
              <div className="dePills">
                {['Value','Comfortable','Premium','Bucket List'].map(b => (
                  <button key={b} className={`dePill ${prefs.budget===b?'active':''}`} onClick={()=>setPrefs(p=>({...p,budget:p.budget===b?'':b}))}>{b}</button>
                ))}
              </div>
            </Field>

            <Field label="How are you getting there?">
              <div className="dePills">
                <button className={`dePill ${prefs.transport==='fly'?'active':''}`} onClick={()=>setPrefs(p=>({...p,transport:p.transport==='fly'?'':'fly'}))}>✈️ Flying</button>
                <button className={`dePill ${prefs.transport==='drive'?'active':''}`} onClick={()=>setPrefs(p=>({...p,transport:p.transport==='drive'?'':'drive'}))}>🚗 Driving</button>
              </div>
            </Field>

            <Field label="What matters most? (pick any)">
              <div className="dePills">
                {INTERESTS.map(i => (
                  <button key={i.id} className={`dePill ${prefs.interests.includes(i.id)?'active':''}`} onClick={()=>toggleInterest(i.id)}>{i.label}</button>
                ))}
              </div>
            </Field>
          </div>

          <div className="deActions">
            <button className="btn gold large" onClick={()=>setRan(true)}>
              Find My Trips →
            </button>
            <p className="muted">You can leave any question blank — we'll rank based on what you've answered.</p>
          </div>
        </section>
      ) : (
        <>
          <section className="panel">
            <div className="deResultsHeader">
              <div>
                <h3>Your Top Matches</h3>
                <p className="muted">
                  {prefs.season && `${prefs.season} · `}
                  {prefs.days && `${prefs.days} days · `}
                  {prefs.budget && `${prefs.budget} · `}
                  {prefs.transport === 'fly' ? 'Flying · ' : prefs.transport === 'drive' ? 'Driving · ' : ''}
                  {prefs.interests.length > 0 && prefs.interests.join(', ')}
                </p>
              </div>
              <button className="btn secondary" onClick={reset}>← Start Over</button>
            </div>
          </section>

          {results.length === 0 ? (
            <section className="panel">
              <p className="muted">No trips matched those filters. Try loosening your criteria.</p>
            </section>
          ) : (
            results.map((r, i) => (
              <ResultCard key={r.trip.id} result={r} rank={i+1} openTrip={openTrip} />
            ))
          )}
        </>
      )}
    </>
  );
}

function ResultCard({ result, rank, openTrip }) {
  const { trip, score, reasons, misses, status } = result;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  const pct = Math.min(Math.round(score), 100);

  return (
    <section className="panel deResult" onClick={() => openTrip(trip)}>
      <div className="deResultHero" style={{ backgroundImage: `url("${img(trip.id)}")` }}>
        <span className="deRank">{medal}</span>
      </div>
      <div className="deResultBody">
        <div className="deResultTop">
          <div>
            <h3>{trip.title}</h3>
            <p className="muted">{trip.region} · {trip.idealDays} · {trip.budget}</p>
          </div>
          <div className="deScore">
            <b>{pct}</b>
            <span>score</span>
          </div>
        </div>

        <div className="deBar">
          <div className="deBarFill" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>

        <div className="deReasons">
          {reasons.map((r, i) => <span key={i} className="deTag good">✓ {r}</span>)}
          {misses.map((m, i) => <span key={i} className="deTag miss">· {m}</span>)}
        </div>

        <button className="btn gold" onClick={e => { e.stopPropagation(); openTrip(trip); }}>
          Open Trip →
        </button>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="deField">
      <label className="deLabel">{label}</label>
      {children}
    </div>
  );
}
