'use client';

// ============================================================
// IntroGate — isolated full-screen entrance overlay for LOWKEY.
//
// A self-contained React component that renders a fixed overlay
// on top of the existing ArchiveScene. The overlay has three
// visual states (idle / facing / opening / leaving) and is
// removed from the DOM once the entrance animation completes.
//
// Hard rules enforced by this component:
//   * no Canvas / WebGL / 3D engine of any kind
//   * no remote assets, no new fonts
//   * no mutation of the existing ArchiveScene canvas
//   * no automatic audio (VinylBgm stays untouched)
//   * sessionStorage only — never localStorage
//   * cleans up every timer, pointer, and keyboard listener
//   * double-click / multi-trigger is debounced
//   * prefers-reduced-motion: reduce → 100-180ms plain fade
//   * Esc always available as an a11y skip
// ============================================================

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import { SITE } from '@/data/series';
import styles from './IntroGate.module.css';

const SESSION_KEY = 'lowkey:intro-seen:v1';
const EASE_CSS = 'cubic-bezier(.22, 1, .36, 1)';

// Phase timing (ms). The three windows overlap so the visual feels
// continuous rather than stepped.
const T_FACE = 420;          // edge-on → face-on
const T_FACE_OVERLAP = 280;  // begin opening before fully facing
const T_OPEN = 800;           // face-on → opened left
const T_LOWKEY_HOLD = 700;    // LOWKEY starts fading here
const T_CLEAR = 600;          // overlay fully cleared after this
const T_REDUCED = 140;        // prefers-reduced-motion: instant-ish
const T_ARCHIVE_WAIT = 2600;  // never hold the entrance indefinitely

type Phase = 'idle' | 'facing' | 'opening' | 'leaving' | 'done';

export interface IntroGateProps {
  /** Bypass sessionStorage and force the gate to show. */
  force?: boolean;
  /** Fired after the gate has fully unmounted. */
  onDismiss?: () => void;
}

function readSeen(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeSeen(): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, 'true');
  } catch {
    // Storage may be unavailable (private mode, embedded webview, etc.).
    // The visual flow still works — the gate just won't remember next time.
  }
}

export function IntroGate({ force = false, onDismiss }: IntroGateProps): JSX.Element | null {
  const [phase, setPhase] = useState<Phase>('idle');
  const [mounted, setMounted] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [archiveReady, setArchiveReady] = useState<boolean>(false);
  const [pointer, setPointer] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const enterButtonRef = useRef<HTMLButtonElement>(null);
  const triggeredRef = useRef<boolean>(false);
  const archiveReadyRef = useRef<boolean>(false);
  const timerHandles = useRef<number[]>([]);
  const rafHandle = useRef<number | null>(null);

  // ----- initial gate decision: show or skip ----------------------
  useEffect(() => {
    if (!force && readSeen()) {
      setMounted(false);
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onMqChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mq.addEventListener('change', onMqChange);

    // Focus the enter button so keyboard users can press Enter / Space
    // immediately. preventScroll keeps the page from jumping while the
    // underlying ArchiveScene is still in its loading veil.
    const focusTimer = window.setTimeout(() => {
      enterButtonRef.current?.focus({ preventScroll: true });
    }, 80);

    return () => {
      mq.removeEventListener('change', onMqChange);
      window.clearTimeout(focusTimer);
    };
  }, [force]);

  // The archive scene is intentionally left untouched. We only observe its
  // existing loading veil so the entrance never reveals an in-progress WebGL
  // bootstrap screen as if it were part of the finished composition.
  useEffect(() => {
    if (!mounted) return;

    let stopped = false;
    let handle: number | null = null;
    const check = () => {
      if (stopped) return;
      const ready = Boolean(document.querySelector('[data-ready="true"]'));
      archiveReadyRef.current = ready;
      setArchiveReady(ready);
      if (!ready) handle = window.setTimeout(check, 80);
    };

    check();
    return () => {
      stopped = true;
      if (handle !== null) window.clearTimeout(handle);
    };
  }, [mounted]);

  // ----- pointer parallax (idle only, very subtle) ----------------
  useEffect(() => {
    if (!mounted) return;
    if (reducedMotion) return;

    let lastClientX = 0;
    let lastClientY = 0;
    let pending = false;

    const apply = () => {
      pending = false;
      // Pointer ranges roughly -1..1 across viewport. The door and the
      // specular highlight react to this; the title text does not.
      const x = (lastClientX / window.innerWidth - 0.5) * 2;
      const y = (lastClientY / window.innerHeight - 0.5) * 2;
      setPointer({ x, y });
    };

    const onPointerMove = (event: PointerEvent) => {
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      if (pending) return;
      pending = true;
      rafHandle.current = window.requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (rafHandle.current !== null) {
        window.cancelAnimationFrame(rafHandle.current);
        rafHandle.current = null;
      }
    };
  }, [mounted, reducedMotion]);

  // ----- dismiss / skip -------------------------------------------
  const finish = useCallback(
    (skip: boolean) => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;

      const totalFadeMs = reducedMotion || skip ? T_REDUCED : T_CLEAR;

      if (reducedMotion || skip) {
        // The reduced-motion path skips every motion stage and just
        // fades the overlay. This satisfies the 100-180ms requirement.
        const handle = window.setTimeout(() => {
          writeSeen();
          setMounted(false);
          setPhase('done');
          onDismiss?.();
        }, totalFadeMs);
        timerHandles.current.push(handle);
        return;
      }

      setPhase('facing');
      const startOpening = () => {
        setPhase('opening');
        const t2 = window.setTimeout(() => setPhase('leaving'), T_OPEN - T_FACE_OVERLAP);
        const t3 = window.setTimeout(() => {
          writeSeen();
          setMounted(false);
          setPhase('done');
          onDismiss?.();
        }, T_LOWKEY_HOLD + totalFadeMs);
        timerHandles.current.push(t2, t3);
      };

      const t1 = window.setTimeout(() => {
        if (archiveReadyRef.current) {
          startOpening();
          return;
        }

        const waitStarted = performance.now();
        const waitForArchive = () => {
          if (archiveReadyRef.current || performance.now() - waitStarted >= T_ARCHIVE_WAIT) {
            startOpening();
            return;
          }
          const waitHandle = window.setTimeout(waitForArchive, 80);
          timerHandles.current.push(waitHandle);
        };
        waitForArchive();
      }, T_FACE);

      timerHandles.current.push(t1);
    },
    [onDismiss, reducedMotion],
  );

  // ----- keyboard (Enter / Space / Esc) ---------------------------
  useEffect(() => {
    if (!mounted) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        finish(true);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        // Trigger regardless of focus location. If a real <button> is
        // focused, the browser will also fire a click; triggeredRef
        // debounces so we never double-dismiss.
        event.preventDefault();
        finish(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted, finish]);

  // ----- cleanup all timers + raf on unmount ----------------------
  useEffect(() => {
    return () => {
      timerHandles.current.forEach((handle) => window.clearTimeout(handle));
      timerHandles.current = [];
      if (rafHandle.current !== null) {
        window.cancelAnimationFrame(rafHandle.current);
        rafHandle.current = null;
      }
    };
  }, []);

  if (!mounted || phase === 'done') return null;

  // Parallax values. Kept inside the 4-6px / 0.8-1.2° envelope so
  // the door feels like it's breathing, not being thrown around.
  const px = pointer.x;
  const py = pointer.y;
  const doorTx = px * 4;
  const doorTy = py * 3;
  const doorRotX = py * 0.8;
  const doorRotY = px * 1.0;
  const specX = px * 14;
  const specY = py * 18;

  // The intro container sets the perspective. The door itself owns
  // its rotateY / rotateX and translate values. transform-origin is
  // moved to the left edge in the opening phase to simulate the
  // left-hinge swing.
  const perspective = 1500;
  const idleStyle: CSSProperties = {
    transform: `perspective(${perspective}px) translate3d(${doorTx}px, ${doorTy}px, 0) rotateX(${doorRotX}deg) rotateY(${-86 + doorRotY}deg)`,
    transformOrigin: '50% 50%',
    transition: `transform 520ms ${EASE_CSS}`,
  };
  const facingStyle: CSSProperties = {
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`,
    transformOrigin: '50% 50%',
    transition: `transform ${T_FACE}ms ${EASE_CSS}`,
  };
  const openingStyle: CSSProperties = {
    transform: `perspective(${perspective}px) rotateY(-108deg)`,
    transformOrigin: '0% 50%',
    transition: `transform ${T_OPEN}ms ${EASE_CSS}`,
  };
  const leavingStyle: CSSProperties = {
    transform: `perspective(${perspective}px) rotateY(-112deg)`,
    transformOrigin: '0% 50%',
    transition: `transform 320ms ${EASE_CSS}`,
  };

  const doorStyle: CSSProperties =
    phase === 'idle' ? idleStyle
    : phase === 'facing' ? facingStyle
    : phase === 'opening' ? openingStyle
    : leavingStyle;

  const highlightStyle: CSSProperties = {
    transform: `translate3d(${specX}px, ${specY}px, 0)`,
    transition: 'transform 480ms cubic-bezier(.22, 1, .36, 1)',
  };

  return (
    <div
      className={styles.gate}
      data-phase={phase}
      data-reduced={reducedMotion ? 'true' : 'false'}
      data-archive-ready={archiveReady ? 'true' : 'false'}
      role="presentation"
    >
      <div className={styles.paper} aria-hidden="true">
        <div className={styles.paperGrain} />
        <div className={styles.paperVignette} />
      </div>

      {/**
       * The aperture is deliberately part of the isolated gate. It is only
       * a quiet optical registration frame; the archive below remains the
       * real, untouched scene. During the opening phase the paper mask widens
       * behind this frame so the collection is revealed through the door.
       */}
      <div className={styles.aperture} aria-hidden="true" />

      <div
        className={styles.door}
        style={doorStyle}
        aria-hidden="true"
      >
        <div className={styles.doorFace} />
        <div className={styles.doorHighlight} style={highlightStyle} />
        <span className={`${styles.doorEdge} ${styles.doorEdgeLeft}`} />
        <span className={`${styles.doorEdge} ${styles.doorEdgeRight}`} />
        <span className={`${styles.doorHinge} ${styles.doorHingeTop}`} />
        <span className={`${styles.doorHinge} ${styles.doorHingeBottom}`} />
        <span className={styles.doorContact} />
        <span className={styles.doorBevel} />
      </div>

      <div className={styles.copy}>
        <h1 className={styles.title}>{SITE.name}</h1>
        <p className={styles.subtitle}>{SITE.tagline}</p>
        <button
          ref={enterButtonRef}
          type="button"
          className={styles.enter}
          onClick={() => finish(false)}
          aria-label="Enter the archive"
        >
          <span className={styles.enterText}>ENTER ARCHIVE</span>
          <span className={styles.enterUnderline} aria-hidden="true" />
        </button>
        <p className={styles.srOnly} aria-live="polite">
          {phase === 'idle'
            ? `${SITE.name} entrance. Press Enter, Space, or click ENTER ARCHIVE to enter.`
            : `${SITE.name} entrance dismissed. Archive revealed.`}
        </p>
      </div>

      {/*
        Screen-reader-only skip cue. The visible UI must remain
        silent and minimal; this is the only explicit skip affordance
        surfaced to assistive tech, in addition to the Escape key.
      */}
      <button
        type="button"
        className={styles.skip}
        onClick={() => finish(true)}
        aria-label="Skip entrance and open the archive"
      >
        <span>SKIP</span>
      </button>
    </div>
  );
}
