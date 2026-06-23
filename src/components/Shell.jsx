
export default function Shell({ view, setView, children }) {
  const nav = [
    ['dashboard', 'Dashboard'],
    ['library', 'Trip Library'],
    ['finder', 'Trip Finder'],
    ['budget', 'Budget'],
    ['stadiums', 'Stadiums'],
    ['journal', 'Journal'],
    ['sync', 'Sync Plan'],
    ['add', '+ Add Trip'],
  ];

  return (
    <>
      <header className="hero">
        <div className="heroInner">
          <div className="topbar">
            <div className="brand">Anthony & Stephanie</div>
            <nav>
              {nav.map(([key, label]) => (
                <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="heroCopy">
            <p className="eyebrow">Travel Planner OS · V2.1</p>
            <h1>A shared travel command center.</h1>
            <p>Built for long-term planning: destinations, favorites, visited trips, notes, budgets, stadiums, journals, and future shared syncing between you and Stephanie.</p>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
