
import { useState } from 'react';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { signInWithEmail, signOut } from '../services/travelOsService';

export default function AuthPanel({ session }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!isSupabaseConfigured) return <div className="authBanner warning">Supabase is not configured. Running local-only.</div>;

  if (session?.user) {
    return <div className="authBanner"><span>Cloud sync active: <b>{session.user.email}</b></span><button className="btn secondary" onClick={signOut}>Sign out</button></div>
  }

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await signInWithEmail(email);
      setMessage('Check your email for the magic link.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return <div className="authBanner"><form className="authForm" onSubmit={submit}><b>Sign in to sync</b><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@example.com" required/><button className="btn gold">Send magic link</button></form>{message && <small>{message}</small>}</div>
}
