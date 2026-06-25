import { Heart } from 'lucide-react';
import { img } from '../utils/helpers';

const VOTE_EMOJI = { love: '❤️', like: '👍', maybe: '🤔', pass: '👋' };

export default function TripCard({ trip, status, favorite, vote, coverPhoto, openTrip, toggleFavorite }) {
  const photoUrl = coverPhoto || img(trip.id);
  return (
    <article className="tripCard" onClick={() => openTrip(trip)}>
      <div className="tripImage" style={{ backgroundImage: `url("${photoUrl}")` }} />
      <button
        className={`heart ${favorite ? 'on' : ''}`}
        onClick={(e) => { e.stopPropagation(); toggleFavorite(trip); }}
      >
        <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
      </button>
      {vote && (
        <span className="voteIndicator" title={`Your vote: ${vote}`}>
          {VOTE_EMOJI[vote]}
        </span>
      )}
      <div className="tripBody">
        <div className="pillRow"><span>{trip.region}</span><span>{status}</span></div>
        <h3>{trip.title}</h3>
        <p>{trip.subregion} · {trip.idealDays}</p>
      </div>
    </article>
  );
}
