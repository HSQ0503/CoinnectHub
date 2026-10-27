"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  CalendarClock,
  Gauge,
  Info,
  PiggyBank,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import {
  FREQUENCIES,
  addPeriods,
  milestoneDates,
  perYear,
  planForDeadline,
  projectPlan,
  readMoney,
  readPercent,
  type Frequency,
  type Plan,
  type PlanInput,
} from "@/lib/savings";

type Mode = "pace" | "deadline";

const EXAMPLE_GOALS = [
  { label: "Headphones", name: "Headphones", price: "150" },
  { label: "Laptop", name: "A new laptop", price: "800" },
  { label: "Concert trip", name: "A concert trip", price: "300" },
  { label: "First car", name: "My first car", price: "5000" },
];

const RATE_PRESETS = [
  { label: "Cash at home", value: "0" },
  { label: "Regular bank", value: "0.5" },
  { label: "High-yield savings", value: "4", term: "high-yield savings" },
];

const DEFINITIONS = {
  apy: "Annual percentage yield: how much your savings could earn in a year, including interest earned on earlier interest. This assumes the rate stays the same.",
  highYield:
    "A savings account that usually pays more interest than a regular savings account. Its rate can change over time.",
  inflation:
    "When prices rise overall, the same amount of money buys less. The price of your specific goal may rise faster, rise slower, or even fall.",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const cents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const longDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});
const monthName = new Intl.DateTimeFormat("en-US", { month: "short" });

function formatMoney(value: number) {
  return Number.isInteger(Math.round(value * 100) / 100)
    ? money.format(value)
    : cents.format(value);
}

// "A new laptop" reads as "a new laptop" mid-sentence, but names like "PS5" stay as typed.
function goalPhrase(goal: string) {
  const trimmed = goal.trim();
  if (!trimmed) return "your goal";
  return /^(A|An|The|My)\s/.test(trimmed)
    ? trimmed[0].toLowerCase() + trimmed.slice(1)
    : trimmed;
}

// "Every week" becomes "every week" so it reads naturally inside a sentence or after an amount.
function frequencyPhrase(frequency: Frequency) {
  return FREQUENCIES.find((option) => option.id === frequency)!.label.toLowerCase();
}

function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function duration(from: Date, to: Date) {
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  if (days < 63) return `${Math.max(1, Math.round(days / 7))} weeks`;
  if (days < 730) return `about ${Math.round(days / 30.44)} months`;
  return `about ${(days / 365).toFixed(1)} years`;
}

const noopSubscribe = () => () => {};

// The page is pre-rendered at build time, so "today" only exists in the browser.
function useTodayKey() {
  return useSyncExternalStore(
    noopSubscribe,
    () => toDateKey(new Date()),
    () => null,
  );
}

export default function SavingsPlanner() {
  const todayKey = useTodayKey();
  const [goal, setGoal] = useState("A new laptop");
  const [price, setPrice] = useState("800");
  const [saved, setSaved] = useState("150");
  const [mode, setMode] = useState<Mode>("pace");
  const [deposit, setDeposit] = useState("25");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [deadline, setDeadline] = useState<string | null>(null);
  const [apy, setApy] = useState("0");
  const [priceGrowth, setPriceGrowth] = useState("0");
  const [income, setIncome] = useState("");

  const today = todayKey ? fromDateKey(todayKey) : null;
  const deadlineKey =
    deadline ?? (today ? toDateKey(addPeriods(today, "monthly", 6)) : "");

  const parsed = {
    price: readMoney(price, { min: 1 }),
    saved: readMoney(saved, { required: false }),
    deposit: readMoney(deposit, { required: false }),
    apy: readPercent(apy, 20),
    priceGrowth: readPercent(priceGrowth, 20),
    income: readMoney(income, { required: false }),
  };
  const deadlineError =
    mode === "deadline" && today && deadlineKey <= todayKey!
      ? "Pick a date after today."
      : null;
  const fieldErrors = Object.values(parsed).some(
    (value) => typeof value === "string",
  );

  const goalName = goalPhrase(goal);
  let result: React.ReactNode = <ResultPlaceholder />;

  if (today && !fieldErrors && !deadlineError) {
    const base = {
      price: parsed.price as number,
      saved: parsed.saved as number,
      frequency,
      apy: parsed.apy as number,
      priceGrowth: parsed.priceGrowth as number,
      start: today,
    };
    const incomePerWeek = parsed.income as number;
    result =
      mode === "pace" ? (
        <PaceResult
          input={{ ...base, deposit: parsed.deposit as number }}
          goalName={goalName}
          incomePerWeek={incomePerWeek}
          onDeposit={(value) => setDeposit(String(value))}
          onApy={(value) => setApy(String(value))}
        />
      ) : (
        <DeadlineResult
          input={base}
          deadline={fromDateKey(deadlineKey)}
          goalName={goalName}
          incomePerWeek={incomePerWeek}
          onSaved={(value) => setSaved(String(value))}
          onDeadline={(date) => setDeadline(toDateKey(date))}
          onApy={(value) => setApy(String(value))}
        />
      );
  }

  return (
    <div className="planner-layout">
      <form
        className="planner-form"
        onSubmit={(event) => event.preventDefault()}
        aria-label="Savings plan details"
      >
        <TextField
          label="What are you saving for?"
          value={goal}
          onChange={setGoal}
          placeholder="A new laptop"
          maxLength={40}
        />
        <div className="planner-examples" aria-label="Example goals">
          {EXAMPLE_GOALS.map((example) => (
            <button
              key={example.name}
              type="button"
              aria-pressed={goal === example.name && price === example.price}
              onClick={() => {
                setGoal(example.name);
                setPrice(example.price);
              }}
            >
              {example.label}{" "}
              <span>${Number(example.price).toLocaleString("en-US")}</span>
            </button>
          ))}
        </div>
        <div className="planner-pair">
          <MoneyField
            label="How much it costs"
            value={price}
            onChange={setPrice}
            error={typeof parsed.price === "string" ? parsed.price : null}
          />
          <MoneyField
            label="Already saved"
            value={saved}
            onChange={setSaved}
            error={typeof parsed.saved === "string" ? parsed.saved : null}
          />
        </div>

        <fieldset className="planner-fieldset">
          <legend>How do you want to plan?</legend>
          <div className="planner-segments planner-segments-2">
            <SegmentButton
              active={mode === "pace"}
              onClick={() => setMode("pace")}
            >
              <Gauge size={17} aria-hidden="true" /> I know what I can save
            </SegmentButton>
            <SegmentButton
              active={mode === "deadline"}
              onClick={() => setMode("deadline")}
            >
              <CalendarClock size={17} aria-hidden="true" /> I have a deadline
            </SegmentButton>
          </div>
        </fieldset>

        {mode === "pace" ? (
          <MoneyField
            label="Amount you’ll put away each time"
            value={deposit}
            onChange={setDeposit}
            error={typeof parsed.deposit === "string" ? parsed.deposit : null}
          />
        ) : (
          <DateField
            label="When do you want it by?"
            value={deadlineKey}
            min={todayKey ?? undefined}
            onChange={setDeadline}
            error={deadlineError}
          />
        )}

        <fieldset className="planner-fieldset">
          <legend>How often you’ll save</legend>
          <div className="planner-segments planner-segments-3">
            {FREQUENCIES.map((option) => (
              <SegmentButton
                key={option.id}
                active={frequency === option.id}
                onClick={() => setFrequency(option.id)}
              >
                {option.label}
              </SegmentButton>
            ))}
          </div>
        </fieldset>

        <fieldset className="planner-fieldset">
          <legend>Where you keep the money</legend>
          <div className="planner-segments planner-segments-3">
            {RATE_PRESETS.map((preset) =>
              preset.term ? (
                <div key={preset.value} className="planner-segment-with-tip">
                  <SegmentButton
                    active={Number(apy) === Number(preset.value)}
                    onClick={() => setApy(preset.value)}
                  >
                    <span>{preset.label}</span>
                    <small>{preset.value}% a year</small>
                  </SegmentButton>
                  <InfoTip
                    term={preset.term}
                    text={DEFINITIONS.highYield}
                    align="end"
                  />
                </div>
              ) : (
                <SegmentButton
                  key={preset.value}
                  active={Number(apy) === Number(preset.value)}
                  onClick={() => setApy(preset.value)}
                >
                  <span>{preset.label}</span>
                  <small>{preset.value}% a year</small>
                </SegmentButton>
              ),
            )}
          </div>
          <PercentField
            label="Interest rate (APY)"
            tip={<InfoTip term="APY" text={DEFINITIONS.apy} />}
            hint="Banks list this as APY. You can type the exact rate here."
            value={apy}
            onChange={setApy}
            error={typeof parsed.apy === "string" ? parsed.apy : null}
          />
        </fieldset>

        <details className="planner-more">
          <summary>More options</summary>
          <div className="planner-inflation">
            <h3>
              Watch out for inflation!
              <InfoTip term="inflation" text={DEFINITIONS.inflation} />
            </h3>
            <p>
              Your goal could cost more by the time you’re ready to buy it.
              Look up how prices for that item or experience have changed to
              help estimate a yearly increase. Not everything follows the
              overall inflation rate, and past changes don’t guarantee future
              prices. Leave this at 0% if you want to assume the price stays
              the same.
            </p>
            <PercentField
              label="Estimated price increase per year (%)"
              hint="This percentage is an assumption used for planning, not a prediction."
              value={priceGrowth}
              onChange={setPriceGrowth}
              error={
                typeof parsed.priceGrowth === "string"
                  ? parsed.priceGrowth
                  : null
              }
            />
          </div>
          <MoneyField
            label="What you earn in a week (optional)"
            hint="We’ll show what share of your pay this plan takes."
            value={income}
            onChange={setIncome}
            error={typeof parsed.income === "string" ? parsed.income : null}
          />
        </details>
      </form>

      <section className="planner-results" aria-live="polite">
        {result}
      </section>
    </div>
  );
}

function ResultPlaceholder() {
  return (
    <div className="planner-empty">
      <PiggyBank size={36} strokeWidth={1.4} aria-hidden="true" />
      <p>Fix the highlighted fields to see your plan.</p>
    </div>
  );
}

type PaceProps = {
  input: PlanInput;
  goalName: string;
  incomePerWeek: number;
  onDeposit: (value: number) => void;
  onApy: (value: number) => void;
};

function PaceResult({
  input,
  goalName,
  incomePerWeek,
  onDeposit,
  onApy,
}: PaceProps) {
  const plan = projectPlan(input);

  if (plan.reached && plan.deposits === 0) {
    return (
      <ResultHeadline
        eyebrow="Good news"
        title={`You already have enough for ${goalName}.`}
      />
    );
  }

  if (!plan.reached) {
    return (
      <>
        <ResultHeadline
          eyebrow="Not there yet"
          title={
            input.deposit === 0
              ? "Add an amount to save each time to see your finish date."
              : `At this pace, ${goalName} stays out of reach for 50 years.`
          }
          detail={
            input.deposit > 0 && input.priceGrowth > 0
              ? "The price is rising faster than your savings. Try saving more each time or lowering the price increase."
              : undefined
          }
        />
      </>
    );
  }

  const bump = input.deposit >= 50 ? 10 : 5;
  const faster = projectPlan({ ...input, deposit: input.deposit + bump });
  const withInterest = input.apy < 4 ? projectPlan({ ...input, apy: 4 }) : null;
  const soonerBy = (other: Plan) =>
    duration(other.finishDate!, plan.finishDate!);

  return (
    <>
      <ResultHero
        eyebrow="You’ll have enough by"
        value={longDate.format(plan.finishDate!)}
        detail={`That’s ${duration(input.start, plan.finishDate!)} from now, with ${plan.deposits} deposits of ${formatMoney(input.deposit)} ${frequencyPhrase(input.frequency)} for ${goalName}.`}
      />
      <PlanStats
        plan={plan}
        input={input}
        deposit={input.deposit}
        incomePerWeek={incomePerWeek}
      />
      <SavingsChart plan={plan} goalName={goalName} />
      <div className="planner-whatifs">
        <h3>
          <Sparkles size={18} aria-hidden="true" /> Ways to get there sooner
        </h3>
        <ul>
          {faster.finishDate &&
            faster.finishDate.getTime() < plan.finishDate!.getTime() && (
              <WhatIf
                title={`Save ${formatMoney(input.deposit + bump)} instead`}
                detail={`You’d finish ${longDate.format(faster.finishDate)}, ${soonerBy(faster)} sooner.`}
                onApply={() => onDeposit(input.deposit + bump)}
              />
            )}
          {withInterest?.finishDate &&
            withInterest.finishDate.getTime() < plan.finishDate!.getTime() && (
              <WhatIf
                title="Keep it in a 4% high-yield savings account"
                detail={`You’d finish ${longDate.format(withInterest.finishDate)}, and the bank would add ${formatMoney(withInterest.interest)} in interest.`}
                onApply={() => onApy(4)}
              />
            )}
          {withInterest?.finishDate &&
            withInterest.finishDate.getTime() ===
              plan.finishDate!.getTime() && (
              <li className="planner-whatif-note">
                Interest barely matters for a short plan like this one. It
                starts to add up when you save for a year or more.
              </li>
            )}
        </ul>
      </div>
      <Milestones plan={plan} />
      <Schedule plan={plan} />
    </>
  );
}

type DeadlineProps = {
  input: Omit<PlanInput, "deposit">;
  deadline: Date;
  goalName: string;
  incomePerWeek: number;
  onSaved: (value: number) => void;
  onDeadline: (date: Date) => void;
  onApy: (value: number) => void;
};

function DeadlineResult({
  input,
  deadline,
  goalName,
  incomePerWeek,
  onSaved,
  onDeadline,
  onApy,
}: DeadlineProps) {
  const result = planForDeadline(input, deadline);
  const frequencyLabel = frequencyPhrase(input.frequency);

  if (result.status === "already-there") {
    return (
      <ResultHeadline
        eyebrow="Good news"
        title={`You already have enough for ${goalName}, so there’s nothing left to save.`}
      />
    );
  }
  if (result.status === "too-soon") {
    return (
      <ResultHeadline
        eyebrow="Too soon"
        title="That date comes before your first deposit."
        detail="Pick a later date or save more often."
      />
    );
  }

  const later = planForDeadline(input, addPeriods(deadline, "monthly", 1));
  const headStart = planForDeadline(
    { ...input, saved: input.saved + 50 },
    deadline,
  );
  const withInterest =
    input.apy < 4 ? planForDeadline({ ...input, apy: 4 }, deadline) : null;

  return (
    <>
      <ResultHero
        eyebrow="Save"
        value={`${formatMoney(result.deposit)} ${frequencyLabel}`}
        detail={`That gets you ${goalName} by ${longDate.format(deadline)}, with ${result.deposits} deposits over ${duration(input.start, deadline)}.`}
      />
      <PlanStats
        plan={result.plan}
        input={input}
        deposit={result.deposit}
        incomePerWeek={incomePerWeek}
      />
      <SavingsChart plan={result.plan} goalName={goalName} />
      <div className="planner-whatifs">
        <h3>
          <Sparkles size={18} aria-hidden="true" /> Ways to make it easier
        </h3>
        <ul>
          {later.status === "planned" && (
            <WhatIf
              title="Give yourself one more month"
              detail={`You’d only need ${formatMoney(later.deposit)} ${frequencyLabel}.`}
              onApply={() => onDeadline(addPeriods(deadline, "monthly", 1))}
            />
          )}
          {headStart.status === "planned" && (
            <WhatIf
              title="Start with $50 more saved"
              detail={`Birthday money or a side job would drop it to ${formatMoney(headStart.deposit)} ${frequencyLabel}.`}
              onApply={() => onSaved(input.saved + 50)}
            />
          )}
          {withInterest?.status === "planned" &&
            withInterest.deposit < result.deposit && (
              <WhatIf
                title="Keep it in a 4% high-yield savings account"
                detail={`Interest would cover part of it, so you’d need ${formatMoney(withInterest.deposit)} ${frequencyLabel}.`}
                onApply={() => onApy(4)}
              />
            )}
        </ul>
      </div>
      <Milestones plan={result.plan} />
      <Schedule plan={result.plan} />
    </>
  );
}

function ResultHero({
  eyebrow,
  value,
  detail,
}: {
  eyebrow: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="planner-hero">
      <p className="planner-hero-eyebrow">
        <Target size={16} aria-hidden="true" /> {eyebrow}
      </p>
      <h2 className="planner-hero-value">{value}</h2>
      <p className="planner-hero-detail">{detail}</p>
    </div>
  );
}

// A small "i" button that reveals a plain-language definition. It works with touch, mouse, and keyboard,
// and closes on Escape, on an outside tap, or with its own close button.
function InfoTip({
  term,
  text,
  align = "start",
}: {
  term: string;
  text: string;
  align?: "start" | "end";
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <span className={`info-tip info-tip-${align}`} ref={root}>
      <button
        ref={button}
        type="button"
        className="info-tip-button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`What does ${term} mean?`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <Info size={15} aria-hidden="true" />
      </button>
      {open && (
        <span id={id} role="note" className="info-tip-panel">
          <span className="info-tip-text">{text}</span>
          <button
            type="button"
            className="info-tip-close"
            aria-label="Close explanation"
            onClick={() => {
              setOpen(false);
              button.current?.focus();
            }}
          >
            <X size={15} aria-hidden="true" />
          </button>
        </span>
      )}
    </span>
  );
}

function ResultHeadline({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
}) {
  return (
    <div className="planner-headline">
      <p>
        <Target size={16} aria-hidden="true" /> {eyebrow}
      </p>
      <h2>{title}</h2>
      {detail && <span>{detail}</span>}
    </div>
  );
}

function PlanStats({
  plan,
  input,
  deposit,
  incomePerWeek,
}: {
  plan: Plan;
  input: Omit<PlanInput, "deposit">;
  deposit: number;
  incomePerWeek: number;
}) {
  const yearly = deposit * perYear(input.frequency);
  const shareOfPay = incomePerWeek > 0 ? (yearly / 52 / incomePerWeek) * 100 : 0;
  return (
    <>
      <dl className="planner-stats">
        <div>
          <dt>From you</dt>
          <dd>{money.format(plan.deposited)}</dd>
        </div>
        <div>
          <dt>From interest</dt>
          <dd className="text-blue">{money.format(plan.interest)}</dd>
        </div>
        <div>
          <dt>{input.priceGrowth > 0 ? "Price by then" : "Goal price"}</dt>
          <dd>{money.format(plan.finalPrice)}</dd>
        </div>
        <div>
          <dt>Works out to</dt>
          <dd>{cents.format(yearly / 365)} a day</dd>
        </div>
      </dl>
      {incomePerWeek > 0 && (
        <p
          className={`planner-pay-note ${shareOfPay > 100 ? "is-over" : ""}`}
        >
          {shareOfPay > 100
            ? `This plan needs more than you earn each week (${Math.round(shareOfPay)}% of your pay). Try a later date or a smaller goal.`
            : `This plan uses ${Math.round(shareOfPay)}% of what you earn each week${shareOfPay > 50 ? ", which is a lot to keep up, so a later date could make it more realistic." : "."}`}
        </p>
      )}
    </>
  );
}

function sample<T>(items: T[], max: number) {
  if (items.length <= max) return items;
  const step = (items.length - 1) / (max - 1);
  return Array.from(
    { length: max },
    (_, index) => items[Math.round(index * step)],
  );
}

// The chart runs from the first day of the current month to the last day of the plan's final month,
// so every calendar month gets its own label.
function monthsBetween(start: Date, end: Date) {
  const months: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1, 12);
  const last = new Date(end.getFullYear(), end.getMonth(), 1, 12);
  while (cursor.getTime() <= last.getTime()) {
    months.push(new Date(cursor.getTime()));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setWidth(Math.round(node.clientWidth) || fallback);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [fallback]);
  return { ref, width };
}

function SavingsChart({ plan, goalName }: { plan: Plan; goalName: string }) {
  const titleId = useId();
  const { ref: scroller, width: available } = useWidth<HTMLDivElement>(640);
  const points = sample(plan.points, 120);
  const first = points[0];
  const last = points[points.length - 1];
  const months = monthsBetween(first.date, last.date);
  // Long plans get tighter columns so a decade of months stays scrollable rather than endless.
  const monthWidth = months.length > 24 ? 46 : 64;
  const pad = { top: 18, right: 18, bottom: 48, left: 58 };
  const width = Math.max(
    available,
    pad.left + pad.right + months.length * monthWidth,
  );
  const height = 272;
  const startTime = months[0].getTime();
  const endOfLastMonth = new Date(
    last.date.getFullYear(),
    last.date.getMonth() + 1,
    0,
    12,
  ).getTime();
  const span = Math.max(1, endOfLastMonth - startTime);
  const top =
    Math.max(...points.map((point) => Math.max(point.balance, point.price))) *
    1.08;
  const x = (date: Date | number) =>
    pad.left +
    (((typeof date === "number" ? date : date.getTime()) - startTime) / span) *
      (width - pad.left - pad.right);
  const y = (value: number) =>
    pad.top + (1 - value / top) * (height - pad.top - pad.bottom);
  const line = (value: (point: (typeof points)[number]) => number) =>
    points.map((point) => `${x(point.date)},${y(value(point))}`).join(" ");
  const area = (
    upper: (point: (typeof points)[number]) => number,
    lower: (point: (typeof points)[number]) => number,
  ) =>
    `${line(upper)} ${[...points]
      .reverse()
      .map((point) => `${x(point.date)},${y(lower(point))}`)
      .join(" ")}`;
  const ticks = [0, top / 2, top];
  const finish = plan.finishDate;
  const finishPoint = finish
    ? plan.points.find((point) => point.date.getTime() === finish.getTime())
    : null;
  const baseline = y(0);
  const scrolls = width > available;

  return (
    <figure className="planner-chart">
      <div
        ref={scroller}
        className={`planner-chart-scroll ${scrolls ? "is-scrollable" : ""}`}
        tabIndex={scrolls ? 0 : undefined}
        aria-label={scrolls ? "Savings chart. Scroll sideways to see every month." : undefined}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={titleId}
        >
          <title id={titleId}>
            {`Savings growth toward ${goalName} from ${monthName.format(months[0])} ${months[0].getFullYear()} to ${monthName.format(months[months.length - 1])} ${months[months.length - 1].getFullYear()}: from ${money.format(first.balance)} to ${money.format(last.balance)}, with ${money.format(plan.interest)} from interest.`}
          </title>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={y(tick)}
                y2={y(tick)}
                className="chart-grid"
              />
              <text
                x={pad.left - 10}
                y={y(tick) + 4}
                className="chart-label"
                textAnchor="end"
              >
                {money.format(tick)}
              </text>
            </g>
          ))}
          {months.map((month, index) => {
            const next =
              index + 1 < months.length
                ? months[index + 1].getTime()
                : endOfLastMonth;
            const left = x(month);
            const center = (left + x(next)) / 2;
            const newYear = index === 0 || month.getMonth() === 0;
            return (
              <g key={month.getTime()}>
                {index > 0 && (
                  <line
                    x1={left}
                    x2={left}
                    y1={pad.top}
                    y2={baseline + 6}
                    className={newYear ? "chart-month-line is-year" : "chart-month-line"}
                  />
                )}
                <text
                  x={center}
                  y={baseline + 22}
                  className={newYear ? "chart-label chart-month is-year" : "chart-label chart-month"}
                  textAnchor="middle"
                >
                  {monthName.format(month)}
                </text>
                {newYear && (
                  <text
                    x={center}
                    y={baseline + 38}
                    className="chart-label chart-year"
                    textAnchor="middle"
                  >
                    {month.getFullYear()}
                  </text>
                )}
              </g>
            );
          })}
          <polygon
            points={area((point) => point.deposited, () => 0)}
            className="chart-deposits"
          />
          <polygon
            points={area(
              (point) => point.balance,
              (point) => point.deposited,
            )}
            className="chart-interest"
          />
          <polyline
            points={line((point) => point.balance)}
            className="chart-balance"
          />
          <polyline
            points={line((point) => point.price)}
            className="chart-goal"
          />
          {finishPoint && (
            <circle
              cx={x(finishPoint.date)}
              cy={y(finishPoint.balance)}
              r="6"
              className="chart-finish"
            />
          )}
        </svg>
      </div>
      <figcaption>
        <span>
          <i className="key-deposits" /> Your deposits
        </span>
        {plan.interest >= 0.5 && (
          <span>
            <i className="key-interest" /> Interest
          </span>
        )}
        <span>
          <i className="key-goal" /> Goal price
        </span>
        {scrolls && <span className="chart-scroll-hint">Scroll sideways to see every month</span>}
      </figcaption>
    </figure>
  );
}

function Milestones({ plan }: { plan: Plan }) {
  const marks = milestoneDates(plan).filter((mark) => mark.date);
  if (marks.length === 0) return null;
  return (
    <ol className="planner-milestones" aria-label="Milestones">
      {marks.map((mark) => (
        <li key={mark.fraction}>
          <strong>{mark.fraction * 100}%</strong>
          <span>{longDate.format(mark.date!)}</span>
        </li>
      ))}
      <li>
        <strong>100%</strong>
        <span>{longDate.format(plan.finishDate!)}</span>
      </li>
    </ol>
  );
}

function Schedule({ plan }: { plan: Plan }) {
  const rows = plan.points.slice(1);
  return (
    <details className="planner-schedule">
      <summary>
        <TrendingUp size={17} aria-hidden="true" /> See every deposit (
        {rows.length})
      </summary>
      <div className="planner-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Saved so far</th>
              <th scope="col">Interest so far</th>
              <th scope="col">Goal price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((point) => (
              <tr key={point.date.getTime()}>
                <td>{longDate.format(point.date)}</td>
                <td>{cents.format(point.balance)}</td>
                <td>{cents.format(point.interest)}</td>
                <td>{cents.format(point.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function WhatIf({
  title,
  detail,
  onApply,
}: {
  title: string;
  detail: string;
  onApply: () => void;
}) {
  return (
    <li>
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <button type="button" onClick={onApply}>
        Use this
      </button>
    </li>
  );
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string | null;
  tip?: React.ReactNode;
};

function FieldShell({
  id,
  label,
  hint,
  error,
  tip,
  children,
}: Omit<FieldProps, "value" | "onChange"> & {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`planner-field ${error ? "has-error" : ""}`}>
      <div className="planner-label-row">
        <label htmlFor={id}>{label}</label>
        {tip}
      </div>
      {hint && <p id={`${id}-hint`}>{hint}</p>}
      {children}
      {error && (
        <p id={`${id}-error`} className="planner-error">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string | null) {
  return (
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") ||
    undefined
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: FieldProps & { placeholder: string; maxLength: number }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label}>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

function MoneyField({ label, value, onChange, hint, error }: FieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="planner-affix">
        <span aria-hidden="true">$</span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, hint, error)}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </FieldShell>
  );
}

function PercentField({
  label,
  value,
  onChange,
  hint,
  error,
  tip,
}: FieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} tip={tip}>
      <div className="planner-affix planner-affix-end">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, hint, error)}
          onChange={(event) => onChange(event.target.value)}
        />
        <span aria-hidden="true">% a year</span>
      </div>
    </FieldShell>
  );
}

function DateField({
  label,
  value,
  min,
  onChange,
  error,
}: FieldProps & { min?: string }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error}>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, undefined, error)}
        onChange={(event) => event.target.value && onChange(event.target.value)}
      />
    </FieldShell>
  );
}
