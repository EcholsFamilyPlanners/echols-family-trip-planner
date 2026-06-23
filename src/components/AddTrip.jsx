
export default function AddTrip({ addCustomTrip, goDashboard }) {
  const [form,setForm]=React.useState({title:'',region:'United States',subregion:'Custom',budget:'Comfortable',status:'Idea',length:'5-7',seasons:'Spring,Fall',styles:'Food,Relaxing',summary:'',hero:'',experiences:'',detours:'',sports:'',photos:'',hotels:'',restaurants:'',itinerary:''});
  const parse=s=>(s||'').split(',').map(x=>x.trim()).filter(Boolean);
  const save=()=>{
    if(!form.title.trim()) return alert('Add a title.');
    addCustomTrip({
      id:form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+Date.now().toString().slice(-5),
      title:form.title, region:form.region, subregion:form.subregion, budget:form.budget, status:form.status,
      length:parse(form.length), seasons:parse(form.seasons), styles:parse(form.styles),
      bestMonths:'To research', idealDays:form.length, hero:form.hero||form.title, summary:form.summary||'Custom trip idea.',
      experiences:parse(form.experiences).length?parse(form.experiences):['Add experiences later'],
      detours:parse(form.detours).length?parse(form.detours):['Add detours later'],
      sports:parse(form.sports).length?parse(form.sports):['Add sports venues later'],
      photos:parse(form.photos).length?parse(form.photos):['Add photo stops later'],
      hotels:parse(form.hotels).length?parse(form.hotels):['Add hotels later'],
      restaurants:parse(form.restaurants).length?parse(form.restaurants):['Add restaurants later'],
      itinerary:parse(form.itinerary).length?parse(form.itinerary):['Build itinerary later']
    });
    goDashboard();
  };
  return <section className="panel"><h2>Add Trip</h2><div className="formGrid">{Object.keys(form).map(k=><label key={k}><b>{k}</b><textarea value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} /></label>)}</div><button className="btn gold" onClick={save}>Save Trip</button></section>
}
