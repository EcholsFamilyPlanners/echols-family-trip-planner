
import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import seedDestinations from './data/destinations.json';
import Shell from './components/Shell';
import Dashboard from './components/Dashboard';
import TripLibrary from './components/TripLibrary';
import TripDetail from './components/TripDetail';
import AddTrip from './components/AddTrip';
import { TripFinder, Budget, Stadiums, Journal, SyncPlan } from './components/SimpleTools';
import { loadTripData, saveTripData, loadCustomTrips, saveCustomTrips, loadIdeaInbox, saveIdeaInbox, exportPlannerData } from './services/syncService';
import './styles.css';

function App() {
  const [view, setView] = useState('dashboard');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripData, setTripData] = useState(loadTripData);
  const [customTrips, setCustomTrips] = useState(loadCustomTrips);
  const [ideaInbox, setIdeaInboxState] = useState(loadIdeaInbox);

  const destinations = useMemo(() => [...seedDestinations, ...customTrips], [customTrips]);

  const statusOf = (trip) => tripData[trip.id]?.status || trip.status || 'Idea';
  const favoriteOf = (trip) => !!tripData[trip.id]?.favorite;

  const updateTrip = (id, patch) => {
    const next = { ...tripData, [id]: { ...(tripData[id] || {}), ...patch } };
    setTripData(next);
    saveTripData(next);
  };

  const setIdeaInbox = (value) => {
    setIdeaInboxState(value);
    saveIdeaInbox(value);
  };

  const toggleFavorite = (trip) => updateTrip(trip.id, { favorite: !favoriteOf(trip) });

  const openTrip = (trip) => {
    setSelectedTrip(trip);
    setView('detail');
    window.scrollTo(0,0);
  };

  const goDashboard = () => {
    setSelectedTrip(null);
    setView('dashboard');
    window.scrollTo(0,0);
  };

  const addCustomTrip = (trip) => {
    const next = [...customTrips, trip];
    setCustomTrips(next);
    saveCustomTrips(next);
  };

  const importData = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      if (data.tripData) { setTripData(data.tripData); saveTripData(data.tripData); }
      if (data.customTrips) { setCustomTrips(data.customTrips); saveCustomTrips(data.customTrips); }
      if (data.ideaInbox !== undefined) setIdeaInbox(data.ideaInbox);
      alert('Imported.');
    };
    reader.readAsText(file);
  };

  const sharedProps = { destinations, statusOf, favoriteOf, openTrip, toggleFavorite };

  return (
    <Shell view={view} setView={(next) => { setSelectedTrip(null); setView(next); }}>
      {view === 'dashboard' && <Dashboard {...sharedProps} ideaInbox={ideaInbox} setIdeaInbox={setIdeaInbox} exportData={() => exportPlannerData({ tripData, customTrips, ideaInbox })} importData={importData} />}
      {view === 'library' && <TripLibrary {...sharedProps} />}
      {view === 'detail' && selectedTrip && <TripDetail trip={selectedTrip} data={tripData[selectedTrip.id] || {}} status={statusOf(selectedTrip)} favorite={favoriteOf(selectedTrip)} updateTrip={updateTrip} goBack={goDashboard} />}
      {view === 'finder' && <TripFinder destinations={destinations} openTrip={openTrip} />}
      {view === 'budget' && <Budget />}
      {view === 'stadiums' && <Stadiums destinations={destinations} />}
      {view === 'journal' && <Journal destinations={destinations} tripData={tripData} openTrip={openTrip} />}
      {view === 'sync' && <SyncPlan />}
      {view === 'add' && <AddTrip addCustomTrip={addCustomTrip} goDashboard={goDashboard} />}
    </Shell>
  );
}

createRoot(document.getElementById('root')).render(<App />);
