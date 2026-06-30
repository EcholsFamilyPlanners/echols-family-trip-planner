
export default function Shell({ view, setView, session, children }) {
  const nav = [
    ['dashboard','Dashboard'], ['people','People'], ['couples','Together'], ['compare','Compare'], ['library','Trips'], ['wishlist','My List'], ['finder','Decision Engine'], ['budget','Budget'],
    ['packing','Packing'], ['venues','Sports'], ['journal','Journal'], ['add','+ Add Trip']
  ];
  return (
    <>
      <header className="hero">
        <div className="heroInner">
          <div className="topbar">
            <div className="brand">Anthony & Stephanie Travel OS</div>
            <nav>{nav.map(([k,l]) => <button key={k} className={view===k?'active':''} onClick={()=>setView(k)}>{l}</button>)}</nav>
          </div>
          <div className="heroCopy">
            <p className="eyebrow">Version 5.4 · Receipts & Tips</p>
            <h1>Plan it. Track it. Remember it.</h1>
            <p>A long-term travel operating system for trips, packing, stadiums, budgets, shared notes, and memories.</p>
            <p className="signinState">{session?.user?.email ? `Signed in as ${session.user.email}` : 'Local mode or not signed in'}</p>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
