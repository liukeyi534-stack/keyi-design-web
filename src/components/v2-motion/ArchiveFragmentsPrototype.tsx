'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import styles from './ArchiveFragmentsPrototype.module.css';

export interface PrototypeWork {
  id: string;
  collectionId: string;
  image: string;
  titleEn: string;
  titleZh: string;
  year: number;
}

interface ArchiveFragmentsPrototypeProps {
  works: PrototypeWork[];
}

type FragmentRole = 'image' | 'acrylic' | 'metadata';

interface FragmentDefinition {
  id: string;
  work: PrototypeWork;
  role: FragmentRole;
  workIndex: number;
  seed: number;
  orbitAngle: number;
}

interface MotionFrame {
  progress: number;
  pointerX: number;
  pointerY: number;
}

const PRACTICE_STAGES = ['PROMPT', 'GENERATE', 'CURATE', 'TRANSFORM', 'ARCHIVE'] as const;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
const smoothstep = (from: number, to: number, value: number) => {
  const amount = clamp((value - from) / Math.max(0.0001, to - from));
  return amount * amount * (3 - 2 * amount);
};

const seeded = (index: number) => {
  const value = Math.sin(index * 91.731 + 17.193) * 43758.5453;
  return Number((value - Math.floor(value)).toFixed(6));
};

function createFragments(works: PrototypeWork[]): FragmentDefinition[] {
  return works.flatMap((work, workIndex) => {
    const orbitAngle = (workIndex / Math.max(1, works.length)) * Math.PI * 2 - Math.PI / 2;
    return (['acrylic', 'image', 'metadata'] as FragmentRole[]).map((role, roleIndex) => ({
      id: `${work.id}-${role}`,
      work,
      role,
      workIndex,
      orbitAngle,
      seed: seeded(workIndex * 3 + roleIndex),
    }));
  });
}

function getFragmentStyle(
  fragment: FragmentDefinition,
  frame: MotionFrame,
  totalWorks: number,
  reducedMotion: boolean,
): CSSProperties {
  const { progress, pointerX, pointerY } = frame;
  const roleIndex = fragment.role === 'acrylic' ? 0 : fragment.role === 'image' ? 1 : 2;
  const orbitToSlit = reducedMotion
    ? progress >= 0.34 ? 1 : 0
    : smoothstep(0.11, 0.43, progress);
  const slitToPractice = reducedMotion
    ? progress >= 0.7 ? 1 : 0
    : smoothstep(0.61, 0.82, progress);

  const depthFactor = (Math.sin(fragment.orbitAngle) + 1) / 2;
  const orbitX = Math.cos(fragment.orbitAngle) * 28 + 14;
  const orbitY = Math.sin(fragment.orbitAngle) * 24;
  const orbitZ = mix(-150, 170, depthFactor) + roleIndex * 7;
  const orbitRotationY = -Math.cos(fragment.orbitAngle) * 42;
  const orbitRotationZ = Math.sin(fragment.orbitAngle) * 2.4;

  const normalizedX = orbitX / 50;
  const normalizedY = orbitY / 50;
  const pointerDistance = Math.hypot(normalizedX - pointerX, normalizedY - pointerY);
  const pointerForce = (1 - smoothstep(0.04, 0.42, pointerDistance)) * (1 - orbitToSlit);
  const forceX = pointerDistance > 0.001
    ? ((normalizedX - pointerX) / pointerDistance) * pointerForce * 3.8
    : 0;
  const forceY = pointerDistance > 0.001
    ? ((normalizedY - pointerY) / pointerDistance) * pointerForce * 3.2
    : 0;

  const slitColumn = (fragment.workIndex % 4) - 1.5;
  const slitRow = Math.floor(fragment.workIndex / 4) + roleIndex * 0.18;
  const slitX = slitColumn * 1.05 + (fragment.seed - 0.5) * 0.6;
  const slitY = -31 + slitRow * 20.5;
  const slitZ = -80 + roleIndex * 24 + fragment.seed * 28;
  const slitRotationY = fragment.role === 'metadata' ? 0 : 80 + fragment.seed * 7;
  const slitRotationZ = (fragment.seed - 0.5) * 3;

  const practiceTravel = smoothstep(0.7, 1, progress);
  const stageIndex = fragment.workIndex % PRACTICE_STAGES.length;
  const row = Math.floor(fragment.workIndex / PRACTICE_STAGES.length);
  const practiceX = 66 + stageIndex * 29 + row * 3 - practiceTravel * 148;
  const practiceY = -24 + row * 22 + (roleIndex - 1) * 2.2 + (fragment.seed - 0.5) * 2.4;
  const practiceZ = -30 + roleIndex * 16 + stageIndex * 4;
  const practiceRotationY = fragment.role === 'acrylic' ? -10 : 0;
  const practiceRotationZ = (fragment.seed - 0.5) * 1.8;

  const x = mix(mix(orbitX + forceX, slitX, orbitToSlit), practiceX, slitToPractice);
  const y = mix(mix(orbitY + forceY, slitY, orbitToSlit), practiceY, slitToPractice);
  const z = mix(mix(orbitZ, slitZ, orbitToSlit), practiceZ, slitToPractice);
  const rotateY = mix(mix(orbitRotationY, slitRotationY, orbitToSlit), practiceRotationY, slitToPractice);
  const rotateZ = mix(mix(orbitRotationZ, slitRotationZ, orbitToSlit), practiceRotationZ, slitToPractice);

  const orbitScale = fragment.role === 'metadata' ? 0.72 : mix(0.76, 1.06, depthFactor);
  const slitScaleX = fragment.role === 'metadata' ? 0.22 : 0.08;
  const slitScaleY = fragment.role === 'metadata' ? 0.68 : 0.52;
  const practiceScale = fragment.role === 'metadata' ? 0.7 : fragment.role === 'acrylic' ? 0.82 : 0.9;
  const scaleX = mix(mix(orbitScale, slitScaleX, orbitToSlit), practiceScale, slitToPractice);
  const scaleY = mix(mix(orbitScale, slitScaleY, orbitToSlit), practiceScale, slitToPractice);

  let opacity = fragment.role === 'acrylic' ? 0.64 : fragment.role === 'metadata'
    ? mix(0.02, 0.76, smoothstep(0.08, 0.28, progress))
    : 1;
  if (orbitToSlit > 0.7 && slitToPractice < 0.25 && fragment.role === 'metadata') opacity *= 0.34;
  if (slitToPractice > 0.1 && fragment.workIndex >= totalWorks - 2) opacity *= 0.58;

  return {
    '--fragment-width': fragment.role === 'metadata' ? '106px' : `${112 + fragment.seed * 48}px`,
    '--fragment-height': fragment.role === 'metadata' ? '34px' : `${142 + fragment.seed * 58}px`,
    '--fragment-delay': `${-fragment.seed * 7}s`,
    '--fragment-opacity': opacity,
    transform: `translate3d(${x}vw, ${y}vh, ${z}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale3d(${scaleX}, ${scaleY}, 1)`,
    zIndex: Math.round(z + 300),
  } as CSSProperties;
}

function getChapter(progress: number) {
  if (progress < 0.34) return { index: '00', label: 'ORBIT' };
  if (progress < 0.7) return { index: '01', label: 'STATEMENT' };
  return { index: '02', label: 'PRACTICE' };
}

export function ArchiveFragmentsPrototype({ works }: ArchiveFragmentsPrototypeProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const targetProgressRef = useRef(0);
  const targetPointerRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<MotionFrame>({ progress: 0, pointerX: 0, pointerY: 0 });
  const reducedMotionRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [frame, setFrame] = useState<MotionFrame>(frameRef.current);
  const fragments = useMemo(() => createFragments(works), [works]);
  const chapter = getChapter(frame.progress);

  const updateTargetProgress = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    const limit = Math.max(1, element.scrollHeight - element.clientHeight);
    targetProgressRef.current = clamp(element.scrollTop / limit);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      reducedMotionRef.current = media.matches;
      setReducedMotion(media.matches);
    };
    onMotionChange();
    media.addEventListener('change', onMotionChange);
    return () => media.removeEventListener('change', onMotionChange);
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    let mounted = true;

    const animate = () => {
      if (!mounted) return;
      const previous = frameRef.current;
      const progressEase = reducedMotionRef.current ? 1 : 0.095;
      const pointerEase = reducedMotionRef.current ? 1 : 0.075;
      const next = {
        progress: mix(previous.progress, targetProgressRef.current, progressEase),
        pointerX: mix(previous.pointerX, targetPointerRef.current.x, pointerEase),
        pointerY: mix(previous.pointerY, targetPointerRef.current.y, pointerEase),
      };

      if (Math.abs(next.progress - targetProgressRef.current) < 0.0001) {
        next.progress = targetProgressRef.current;
      }
      if (Math.abs(next.pointerX - targetPointerRef.current.x) < 0.0001) {
        next.pointerX = targetPointerRef.current.x;
      }
      if (Math.abs(next.pointerY - targetPointerRef.current.y) < 0.0001) {
        next.pointerY = targetPointerRef.current.y;
      }

      frameRef.current = next;
      if (
        next.progress !== previous.progress
        || next.pointerX !== previous.pointerX
        || next.pointerY !== previous.pointerY
      ) {
        setFrame(next);
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => {
      mounted = false;
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    targetPointerRef.current = {
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
    };
  }, []);

  const handlePointerLeave = useCallback(() => {
    targetPointerRef.current = { x: 0, y: 0 };
  }, []);

  const goTo = useCallback((progress: number) => {
    const element = scrollRef.current;
    if (!element) return;
    const top = (element.scrollHeight - element.clientHeight) * progress;
    element.scrollTo({ top, behavior: reducedMotionRef.current ? 'auto' : 'smooth' });
  }, []);

  const statementOpacity = smoothstep(0.31, 0.43, frame.progress) * (1 - smoothstep(0.62, 0.72, frame.progress));
  const orbitOpacity = 1 - smoothstep(0.12, 0.3, frame.progress);
  const practiceOpacity = smoothstep(0.68, 0.79, frame.progress);
  const slitPresence = smoothstep(0.22, 0.4, frame.progress) * (1 - smoothstep(0.67, 0.82, frame.progress));
  const slitOpen = smoothstep(0.49, 0.69, frame.progress);
  const practicePosition = clamp((frame.progress - 0.7) / 0.3);
  const activePracticeStage = Math.min(4, Math.floor(practicePosition * 5));

  return (
    <main
      ref={scrollRef}
      className={styles.route}
      onScroll={updateTargetProgress}
      aria-label="LOWKEY archive fragments motion prototype"
    >
      <div className={styles.scrollLength}>
        <div
          className={styles.stage}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <header className={styles.navigation}>
            <button className={styles.brand} type="button" onClick={() => goTo(0)}>
              <span>LOWKEY / {chapter.index}</span>
              <small>A TRANSPARENT ARCHIVE</small>
            </button>
            <nav aria-label="Prototype chapters">
              <button type="button" onClick={() => goTo(0)} data-active={chapter.label === 'ORBIT'}>ARCHIVE</button>
              <button type="button" onClick={() => goTo(0.47)} data-active={chapter.label === 'STATEMENT'}>STATEMENT</button>
              <button type="button" onClick={() => goTo(0.82)} data-active={chapter.label === 'PRACTICE'}>PRACTICE</button>
              <span className={styles.futureChapter}>ABOUT</span>
              <span className={styles.futureChapter}>CONTACT</span>
            </nav>
            <span className={styles.language}>EN / 中</span>
          </header>

          <div className={styles.visualField} aria-hidden="true">
            <div
              className={styles.lightSlit}
              style={{
                '--slit-opacity': slitPresence,
                '--slit-width': `${mix(2, 17, slitOpen)}vw`,
              } as CSSProperties}
            />
            <div className={styles.fragments}>
              {fragments.map((fragment) => (
                <div
                  className={`${styles.fragment} ${styles[fragment.role]} ${fragment.workIndex % 2 === 1 ? styles.mobileSecondary : ''}`}
                  key={fragment.id}
                  style={getFragmentStyle(fragment, frame, works.length, reducedMotion)}
                  suppressHydrationWarning
                >
                  <div className={styles.fragmentFloat}>
                    {fragment.role === 'image' && (
                      <div
                        className={styles.imageSurface}
                        style={{ backgroundImage: `url(${fragment.work.image})` }}
                      />
                    )}
                    {fragment.role === 'acrylic' && <div className={styles.acrylicSurface} />}
                    {fragment.role === 'metadata' && (
                      <div className={styles.metadataSurface}>
                        <span>A-{String(fragment.workIndex + 1).padStart(2, '0')}</span>
                        <span>AI VISUAL</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section className={`${styles.copyLayer} ${styles.orbitCopy}`} style={{ opacity: orbitOpacity }}>
            <p className={styles.eyebrow}>00 / ENTRY FIELD</p>
            <h1>THE ARCHIVE<br />REMAINS<br />IN MOTION.</h1>
            <p className={styles.zh}>档案仍在运动之中。</p>
            <div className={styles.orbitActions}>
              <span>SELECT A WORK</span>
              <span className={styles.prototypeNote}>ARCHIVE PATH PRESERVED</span>
              <button type="button" onClick={() => goTo(0.26)}>SCROLL TO CONTINUE ↓</button>
            </div>
          </section>

          <section
            className={`${styles.copyLayer} ${styles.statementCopy}`}
            style={{ opacity: statementOpacity, pointerEvents: statementOpacity > 0.7 ? 'auto' : 'none' }}
          >
            <div>
              <p className={styles.eyebrow}>01 / STATEMENT</p>
              <h2>VISUAL AI<br />AS A METHOD<br />OF SEEING.</h2>
              <p className={styles.zh}>视觉AI，作为一种构建观看的方法。</p>
            </div>
            <div className={styles.statementIndex}>
              <p>NOT A SINGLE OUTPUT,<br />BUT A FIELD OF DECISIONS.</p>
              <p className={styles.prototypeNote}>PROTOTYPE COPY — NOT FINAL</p>
            </div>
          </section>

          <section
            className={`${styles.copyLayer} ${styles.practiceCopy}`}
            style={{ opacity: practiceOpacity, pointerEvents: practiceOpacity > 0.7 ? 'auto' : 'none' }}
          >
            <div className={styles.practiceIntro}>
              <p className={styles.eyebrow}>02 / PRACTICE</p>
              <h2>PROCESS<br />AS ARCHIVE.</h2>
              <p className={styles.zh}>过程即档案。</p>
              <p className={styles.prototypeNote}>MOTION PROTOTYPE — NOT ACTUAL GENERATION HISTORY</p>
            </div>
            <div className={styles.practiceStages} aria-label="AI visual practice stages">
              {PRACTICE_STAGES.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  data-active={index === activePracticeStage}
                  onClick={() => goTo(0.7 + ((index + 0.35) / 5) * 0.3)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {label}
                </button>
              ))}
            </div>
          </section>

          <footer className={styles.progressFooter}>
            <span>{chapter.label}</span>
            <div className={styles.progressTrack}>
              <span style={{ transform: `scaleX(${frame.progress})` }} />
            </div>
            <span>{String(Math.round(frame.progress * 100)).padStart(3, '0')}%</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
