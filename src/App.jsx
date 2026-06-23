
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import seedDestinations from './data/destinations.json';
import Shell from './components/Shell';
import Dashboard from './components/Dashboard';
import TripLibrary from './components/TripLibrary';
import TripDetail from './components/TripDetail';
import AddTrip from './components/AddTrip';
import AuthGate from './components/AuthGate';
import { TripFinder, Budget, Stadiums, Journal, SyncPlan } from './components/SimpleTools';
import {
  loadTripData,
  loadCustomTrips,
  loadIdeaInbox,
  saveIdeaInbox,
  saveTripPatch,
  saveCustomTrip,
  exportPlannerData,
  syncImportData,
  getSession,
  onAuthChange
} from './services/syncService';
import './styles.css';

function App() {
  const [view, setView] = useState('dashboard');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripData, setTripData] = useState({});
  const [customTrips, setCustomTrips] = useState([]);
  const [ideaInbox, setIdeaInboxState] = useState(loadIdeaInbox);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const destinations = useMemo(() => [...seedDestinations, ...customTrips], [customTrips]);

  const refreshCloudData = async () => {
    const [cloudTripData, cloudCustomTrips] = await Promise.all([
      loadTripData(),
      loadCustomTrips()
    ]);
    setTripData(cloudTripData);
    setCustomTrips(cloudCustomTrips);
  };

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const currentSession = await getSession();
      if (mounted) setSession(currentSession);
      await refreshCloudData();
      if (mounted) setLoading(false);
    }

    boot();

    const unsubscribe = onAuthChange(async (newSession) => {
      setSession(newSession);
      await refreshCloudData();
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const statusOf = (trip) => tripData[trip.id]?.status || trip.status || 'Idea';
  const favoriteOf = (trip) => !!tripData[trip.id]?.favorite;

  const updateTrip = async (id, patch) => {
    const current = tripData[id] || {};
    const next = { ...current, ...patch };
    setTripData(prev => ({ ...prev, [id]: next }));

    try {
      await saveTripPatch(id, patch, current);
    } catch (error) {
      alert(`Sync failed: ${error.message}`);
    }
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

  const addCustomTrip = async (trip) => {
    setCustomTrips(prev => [...prev, trip]);
    try {
      await saveCustomTrip(trip);
      await refreshCloudData();
    } catch (error) {
      alert(`Could not save trip: ${error.message}`);
    }
  };

  const importData = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const data = JSON.parse(reader.result);
      await syncImportData(data);
      if (data.ideaInbox !== undefined) setIdeaInbox(data.ideaInbox);
      await refreshCloudData();
      alert('Imported.');
    };
    reader.readAsText(file);
  };

  const sharedProps = { destinations, statusOf, favoriteOf, openTrip, toggleFavorite };

  return (
    <Shell view={view} setView={(next) => { setSelectedTrip(null); setView(next); }}>
      <AuthGate session={session} loading={loading} />
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
