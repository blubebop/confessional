'use client';

import { type CSSProperties, type JSX, useEffect, useId, useRef } from 'react';
import { BOARD_SIZE, atmosphereStage, formatBlessing, type GameState } from '@/components/my-game/engine';
import SacredSymbol from '@/components/my-game/SacredSymbol';

interface Props {
  state: GameState;
  onPanel: (id: number) => void;
  onCashout: () => void;
  onReset: () => void;
  onRewatch: () => void;
}
function Candlestick({ side }: { side: 'left' | 'right' }): JSX.Element {
  const brassId = useId();
  return <div className={`cf-candle cf-candle-${side}`} aria-hidden="true"><i /><b />
    <svg className="cf-candlestick" viewBox="0 0 64 200" preserveAspectRatio="none">
      <defs><linearGradient id={brassId}><stop stopColor="#302012" /><stop offset=".28" stopColor="#927044" /><stop offset=".47" stopColor="#d8b477" /><stop offset=".58" stopColor="#957044" /><stop offset="1" stopColor="#382617" /></linearGradient></defs>
      <g fill={`url(#${brassId})`} stroke="#392719" strokeWidth="1">
        <path d="M9 1h46l-5 9H14z M22 10h20l-3 11H25z" />
        <ellipse cx="32" cy="28" rx="12" ry="10" />
        <path d="M27 36h10l-2 113 8 9v8H21v-8l8-9z" />
        <ellipse cx="32" cy="167" rx="14" ry="9" />
        <path d="M23 171h18l5 13 12 8v6H6v-6l12-8z" />
        <path d="M4 195h56v5H4z" />
      </g>
      <path d="M30 43v102 M18 192h28 M17 5h28" fill="none" stroke="#e9ca8b" strokeOpacity=".4" />
    </svg>
  </div>;
}

export default function MyGameWindow({ state, onPanel, onCashout, onReset, onRewatch }: Props): JSX.Element {
  const { round, phase } = state;
  const finished = state.currentView === 2;
  const lost = phase === 'lost';
  const count = round?.safeRevealCount ?? 0;
  const stage = phase === 'won' ? 0 : atmosphereStage(count, state.mortalSinCount);
  const resultRef = useRef<HTMLDivElement>(null);
  const gazeRef = useRef<HTMLDivElement>(null);
  const replaying = phase === 'replaying';
  useEffect(() => {
    const gaze = gazeRef.current;
    if (!gaze) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame: number | null = null;
    const center = (): void => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      gaze.style.setProperty('--gaze-x', '0');
      gaze.style.setProperty('--gaze-y', '0');
    };
    const track = (event: PointerEvent): void => {
      if (motion.matches || finished || replaying || event.pointerType === 'touch') { center(); return; }
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = gaze.getBoundingClientRect();
        const x = (event.clientX - bounds.left - bounds.width / 2) / (innerWidth / 2);
        const y = (event.clientY - bounds.top - bounds.height / 2) / (innerHeight / 2);
        gaze.style.setProperty('--gaze-x', String(Math.max(-1, Math.min(1, x))));
        gaze.style.setProperty('--gaze-y', String(Math.max(-1, Math.min(1, y))));
        frame = null;
      });
    };
    const leave = (event: PointerEvent): void => { if (!event.relatedTarget) center(); };
    center();
    window.addEventListener('pointermove', track, { passive: true });
    window.addEventListener('pointerout', leave);
    window.addEventListener('blur', center);
    motion.addEventListener('change', center);
    return () => {
      center();
      window.removeEventListener('pointermove', track);
      window.removeEventListener('pointerout', leave);
      window.removeEventListener('blur', center);
      motion.removeEventListener('change', center);
    };
  }, [finished, replaying]);
  useEffect(() => { if (finished) resultRef.current?.focus(); }, [finished]);
  const currentFactor = round?.finalPayoutFactor ?? 0;
  return <div className={`cf-scene absolute inset-0 cf-stage-${stage} ${lost ? 'cf-condemned' : ''} ${phase === 'won' ? 'cf-absolved' : ''}`}
    style={{ '--atmosphere-level': stage } as CSSProperties}>
    <div className="cf-wall cf-wall-left" aria-hidden="true" /><div className="cf-wall cf-wall-right" aria-hidden="true" />
    <Candlestick side="left" /><Candlestick side="right" />
    <div className="cf-depth-haze" aria-hidden="true" />
    {count > 0 && <div key={count} className="cf-depth-pulse" aria-hidden="true" />}
    <div className="cf-booth">
      <div className="cf-arch" aria-hidden="true"><div className="cf-presence" />
        <div className="cf-eyes" ref={gazeRef}><div className="cf-eye-gaze"><span className="cf-eye"><i /></span><span className="cf-eye"><i /></span></div></div>
        <div className="cf-lattice" /><div className="cf-arch-rim" /></div>
      <div className="cf-inscription"><span />SPEAK, AND BE HEARD<span /></div>
      <div className="cf-board" role="group" aria-label="Sixteen confession panels">
        {Array.from({ length: BOARD_SIZE }, (_, id) => {
          const selection = round?.selections.find((s) => s.panelId === id);
          const status = selection?.result ?? 'closed';
          // Never inspect sinPanelIds here. Closed DOM is independent of hidden outcomes.
          return <button type="button" key={id} className={`cf-tile cf-tile-${status} ${state.pendingPanel === id ? 'cf-tile-pending' : ''}`}
            disabled={phase !== 'playing' || !!selection} onClick={() => onPanel(id)}
            aria-label={`Confession panel ${id + 1}, ${status === 'closed' ? 'unrevealed' : status === 'sin' ? 'Mortal Sin' : 'safe'}`}>
            <span className="cf-tile-number" aria-hidden="true">{String(id + 1).padStart(2, '0')}</span>
            <span className="cf-tile-cavity"><SacredSymbol index={selection?.symbol ?? 9} sin={status === 'sin'} /></span>
            {status === 'closed' && <span className="cf-tile-door"><SacredSymbol /><i /></span>}
            {selection && <span className="cf-reveal-order" aria-hidden="true">{round!.selections.indexOf(selection) + 1}</span>}
          </button>;
        })}
      </div>
      <div className="cf-blessing" role="status" aria-live="polite"><span>{phase === 'replaying' ? 'REPLAY CONFESSION' : 'CURRENT BLESSING'}</span>
        <strong>{currentFactor > 0 ? formatBlessing(currentFactor) : round?.selections.at(-1)?.result === 'sin' ? '0.00x' : '—'}</strong>
        <p>{phase === 'idle' ? 'Your confession awaits.' : phase === 'replaying' ? 'An echo of what came before.' : count === 0 ? 'Choose a panel. Unburden your soul.' : `${count} ${count === 1 ? 'confession' : 'confessions'} heard.`}</p>
      </div>
      {phase === 'playing' && count > 0 && <button className="cf-scene-cashout" onClick={onCashout}>SEEK ABSOLUTION · {formatBlessing(currentFactor)}</button>}
    </div>
    <div className="cf-dust" aria-hidden="true" /><div className="cf-ledge" aria-hidden="true" />
    <span className="cf-scene-corner">XVI · CONFESSIONAL</span>
    {finished && <div className={`cf-result ${lost ? 'cf-result-loss' : ''}`} ref={resultRef} tabIndex={-1} role="region" aria-label={lost ? 'Condemned result' : 'Absolved result'}>
      <div className="cf-result-inner"><SacredSymbol sin={lost} /><span className="cf-eyebrow">{round?.outcome === 'complete' ? 'YOUR CONFESSION IS COMPLETE' : 'THE CONFESSION HAS ENDED'}</span>
        <h2>{lost ? 'CONDEMNED' : 'ABSOLVED'}</h2><p>{lost ? 'YOUR OFFERING IS FORFEIT' : 'BLESSING RECEIVED'}</p>
        <strong>{formatBlessing(currentFactor)}</strong><small>DEMO RESULT · NO APE TRANSFERRED</small>
        <button className="cf-primary" onClick={onReset}>CONFESS AGAIN <span>↗</span></button><button className="cf-secondary" onClick={onRewatch}>REPLAY CONFESSION</button>
      </div>
    </div>}
  </div>;
}
