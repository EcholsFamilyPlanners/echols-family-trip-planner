import { useState, useEffect, useMemo } from 'react';
import { loadAllBudgetItems } from '../services/travelOsService';
import { CategoryBarChart, money, CATEGORY_COLORS } from './SpendingChart';

export default function SpendingDashboard({ destinations, statusOf }) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllBudgetItems().then(items => { setAllItems(items); setLoading(false); });
  }, []);

  // Map trip_id -> trip object for lookups
  const tripMap = useMemo(() => {
    const m = {};
    destinations.forEach(d => { m[d.id] = d; });
    return m;
  }, [destinations]);

  // Only include items belonging to trips that are Visited or Booked (real spending)
  const visitedTripIds = useMemo(() =>
    destinations.filter(d => ['Visited','Booked'].includes(statusOf(d))).map(d => d.id)
  , [destinations, statusOf]);

  const relevantItems = useMemo(() =>
    allItems.filter(i => visitedTripIds.includes(i.trip_id))
  , [allItems, visitedTripIds]);

  // Group spending by trip
  const byTrip = useMemo(() => {
    const grouped = {};
    relevantItems.forEach(item => {
      if (!grouped[item.trip_id]) grouped[item.trip_id] = { estimated: 0, actual: 0, items: [] };
      grouped[item.trip_id].estimated += Number(item.estimated) || 0;
      grouped[item.trip_id].actual += Number(item.actual) || 0;
      grouped[item.trip_id].items.push(item);
    });
    return grouped;
  }, [relevantItems]);

  const tripSpendRows = Object.entries(byTrip)
    .map(([tripId, data]) => ({ trip: tripMap[tripId], tripId, ...data }))
    .filter(r => r.trip)
    .sort((a,b) => (b.actual||b.estimated) - (a.actual||a.estimated));

  // Totals
  const totalSpent = tripSpendRows.reduce((s,r) => s + (r.actual || r.estimated), 0);
  const tripCount = tripSpendRows.length;
  const avgPerTrip = tripCount > 0 ? totalSpent / tripCount : 0;

  // Average cost per day — needs trip day counts
  const totalDaySpend = tripSpendRows.reduce((sum, r) => {
    const days = parseInt(String(r.trip.idealDays).match(/\d+/)?.[0] || 5, 10);
    return sum + days;
  }, 0);
  const avgPerDay = totalDaySpend > 0 ? totalSpent / totalDaySpend : 0;

  if (loading) return <p className="muted">Loading spending data...</p>;

  if (tripSpendRows.length === 0) {
    return (
      <div className="spendEmpty">
        <span>💰</span>
        <p>No spending data yet.</p>
        <small className="muted">Once you mark trips as Booked or Visited and add budget items, your spending history will show up here — including yearly totals and a cost estimator for future trips.</small>
      </div>
    );
  }

  return (
    <div className="spendDashboard">
      <div className="spendStatsRow">
        <div className="spendStat">
          <span>Total Spent</span>
          <b>{money(totalSpent)}</b>
        </div>
        <div className="spendStat">
          <span>Trips Tracked</span>
          <b>{tripCount}</b>
        </div>
        <div className="spendStat">
          <span>Avg / Trip</span>
          <b>{money(avgPerTrip)}</b>
        </div>
        <div className="spendStat">
          <span>Avg / Day</span>
          <b>{money(avgPerDay)}</b>
        </div>
      </div>

      <div className="spendChartPanel" style={{marginTop:'1.5rem'}}>
        <h3>Spending by Category — All Trips</h3>
        <CategoryBarChart items={relevantItems} />
      </div>

      <div className="spendTripList" style={{marginTop:'1.5rem'}}>
        <h3>By Trip</h3>
        {tripSpendRows.map(({ trip, tripId, estimated, actual }) => (
          <div className="spendTripRow" key={tripId}>
            <div className="spendTripInfo">
              <b>{trip.title}</b>
              <span className="muted">{trip.region} · {trip.idealDays}</span>
            </div>
            <div className="spendTripAmount">
              {money(actual || estimated)}
              {actual > 0 && actual !== estimated && (
                <span className="muted" style={{fontSize:'.78rem'}}> (est. {money(estimated)})</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <FutureEstimator destinations={destinations} tripSpendRows={tripSpendRows} avgPerDay={avgPerDay} />
    </div>
  );
}

function FutureEstimator({ destinations, tripSpendRows, avgPerDay }) {
  const [days, setDays] = useState(7);
  const [budgetTier, setBudgetTier] = useState('Comfortable');

  // Adjust avg per day by budget tier multiplier based on historical data tiers
  const tierMultiplier = { 'Value': 0.75, 'Comfortable': 1, 'Premium': 1.4, 'Bucket List': 1.9 };
  const estimate = avgPerDay * days * (tierMultiplier[budgetTier] || 1);

  if (tripSpendRows.length < 2) {
    return (
      <div className="spendChartPanel" style={{marginTop:'1.5rem'}}>
        <h3>🔮 Future Trip Estimator</h3>
        <p className="muted">Track spending on at least 2 trips and this will start estimating costs for future trips based on your real travel history.</p>
      </div>
    );
  }

  return (
    <div className="spendChartPanel" style={{marginTop:'1.5rem'}}>
      <h3>🔮 Future Trip Estimator</h3>
      <p className="muted">Based on your {tripSpendRows.length} tracked trips, averaging {money(avgPerDay)}/day.</p>
      <div className="estimatorControls">
        <label>Days
          <input type="number" min="1" value={days} onChange={e=>setDays(Number(e.target.value)||1)} />
        </label>
        <label>Budget Tier
          <select value={budgetTier} onChange={e=>setBudgetTier(e.target.value)}>
            {['Value','Comfortable','Premium','Bucket List'].map(t=><option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <div className="estimatorResult">
        <span>Estimated cost for a {days}-day {budgetTier} trip</span>
        <b>{money(estimate)}</b>
      </div>
    </div>
  );
}
