import { HERO_ART } from './Illustrations.jsx';

// מסך הפתיחה: שלושה כרטיסי סדנה מאוירים, פרושים כמו מניפה. בכל כרטיס שורת מקומות –
// המשאב המוגבל של המערכת – וכרטיס האמצע מראה את "המקום שלך" בצהוב.
const CARDS = [
  { title: 'אפיית חלות', seats: 6, taken: 5 },
  { title: 'קליגרפיה עברית', seats: 5, taken: 5, mine: true },
  { title: 'מבוא לתכנות', seats: 7, taken: 3 },
];

export default function HeroFan() {
  return (
    <div className="hero-fan" aria-hidden="true">
      {CARDS.map((card, index) => {
        const Art = HERO_ART[index];
        return (
          <div key={card.title} className={`fan-card fan-card-${index}`}>
            <Art />
            <div className="fan-body">
              <span className="fan-title">{card.title}</span>
              <span className="fan-seats">
                {Array.from({ length: card.seats }, (_, seat) => (
                  <span
                    key={seat}
                    className={card.mine && seat === card.taken - 1 ? 'seat seat-mine' : seat < card.taken ? 'seat seat-taken' : 'seat'}
                  />
                ))}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
