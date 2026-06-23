
import { useState } from 'react';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { signOut } from '../services/syncService';
import { signInWithEmail as sendMagicLink } from '../services/syncService';

export default function AuthGate({ session, loading }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!isSupabaseConfigured) {
    return (
      <div className="authBanner warning">
        Supabase is not configured yet. The app is running in local-only mode.
      </div>
    );
  }

  if (loading) {
    return <div className="authBanner">Checking sign-in status...</div>;
  }

  if (session?.user) {
    return (
      <div className="authBanner">
        <span>Signed in as <b>{session.user.email}</b>. Shared sync is active.</span>
        <button className="btn secondary" onClick={signOut}>Sign out</button>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await sendMagicLink(email);
      setMessage('Check your email for the sign-in link.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="authBanner">
      <form onSubmit={submit} className="authForm">
        <span><b>Sign in to sync:</b></span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" required />
        <button className="btn gold" type="submit">Send magic link</button>
      </form>
      {message && <small>{message}</small>}
    </div>
  );
}
