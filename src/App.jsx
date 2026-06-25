
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
import CouplesPlanner from './components/CouplesPlanner';
import TripCompare from './components/TripCompare';
import People from './components/People';
import { TripFinder, Budget, PackingManager, SportsTracker, Journal } from './components/Tools';
import {
  getSession, onAuthChange, loadAllData, loadIdeaInbox, saveIdeaInbox,
  saveSharedTripPatch, savePersonalTripPatch, saveTripVote,
  addCustomTrip as saveCustomTrip, ensureHouseholdMember
} from './services/travelOsService';
import './styles.css';

function App(){
  const [view,setView]=useState('dashboard'); const [selected,setSelected]=useState(null); const [session,setSession]=useState(null);
  const [sharedTripData,setSharedTripData]=useState({}); const [personalTripData,setPersonalTripData]=useState({}); const [customTrips,setCustomTrips]=useState([]);
  const [packingTemplates,setPackingTemplates]=useState([]); const [packingItems,setPackingItems]=useState([]); const [sportsVenues,setSportsVenues]=useState([]);
  const [householdMembers,setHouseholdMembers]=useState([]); const [allPersonalTripData,setAllPersonalTripData]=useState([]);
  const [myVotes,setMyVotes]=useState({}); const [allVotes,setAllVotes]=useState([]);
  const [ideaInbox,setIdeaInboxState]=useState(loadIdeaInbox);
  const destinations=useMemo(()=>[...seedDestinations,...customTrips],[customTrips]);

  const refresh=async()=>{
    const data=await loadAllData(seedDestinations);
    setSharedTripData(data.sharedTripData);
    setPersonalTripData(data.personalTripData);
    setAllPersonalTripData(data.allPersonalTripData || []);
    setHouseholdMembers(data.householdMembers || []);
    setCustomTrips(data.customTrips);
    setPackingTemplates(data.packingTemplates);
    setPackingItems(data.packingItems);
    setSportsVenues(data.sportsVenues);
    setMyVotes(data.myVotes || {});
    setAllVotes(data.allVotes || []);
  };

  useEffect(()=>{
    getSession().then(async s=>{setSession(s);await ensureHouseholdMember(s);await refresh();});
    return onAuthChange(async s=>{setSession(s);await ensureHouseholdMember(s);await refresh();});
  },[]);

  const statusOf=t=>sharedTripData[t.id]?.status||t.status||'Idea';
  const favoriteOf=t=>!!personalTripData[t.id]?.favorite;
  const voteOf=t=>myVotes[t.id]||null;

  const updateShared=async(id,patch)=>{const cur=sharedTripData[id]||{};const next={...cur,...patch};setSharedTripData(p=>({...p,[id]:next}));try{await saveSharedTripPatch(id,patch,cur)}catch(e){alert(e.message)}};
  const updatePersonal=async(id,patch)=>{const cur=personalTripData[id]||{};const next={...cur,...patch};setPersonalTripData(p=>({...p,[id]:next}));try{await savePersonalTripPatch(id,patch,cur);await refresh()}catch(e){alert(e.message)}};
  const toggleFavorite=t=>updatePersonal(t.id,{favorite:!favoriteOf(t)});

  const castVote=async(tripId,vote)=>{
    // optimistic update
    setMyVotes(prev=>({...prev,[tripId]:vote}));
    try{
      await saveTripVote(tripId,vote);
      await refresh();
    }catch(e){
      alert(e.message);
      await refresh();
    }
  };

  const openTrip=t=>{setSelected(t);setView('detail');window.scrollTo(0,0)};
  const goDash=()=>{setSelected(null);setView('dashboard')};
  const setIdeaInbox=v=>{setIdeaInboxState(v);saveIdeaInbox(v)};
  const addCustomTrip=async trip=>{await saveCustomTrip(trip);await refresh()};

  return <Shell view={view} setView={v=>{setSelected(null);setView(v)}} session={session}>
    <AuthPanel session={session}/>
    {view==='dashboard'&&<Dashboard destinations={destinations} statusOf={statusOf} favoriteOf={favoriteOf} voteOf={voteOf} openTrip={openTrip} toggleFavorite={toggleFavorite} venues={sportsVenues} packingItems={packingItems} ideaInbox={ideaInbox} setIdeaInbox={setIdeaInbox}/>}
    {view==='people'&&<People householdMembers={householdMembers} session={session} refresh={refresh}/>}
    {view==='couples'&&<CouplesPlanner destinations={destinations} householdMembers={householdMembers} allPersonalTripData={allPersonalTripData} sharedTripData={sharedTripData} allVotes={allVotes} myVotes={myVotes} statusOf={statusOf} favoriteOf={favoriteOf} openTrip={openTrip} toggleFavorite={toggleFavorite}/>}
    {view==='library'&&<TripLibrary destinations={destinations} statusOf={statusOf} favoriteOf={favoriteOf} voteOf={voteOf} openTrip={openTrip} toggleFavorite={toggleFavorite}/>}
    {view==='compare'&&<TripCompare destinations={destinations} sharedTripData={sharedTripData} personalTripData={personalTripData} allPersonalTripData={allPersonalTripData} householdMembers={householdMembers} statusOf={statusOf} openTrip={openTrip}/>}
    {view==='detail'&&selected&&<TripDetail trip={selected} shared={sharedTripData[selected.id]||{}} personal={personalTripData[selected.id]||{}} myVote={voteOf(selected)} castVote={castVote} updateShared={updateShared} updatePersonal={updatePersonal} goBack={goDash}/>}
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
