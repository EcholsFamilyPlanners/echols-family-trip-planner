// Lightweight pure-SVG bar chart — no external chart library needed.

const CATEGORY_COLORS = {
  'Flights': '#3b82f6',
  'Hotel': '#c9a84c',
  'Food & Dining': '#10b981',
  'Activities': '#f97316',
  'Car & Transport': '#8b5cf6',
  'Shopping': '#ec4899',
  'Other': '#6b7280',
};

function money(n) {
  return Number(n||0).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
}

export function CategoryBarChart({ items }) {
  // Group by category, sum estimated and actual
  const byCategory = {};
  items.forEach(item => {
    const cat = item.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = { estimated: 0, actual: 0 };
    byCategory[cat].estimated += Number(item.estimated) || 0;
    byCategory[cat].actual += Number(item.actual) || 0;
  });

  const categories = Object.entries(byCategory).sort((a,b) => (b[1].actual||b[1].estimated) - (a[1].actual||a[1].estimated));
  if (categories.length === 0) return <p className="muted">No spending data yet.</p>;

  const maxVal = Math.max(...categories.map(([,v]) => Math.max(v.estimated, v.actual)), 1);

  return (
    <div className="spendChart">
      {categories.map(([cat, v]) => {
        const color = CATEGORY_COLORS[cat] || '#6b7280';
        const hasActual = v.actual > 0;
        return (
          <div className="spendChartRow" key={cat}>
            <div className="spendChartLabel">
              <span className="spendChartDot" style={{background:color}}/>
              {cat}
            </div>
            <div className="spendChartBars">
              <div className="spendChartBarTrack">
                <div className="spendChartBar estimated" style={{width:`${(v.estimated/maxVal)*100}%`, background:color, opacity:0.35}}/>
              </div>
              {hasActual && (
                <div className="spendChartBarTrack">
                  <div className="spendChartBar actual" style={{width:`${(v.actual/maxVal)*100}%`, background:color}}/>
                </div>
              )}
            </div>
            <div className="spendChartValue">
              {hasActual ? money(v.actual) : money(v.estimated)}
              {hasActual && <span className="muted" style={{fontSize:'.75rem'}}> / {money(v.estimated)} est</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { CATEGORY_COLORS, money };
