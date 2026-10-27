import { useEffect, useRef, type RefObject } from "react";
import { ArrowRight } from "lucide-react";
import CoinMascot from "@/components/coin-mascot";
import { assetById, dreamById, type Unlock } from "@/lib/market-data";
import { ageAt, eventCard, salaryFor, START_CASH, type EventCard, type GameState } from "@/lib/market-game";
import { money } from "./format";
import { DREAM_ICONS } from "./icons";
import { Bumpy } from "./place-panel";

export type Story = { type: "unlock"; unlock: Unlock; welcome: boolean } | { type: "event"; card: EventCard };

const EVENT_EYEBROWS: Record<EventCard["kind"], string> = {
  crash: "Market crash",
  hype: "Hype alert",
  tip: "Hot tip",
  temptation: "Tempting buy",
};

type StoryCardProps = {
  story: Story;
  game: GameState;
  onDone: (choice?: string) => void;
};

export function StoryCard({ story, game, onDone }: StoryCardProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const card = story.type === "event" ? eventCard(game) ?? story.card : null;

  useEffect(() => heading.current?.focus({ preventScroll: true }), [story]);

  // Number keys pick an answer and Enter closes an info card, so a presenter can run class votes without the mouse.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!card) {
        if (event.key === "Enter" && event.target === heading.current) onDone();
        return;
      }
      const choice = card.choices[Number(event.key) - 1];
      if (choice && !choice.disabled) onDone(choice.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, onDone]);

  return (
    <div className="market-story" role="dialog" aria-modal="true" aria-labelledby="story-title">
      <article className={`market-story-card ${card ? `is-${card.kind}` : ""}`}>
        <header>
          <CoinMascot />
          <p>{card ? EVENT_EYEBROWS[card.kind] : story.type === "unlock" && story.welcome ? "Welcome to Market Street" : `New in town at age ${ageAt(game.year)}`}</p>
        </header>
        {story.type === "unlock" ? (
          <UnlockBody story={story} game={game} heading={heading} />
        ) : (
          <>
            <h2 id="story-title" tabIndex={-1} ref={heading}>
              {card!.title}
            </h2>
            <p className="market-story-body">{card!.body}</p>
          </>
        )}

        {card ? (
          <ol className="market-choices">
            {card.choices.map((choice, index) => (
              <li key={choice.id}>
                <button type="button" onClick={() => onDone(choice.id)} disabled={choice.disabled}>
                  <b aria-hidden="true">{String.fromCharCode(65 + index)}</b>
                  <span>{choice.label}</span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <button type="button" className="market-advance" onClick={() => onDone()}>
            {story.type === "unlock" && story.welcome ? "Let’s go" : "Got it"} <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
        {card && <p className="market-story-foot">Pick an answer, or press 1, 2, or 3. Your choice plays out when the year ends.</p>}
      </article>
    </div>
  );
}

type UnlockBodyProps = {
  story: Extract<Story, { type: "unlock" }>;
  game: GameState;
  heading: RefObject<HTMLHeadingElement | null>;
};

function UnlockBody({ story, game, heading }: UnlockBodyProps) {
  const dream = dreamById(game.dream);
  const DreamIcon = DREAM_ICONS[game.dream];

  return (
    <>
      <h2 id="story-title" tabIndex={-1} ref={heading}>
        {story.welcome ? `Your goal: ${money(game.goal)} by age ${ageAt(game.years)}` : story.unlock.title}
      </h2>
      {story.welcome && (
        <p className="market-story-goal">
          <DreamIcon size={22} aria-hidden="true" />
          <span>
            That’s about what {dream.name} will cost. You’re starting with {money(START_CASH)}, and Burger Barn will pay
            you {money(salaryFor(0))} a year, but saving it all still won’t quite get you there.
          </span>
        </p>
      )}
      <p className="market-story-body">{story.unlock.body}</p>
      <ul className="market-story-facts">
        {story.unlock.ids.map((id) => {
          const asset = assetById(id);
          return (
            <li key={id}>
              <strong>
                <i style={{ background: asset.color }} /> {asset.name}
              </strong>
              <Bumpy level={asset.bumpy} />
              <span>{asset.typical}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
