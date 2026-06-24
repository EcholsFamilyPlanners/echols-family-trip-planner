
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import seedDestinations from './data/destinations.json';
import Shell from './components/Shell';
import AuthPanel from './components/AuthPanel';
import Dashboard from './components/Dashboard';
import TripLibrary from './components/TripLibrary';
import TripDetail from './components/TripDetail';
import AddTrip from './components/AddTrip';
import WishLists from './components/WishLists';
import { TripFinder, Budget, PackingManager, SportsTracker, Journal } from './components/Tools';
import { getSession, onAuthChange, loadAllData, loadIdeaInbox, saveIdeaInbox, saveSharedTripPatch, savePersonalTripPatch, addCustomTrip as saveCustomTrip } from './services/travelOsService';
import './styles.css';

function App(){
  const [view,setView]=useState('dashboard'); const [selected,setSelected]=useState(null); const [session,setSession]=useState(null);
  const [sharedTripData,setSharedTripData]=useState({}); const [personalTripData,setPersonalTripData]=useState({}); const [customTrips,setCustomTrips]=useState([]);
  const [packingTemplates,setPackingTemplates]=useState([]); const [packingItems,setPackingItems]=useState([]); const [sportsVenues,setSportsVenues]=useState([]);
  const [ideaInbox,setIdeaInboxState]=useState(loadIdeaInbox);
  const destinations=useMemo(()=>[...seedDestinations,...customTrips],[customTrips]);

  const refresh=async()=>{const data=await loadAllData(seedDestinations);setSharedTripData(data.sharedTripData);setPersonalTripData(data.personalTripData);setCustomTrips(data.customTrips);setPackingTemplates(data.packingTemplates);setPackingItems(data.packingItems);setSportsVenues(data.sportsVenues);}
  useEffect(()=>{getSession().then(setSession);refresh();return onAuthChange(async s=>{setSession(s);await refresh();})},[]);
  const statusOf=t=>sharedTripData[t.id]?.status||t.status||'Idea'; const favoriteOf=t=>!!personalTripData[t.id]?.favorite;
  const updateShared=async(id,patch)=>{const cur=sharedTripData[id]||{};const next={...cur,...patch};setSharedTripData(p=>({...p,[id]:next}));try{await saveSharedTripPatch(id,patch,cur)}catch(e){alert(e.message)}}
  const updatePersonal=async(id,patch)=>{const cur=personalTripData[id]||{};const next={...cur,...patch};setPersonalTripData(p=>({...p,[id]:next}));try{await savePersonalTripPatch(id,patch,cur)}catch(e){alert(e.message)}}
  const toggleFavorite=t=>updatePersonal(t.id,{favorite:!favoriteOf(t)});
  const openTrip=t=>{setSelected(t);setView('detail');window.scrollTo(0,0)}; const goDash=()=>{setSelected(null);setView('dashboard')}
  const setIdeaInbox=v=>{setIdeaInboxState(v);saveIdeaInbox(v)}
  const addCustomTrip=async trip=>{await saveCustomTrip(trip);await refresh()}

  return <Shell view={view} setView={v=>{setSelected(null);setView(v)}} session={session}>
    <AuthPanel session={session}/>
    {view==='dashboard'&&<Dashboard destinations={destinations} statusOf={statusOf} favoriteOf={favoriteOf} openTrip={openTrip} toggleFavorite={toggleFavorite} venues={sportsVenues} packingItems={packingItems} ideaInbox={ideaInbox} setIdeaInbox={setIdeaInbox}/>}
    {view==='library'&&<TripLibrary destinations={destinations} statusOf={statusOf} favoriteOf={favoriteOf} openTrip={openTrip} toggleFavorite={toggleFavorite}/>}
    {view==='detail'&&selected&&<TripDetail trip={selected} shared={sharedTripData[selected.id]||{}} personal={personalTripData[selected.id]||{}} updateShared={updateShared} updatePersonal={updatePersonal} goBack={goDash}/>}
    {view==='wishlist'&&<WishLists destinations={destinations} personalTripData={personalTripData} sharedTripData={sharedTripData} statusOf={statusOf} favoriteOf={favoriteOf} openTrip={openTrip} toggleFavorite={toggleFavorite} updatePersonal={updatePersonal}/>} 
    {view==='finder'&&<TripFinder destinations={destinations} openTrip={openTrip}/>}
    {view==='budget'&&<Budget/>}
    {view==='packing'&&<PackingManager templates={packingTemplates} items={packingItems} refresh={refresh}/>}
    {view==='venues'&&<SportsTracker venues={sportsVenues} refresh={refresh}/>}
    {view==='journal'&&<Journal destinations={destinations} sharedData={sharedTripData} openTrip={openTrip}/>}
    {view==='add'&&<AddTrip addCustomTrip={addCustomTrip} goDashboard={goDash}/>}
  </Shell>
}
createRoot(document.getElementById('root')).render(<App/>);
