import { useState, useEffect } from 'react';
import { loadTripBudget, saveTripBudgetTarget, saveBudgetItem, deleteBudgetItem } from '../services/travelOsService';

const CATEGORIES = ['Flights','Hotel','Food & Dining','Activities','Car & Transport','Shopping','Other'];
const BLANK_ITEM = { category:'Flights', label:'', estimated:'', actual:'', notes:'' };

function money(n) {
  return Number(n || 0).toLocaleString('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 });
}

export default function TripBudget({ tripId }) {
  const [target, setTarget] = useState(0);
  const [targetInput, setTargetInput] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [editingTarget, setEditingTarget] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await loadTripBudget(tripId);
    setTarget(data.target);
    setTargetInput(data.target || '');
    setItems(data.items);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tripId]);

  const saveTarget = async () => {
    await saveTripBudgetTarget(tripId, targetInput);
    setTarget(Number(targetInput) || 0);
    setEditingTarget(false);
  };

  const saveItem = async () => {
    if (!form?.label?.trim()) return alert('Item name is required.');
    const actualVal = form.actual === '' || form.actual === null || form.actual === undefined
      ? null
      : Number(form.actual);
    await saveBudgetItem({
      ...form,
      trip_id: tripId,
      sort_order: items.length,
      estimated: Number(form.estimated) || 0,
      actual: actualVal,
    });
    setForm(null);
    await load();
  };

  const removeItem = async (id) => {
    if (!confirm('Remove this item?')) return;
    await deleteBudgetItem(id);
    await load();
  };

  const totalEstimated = items.reduce((s, i) => s + (Number(i.estimated) || 0), 0);
  const totalActual    = items.reduce((s, i) => s + (Number(i.actual)    || 0), 0);
  const hasActuals     = items.some(i => i.actual !== null && i.actual !== '');
  const remaining      = target - (hasActuals ? totalActual : totalEstimated);
  const overBudget     = remaining < 0;

  // Group by category
  const grouped = CATEGORIES.map(cat => ({
    cat,
    items: items.filter(i => i.category === cat)
  })).filter(g => g.items.length > 0);

  if (loading) return <p className="muted">Loading budget...</p>;

  return (
    <section className="panel budgetPanel">
      <div className="budgetHeader">
        <h2>💰 Trip Budget</h2>
        <button className="btn gold" onClick={() => setForm({...BLANK_ITEM})}>+ Add Item</button>
      </div>

      {/* Target */}
      <div className="budgetTarget">
        <div className="budgetTargetLabel">
          <span>Budget Target</span>
          {!editingTarget && (
            <button className="btn secondary small" onClick={() => { setEditingTarget(true); setTargetInput(target || ''); }}>
              {target ? 'Edit' : 'Set Target'}
            </button>
          )}
        </div>
        {editingTarget ? (
          <div className="budgetTargetInput">
            <input type="number" value={targetInput} onChange={e=>setTargetInput(e.target.value)} placeholder="e.g. 5000" autoFocus/>
            <button className="btn gold" onClick={saveTarget}>Save</button>
            <button className="btn secondary" onClick={()=>setEditingTarget(false)}>Cancel</button>
          </div>
        ) : (
          <div className="budgetTargetValue">{target ? money(target) : <span className="muted">Not set</span>}</div>
        )}
      </div>

      {/* Summary bar */}
      {items.length > 0 && (
        <div className="budgetSummary">
          <div className="budgetSummaryRow">
            <div className="budgetStat">
              <span>Estimated</span>
              <b>{money(totalEstimated)}</b>
            </div>
            {hasActuals && (
              <div className="budgetStat">
                <span>Actual</span>
                <b>{money(totalActual)}</b>
              </div>
            )}
            {target > 0 && (
              <div className={`budgetStat ${overBudget ? 'over' : 'under'}`}>
                <span>{overBudget ? 'Over Budget' : 'Remaining'}</span>
                <b>{overBudget ? `-${money(Math.abs(remaining))}` : money(remaining)}</b>
              </div>
            )}
          </div>
          {target > 0 && (
            <div className="budgetBar">
              <div className={`budgetBarFill ${overBudget?'over':''}`}
                style={{ width:`${Math.min((hasActuals?totalActual:totalEstimated)/target*100,100)}%` }}/>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit form */}
      {form && (
        <div className="shortlistForm">
          <h3>{form.id ? 'Edit Item' : 'New Budget Item'}</h3>
          <div className="shortlistFormGrid">
            <label>Category
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </label>
            <label>Item Name *<input value={form.label} onChange={e=>setForm({...form,label:e.target.value})} placeholder="e.g. Round-trip flights"/></label>
            <label>Estimated ($)<input type="number" value={form.estimated} onChange={e=>setForm({...form,estimated:e.target.value})} placeholder="0"/></label>
            <label>Actual ($)<input type="number" value={form.actual ?? ''} onChange={e=>setForm({...form,actual:e.target.value})} placeholder="Fill in after booking"/></label>
          </div>
          <label>Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="e.g. Southwest nonstop, checking prices in Jan..."/></label>
          <div className="formActions">
            <button className="btn gold" onClick={saveItem}>Save Item</button>
            <button className="btn secondary" onClick={()=>setForm(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Line items by category */}
      {items.length === 0 && !form && (
        <p className="muted">No budget items yet. Click Add Item to start planning costs.</p>
      )}

      {grouped.map(({ cat, items: catItems }) => (
        <div className="budgetGroup" key={cat}>
          <div className="budgetGroupHeader">
            <span>{cat}</span>
            <span className="budgetGroupTotal">
              Est: {money(catItems.reduce((s,i)=>s+(Number(i.estimated)||0),0))}
              {catItems.some(i=>i.actual) && ` · Actual: ${money(catItems.reduce((s,i)=>s+(Number(i.actual)||0),0))}`}
            </span>
          </div>
          {catItems.map(item => (
            <div className="budgetItem" key={item.id}>
              <div className="budgetItemMain">
                <b>{item.label}</b>
                {item.notes && <small>{item.notes}</small>}
              </div>
              <div className="budgetItemNums">
                <span className="budgetEst">{money(item.estimated)}</span>
                {item.actual !== null && item.actual !== '' && (
                  <span className="budgetActual">→ {money(item.actual)}</span>
                )}
              </div>
              <div className="budgetItemActions">
                <button className="btn secondary small" onClick={()=>setForm({...item, actual: item.actual ?? ''})}>Edit</button>
                <button className="btn secondary small danger" onClick={()=>removeItem(item.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
