'use client';

import { useEffect, useRef, type JSX } from 'react';
import { Card } from '@/components/ui/card';
import BetAmountInput from '@/components/shared/BetAmountInput';
import { HUD_PANEL_CARD_CLASS } from '@/components/shared/GameHud';
import { cn } from '@/lib/utils';
import { BOARD_SIZE, RISKS, formatBlessing, type GameState } from '@/components/my-game/engine';
import { RISK_NAMES } from '@/components/my-game/myGameConfig';
import SacredSymbol from '@/components/my-game/SacredSymbol';

interface Props {
  state: GameState;
  onOffering: (value: number) => void;
  onRisk: (value: number) => void;
  onPlay: () => void;
  onCashout: () => void;
  onReset: () => void;
  onRewatch: () => void;
  onPlayAgain: () => void;
}
export default function MyGameSetupCard({ state, onOffering, onRisk, onPlay, onCashout, onReset, onRewatch, onPlayAgain }: Props): JSX.Element {
  const { phase, round, mortalSinCount } = state;
  const inputRoot = useRef<HTMLFieldSetElement>(null);
  useEffect(() => {
    // Supply accessible names without changing the platform-owned input.
    inputRoot.current?.querySelector('input[type="number"]')?.setAttribute('aria-label', 'Offering in demo APE');
    inputRoot.current?.querySelector('input[type="range"]')?.setAttribute('aria-label', 'Adjust Offering');
  });
  const active = phase === 'playing' || phase === 'revealing';
  const finished = state.currentView === 2;
  const count = round?.safeRevealCount ?? 0;
  const nextFactor = round?.payoutFactors[count];
  return <Card className={cn('cf-controls p-6 flex flex-col', HUD_PANEL_CARD_CLASS)}>
    <div className="cf-intro"><SacredSymbol /><span>APE CHURCH · RITUAL NO. 016</span><h2>How heavy<br />is your soul?</h2><p>Some doors are better left closed.</p></div>
    <div className="cf-demo"><i /> DEMO · NO REAL WAGERS</div>
    <fieldset ref={inputRoot} className="cf-offering" disabled={phase !== 'idle'}><legend>OFFERING <span>01</span></legend>
      <p className="cf-demo-balance">25.00 demo APE available</p>
      <BetAmountInput min={1} max={25} step={1} value={state.betAmount} onChange={onOffering} balance={25}
        disabled={phase !== 'idle'} usdMode={false} setUsdMode={() => {}} themeColorBackground="#b5965e" />
    </fieldset>
    <fieldset className="cf-risk" disabled={phase !== 'idle'}><legend>MORTAL SINS <span>02</span></legend>
      <div>{RISKS.map((risk) => <button key={risk} type="button" aria-pressed={mortalSinCount === risk} onClick={() => onRisk(risk)} disabled={phase !== 'idle'}>
        <b>{risk}</b><small>{RISK_NAMES[risk]}</small><i aria-hidden="true">{mortalSinCount === risk ? '◆' : '◇'}</i></button>)}</div>
    </fieldset>
    <div className="cf-stats"><div><span>Confessions</span><b>{count} <em>/ {BOARD_SIZE - mortalSinCount}</em></b></div>
      <div><span>Next Blessing</span><b>{!finished && nextFactor ? formatBlessing(nextFactor) : '—'}</b></div></div>
    <div className="cf-actions">
      {phase === 'idle' && <button className="cf-primary" onClick={onPlay}>ENTER CONFESSIONAL <span>↗</span></button>}
      {phase === 'starting' && <button className="cf-primary" disabled>THE CONFESSION BEGINS…</button>}
      {active && <button className="cf-primary" disabled={phase !== 'playing' || count === 0} onClick={onCashout}>SEEK ABSOLUTION {count > 0 && <span>{formatBlessing(round?.finalPayoutFactor ?? 0)}</span>}</button>}
      {phase === 'replaying' && <><p className="cf-replay-note">REPLAYING CONFESSION · {state.replayIndex}/{state.previousRound?.selections.length}</p><button className="cf-secondary" onClick={onReset}>EXIT REPLAY</button></>}
      {finished && <><button className="cf-primary" onClick={onReset}>CONFESS AGAIN <span>↗</span></button><button className="cf-secondary" onClick={onRewatch}>REPLAY CONFESSION</button><button className="cf-text-button" onClick={onPlayAgain}>Enter again · {state.betAmount} demo APE</button></>}
      {state.error && <p className="cf-error" role="alert">{state.error}</p>}
    </div>
    <p className="cf-footnote">{count === 0 && active ? 'Choose a wooden panel to begin your confession.' : 'Sixteen doors. One burden. Know when to leave.'}</p>
    <div className="cf-panel-footer"><span>APEGROUNDZ</span><span>EST. MMXXVI</span></div>
  </Card>;
}
