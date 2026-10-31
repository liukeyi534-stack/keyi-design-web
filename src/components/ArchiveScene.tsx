'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';

import {
  resolveCollectionCover,
  resolveFrameTheme,
  SITE,
  type Collection,
} from '@/data/series';
import { SceneController } from './archive/SceneController';
import type { EntranceMode, EntrancePhase, RailCollection, SceneStage } from './archive/types';
import styles from './ArchiveScene.module.css';

interface Props {
  series: Collection[];
  reducedMotion: boolean;
  onEnterSeries: (id: string) => void;
  entranceMode?: EntranceMode;
  onEntranceComplete?: () => void;
  narrativeSelection?: boolean;
}

type OrbitPhase = 'scatter' | 'line' | 'curl' | 'tunnel' | 'forming' | 'restoring' | 'orbit' | 'gathering' | 'materializing' | 'handoff' | 'settling' | 'complete' | 'returning' | 'rematerializing';

const ORBIT_FORM_DURATION = 2360;

interface OrbitCardData {
  id: string;
  collectionId: string;
  collectionTitle: string;
  railIndex: number;
  title: string;
  image: string;
  focus: [number, number];
  railCover: string;
  railFocus: [number, number];
}

// 21 displayed shells, balanced for visual rhythm across the wider wall.
// The collection's own shell is still used whenever an index falls back.
const DISPLAY_SHELLS: RailCollection['shell'][] = [
  'smoked', 'paleIce', 'amber', 'ice', 'milky', 'dichroic', 'clear',
  'frosted', 'paleIce', 'amber', 'smoked', 'ice', 'milky', 'dichroic',
  'clear', 'paleIce', 'amber', 'frosted', 'smoked', 'milky', 'ice',
];

// The planar index is an editorial selection, not a mirror of the Studio.
// Only distinct, uploaded works are included here. Collections still using a
// repeated case-study placeholder remain available in the acrylic archive,
// but are intentionally omitted from this entrance until their work images
// have been supplied.
const ORBIT_WORK_SELECTION: Record<string, readonly string[]> = {
  'quiet-room': ['qr-1', 'qr-3', 'qr-5'],
  'paper-letters': ['pl-1', 'pl-3', 'pl-5'],
  'manufactured-halo': ['manufactured-halo-01', 'manufactured-halo-04', 'manufactured-halo-07'],
  'low-frequency': ['always-01', 'always-03', 'always-06'],
  'printed-things': ['pr-1', 'pr-2', 'pr-4'],
  'light-out-of-place': ['light-01', 'light-02', 'light-04'],
};

const toRail = (collections: Collection[]): RailCollection[] =>
  collections
    .filter((collection) => collection.status === 'published')
    .map((collection, index) => {
      const cover = resolveCollectionCover(collection);
      return {
        index,
        id: collection.id,
        title: collection.titleEn,
        titleZh: collection.titleZh,
        year: String(collection.year),
        medium: collection.medium,
        // `shell` remains the optical surface recipe. Theme colours are
        // carried independently so artwork changes never alter refraction.
        shell: DISPLAY_SHELLS[index] ?? collection.shell,
        palette: collection.palette,
        cover: cover.image,
        coverWorkId: cover.workId,
        coverFit: cover.fit,
        coverFocus: cover.focus,
        coverMatte: cover.matte,
        coverZoom: cover.zoom,
        frameTheme: resolveFrameTheme(collection),
        works: collection.works
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((work) => ({
            id: work.id,
            title: work.titleEn,
            titleZh: work.titleZh,
            image: work.image,
            year: String(work.year),
            medium: work.medium,
            order: work.order,
            presentation: {
              fit: work.presentation?.fit ?? 'contain',
              focus: work.presentation?.focus ?? [0.5, 0.5],
              matte: work.presentation?.matte ?? 'transparent',
              zoom: work.presentation?.zoom ?? 1,
            },
          })),
        status: collection.status,
      };
    });

export function ArchiveScene({
  series,
  reducedMotion,
  onEnterSeries,
  entranceMode = 'standard',
  onEntranceComplete,
  narrativeSelection = false,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const orbitPointerRef = useRef<HTMLSpanElement>(null);
  const orbitBoundsRef = useRef<DOMRect | null>(null);
  const orbitRafRef = useRef(0);
  const orbitInteractionRafRef = useRef(0);
  const bridgeAnchorRafRef = useRef(0);
  const orbitAngleRef = useRef(0);
  const orbitVelocityRef = useRef(0.000012);
  const orbitLastTimeRef = useRef(0);
  const orbitFormStartRef = useRef(0);
  const pendingOrbitPointerRef = useRef<{ clientX: number; clientY: number; pointerType: string } | null>(null);
  const hoveredOrbitIndexRef = useRef(-1);
  const orbitTimersRef = useRef<number[]>([]);
  const controllerRef = useRef<SceneController | null>(null);
  const returningToEntranceRef = useRef(false);
  const isOrbitEntrance = entranceMode === 'orbit';
  const [stage, setStage] = useState<SceneStage>('archive');
  const [entrancePhase, setEntrancePhase] = useState<EntrancePhase>(
    entranceMode === 'standard' ? 'complete' : 'loading',
  );
  const [orbitPhase, setOrbitPhase] = useState<OrbitPhase>(isOrbitEntrance ? 'scatter' : 'complete');
  const [selectedOrbitCardId, setSelectedOrbitCardId] = useState<string | null>(null);
  const [hoveredOrbitCardId, setHoveredOrbitCardId] = useState<string | null>(null);
  const [metaIndex, setMetaIndex] = useState(3);
  const [ready, setReady] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showEntranceHint, setShowEntranceHint] = useState(entranceMode === 'unfold');

  const published = useMemo(
    () => series.filter((collection) => collection.status === 'published'),
    [series],
  );
  const rail = useMemo(() => toRail(published), [published]);
  const orbitCards = useMemo<OrbitCardData[]>(() => {
    // Each published collection contributes exactly one CD to the orbit: its cover.
    // The interior pages stay inside the SeriesReader and are revealed only after
    // a CD is opened.
    return published
      .map((collection, railIndex) => {
        const cover = resolveCollectionCover(collection);
        const titleSource = collection.subtitleEn
          ? `${collection.titleEn} · ${collection.subtitleEn}`
          : collection.titleEn;
        return {
          id: `${collection.id}:cover`,
          collectionId: collection.id,
          collectionTitle: collection.titleEn,
          railIndex,
          title: titleSource,
          image: cover.image,
          focus: cover.focus,
          railCover: cover.image,
          railFocus: cover.focus,
        };
      })
      .filter((card) => Boolean(card.image));
  }, [published]);
  const hoveredOrbitCard = orbitCards.find((card) => card.id === hoveredOrbitCardId) ?? null;

  const clearOrbitTimers = useCallback(() => {
    orbitTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    orbitTimersRef.current = [];
  }, []);

  const queueOrbitPhase = useCallback((phase: OrbitPhase, delay: number) => {
    const timer = window.setTimeout(() => setOrbitPhase(phase), delay);
    orbitTimersRef.current.push(timer);
  }, []);

  useEffect(() => () => {
    window.cancelAnimationFrame(orbitRafRef.current);
    window.cancelAnimationFrame(orbitInteractionRafRef.current);
    window.cancelAnimationFrame(bridgeAnchorRafRef.current);
    clearOrbitTimers();
  }, [clearOrbitTimers]);

  useEffect(() => {
    clearOrbitTimers();
    setOrbitPhase(isOrbitEntrance ? 'scatter' : 'complete');
    setSelectedOrbitCardId(null);
    setHoveredOrbitCardId(null);
  }, [clearOrbitTimers, isOrbitEntrance]);

  useEffect(() => {
    if (!isOrbitEntrance || !ready || orbitPhase !== 'scatter') return;
    clearOrbitTimers();
    if (reducedMotion) {
      setOrbitPhase('orbit');
      return;
    }
    queueOrbitPhase('line', 1120);
    queueOrbitPhase('curl', 1940);
    queueOrbitPhase('tunnel', 2420);
    queueOrbitPhase('forming', 2840);
    queueOrbitPhase('orbit', 2840 + ORBIT_FORM_DURATION);
  }, [clearOrbitTimers, isOrbitEntrance, orbitPhase, queueOrbitPhase, ready, reducedMotion]);

  useEffect(() => {
    if (!isOrbitEntrance || !['scatter', 'line', 'curl', 'tunnel', 'forming', 'restoring', 'orbit'].includes(orbitPhase)) return;
    const root = orbitRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-orbit-card]'));
    if (cards.length === 0) return;
    if (orbitPhase === 'forming') {
      orbitAngleRef.current = 0;
      orbitFormStartRef.current = performance.now();
    }
    if (orbitPhase === 'orbit') orbitLastTimeRef.current = performance.now();
    let rect = root.getBoundingClientRect();
    orbitBoundsRef.current = rect;
    const resizeObserver = new ResizeObserver(() => {
      rect = root.getBoundingClientRect();
      orbitBoundsRef.current = rect;
    });
    resizeObserver.observe(root);

    const placeCards = (time: number) => {
      const mobile = rect.width < 640;
      const ringRadius = mobile
        ? Math.min(rect.width * 0.39, rect.height * 0.18)
        : Math.min(rect.width * 0.175, rect.height * 0.31, 240);
      const lineGap = Math.min(mobile ? 22 : 38, (rect.width * 0.82) / Math.max(cards.length, 1));
      const lineHalfWidth = ((cards.length - 1) * lineGap) / 2;
      if (orbitPhase === 'orbit' && !reducedMotion) {
        const elapsed = Math.min(50, Math.max(0, time - orbitLastTimeRef.current));
        const targetVelocity = hoveredOrbitIndexRef.current >= 0 ? 0.0000035 : 0.000012;
        const response = 1 - Math.exp(-elapsed * 0.012);
        orbitVelocityRef.current += (targetVelocity - orbitVelocityRef.current) * response;
        orbitAngleRef.current += elapsed * orbitVelocityRef.current;
        orbitLastTimeRef.current = time;
      }
      const formProgress = orbitPhase === 'forming'
        ? Math.min(1, Math.max(0, (time - orbitFormStartRef.current) / ORBIT_FORM_DURATION))
        : 0;
      const easedFormProgress = formProgress * formProgress * formProgress
        * (formProgress * (formProgress * 6 - 15) + 10);
      const formRotation = easedFormProgress * Math.PI * 2;
      if (orbitPhase === 'forming') orbitAngleRef.current = formRotation;
      const rotation = orbitPhase === 'forming'
        ? formRotation
        : orbitPhase === 'restoring' || orbitPhase === 'orbit'
          ? orbitAngleRef.current
          : 0;
      cards.forEach((card, index) => {
        let x = 0;
        let y = 0;
        let scale = 1;
        let opacity = 1;
        let blur = 0;
        let cardRotation = 0;
        let orbitZ = 0;
        let rotateX = 0;
        let rotateY = 0;

        if (orbitPhase === 'scatter') {
          const xSeed = ((index * 73 + 17) % 101) / 100;
          const ySeed = ((index * 47 + 11) % 97) / 96;
          x = (xSeed - 0.5) * rect.width * (mobile ? 0.82 : 0.88);
          y = (ySeed - 0.5) * rect.height * (mobile ? 0.46 : 0.62);
          scale = 0.68 + ((index * 19) % 23) / 100;
          opacity = 0.46 + ((index * 13) % 37) / 100;
          blur = 0.7;
          cardRotation = ((index * 29) % 15) - 7;
        } else if (orbitPhase === 'line') {
          x = (index - (cards.length - 1) / 2) * lineGap;
          scale = 0.84;
        } else {
          // The horizontal strip closes at its lower seam before it faces the
          // viewer, matching the reference's film-strip curl through depth.
          const angle = rotation + Math.PI / 2 + ((index + 0.5) / cards.length) * Math.PI * 2;
          if (orbitPhase === 'curl') {
            const curlRadiusX = Math.max(ringRadius * 1.28, lineHalfWidth * 0.88);
            const faceFactor = (1 - Math.sin(angle)) / 2;
            x = Math.cos(angle) * curlRadiusX;
            y = Math.sin(angle) * Math.min(28, ringRadius * 0.15);
            orbitZ = -Math.sin(angle) * 84;
            rotateX = (1 - faceFactor) * 34;
            rotateY = Math.cos(angle) * -72;
            scale = 0.76 + faceFactor * 0.2;
            opacity = 0.56 + faceFactor * 0.44;
          } else if (orbitPhase === 'tunnel') {
            const faceFactor = (1 - Math.sin(angle)) / 2;
            x = Math.cos(angle) * ringRadius * 0.57;
            y = Math.sin(angle) * ringRadius * 0.22;
            orbitZ = -Math.sin(angle) * ringRadius * 0.54;
            rotateX = (1 - faceFactor) * 79;
            rotateY = Math.cos(angle) * -38;
            scale = 0.67 + faceFactor * 0.31;
            opacity = 0.42 + faceFactor * 0.58;
          } else if (orbitPhase === 'forming') {
            const faceFactor = (1 - Math.sin(angle)) / 2;
            const depthEnvelope = 1 - easedFormProgress;
            const waveEnvelope = Math.sin(Math.PI * formProgress) ** 0.72;
            const radiusX = ringRadius * (0.57 + easedFormProgress * 0.43);
            const radiusY = ringRadius * (0.22 + easedFormProgress * 0.78);
            const waveHead = formProgress * cards.length;
            const rawWaveDistance = index - waveHead;
            const waveDistance = ((rawWaveDistance + cards.length / 2) % cards.length + cards.length)
              % cards.length - cards.length / 2;
            const flipWave = Math.exp(-(waveDistance * waveDistance) / 1.55) * waveEnvelope;
            const openingWave = Math.exp(-(waveDistance * waveDistance) / 6.2) * waveEnvelope;
            const radialX = Math.cos(angle);
            const radialY = Math.sin(angle);
            const tangentX = -radialY;
            const tangentY = radialX;
            const waveDirection = waveDistance === 0 ? 0 : Math.sign(waveDistance);
            const radialLift = 18 * flipWave + 4 * openingWave;
            const tangentOpening = waveDirection * 12 * openingWave;
            x = radialX * radiusX + radialX * radialLift + tangentX * tangentOpening;
            y = radialY * radiusY + radialY * radialLift + tangentY * tangentOpening;
            orbitZ = -Math.sin(angle) * ringRadius * 0.54 * depthEnvelope + 28 * flipWave;
            rotateX = (1 - faceFactor) * 79 * depthEnvelope;
            rotateY = Math.cos(angle) * -38 * depthEnvelope
              + (Math.cos(angle) >= 0 ? -1 : 1) * 58 * flipWave;
            scale = (0.67 + faceFactor * 0.31) * depthEnvelope
              + easedFormProgress
              + 0.07 * flipWave;
            opacity = (0.42 + faceFactor * 0.58) * depthEnvelope + easedFormProgress;
          } else {
            x = Math.cos(angle) * ringRadius;
            y = Math.sin(angle) * ringRadius;
          }
          cardRotation = angle * (180 / Math.PI) + 90;
        }

        card.style.setProperty('--orbit-x', `${x}px`);
        card.style.setProperty('--orbit-y', `${y}px`);
        card.style.setProperty('--orbit-scale', String(scale));
        card.style.setProperty('--orbit-opacity', String(opacity));
        card.style.setProperty('--orbit-blur', `${blur}px`);
        card.style.setProperty('--orbit-rotation', `${cardRotation}deg`);
        card.style.setProperty('--orbit-z', `${orbitZ}px`);
        card.style.setProperty('--orbit-rotate-x', `${rotateX}deg`);
        card.style.setProperty('--orbit-rotate-y', `${rotateY}deg`);
        card.style.zIndex = String(20 + Math.round(orbitZ + 100));
      });
    };

    const animate = (time: number) => {
      placeCards(time);
      if ((orbitPhase === 'forming' || orbitPhase === 'orbit') && !reducedMotion) {
        orbitRafRef.current = window.requestAnimationFrame(animate);
      }
    };
    animate(performance.now());
    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(orbitRafRef.current);
    };
  }, [isOrbitEntrance, orbitCards.length, orbitPhase, reducedMotion]);

  useEffect(() => {
    const bridgeActive = ['gathering', 'materializing', 'handoff', 'rematerializing'].includes(orbitPhase);
    if (!bridgeActive || !selectedOrbitCardId) return;
    const root = orbitRef.current;
    const frame = frameRef.current;
    const controller = controllerRef.current;
    if (!root || !frame || !controller) return;

    const updateBridgeAnchor = () => {
      const card = root.querySelector<HTMLElement>('[data-orbit-card][data-selected="true"]');
      const anchor = controller.getEntranceArtworkAnchor();
      if (card && anchor && card.offsetWidth > 0 && card.offsetHeight > 0) {
        const rootRect = root.getBoundingClientRect();
        const frameRect = frame.getBoundingClientRect();
        const targetX = frameRect.left - rootRect.left + anchor.centerX;
        const targetY = frameRect.top - rootRect.top + anchor.centerY;
        root.style.setProperty('--bridge-x', `${targetX - card.offsetLeft}px`);
        root.style.setProperty('--bridge-y', `${targetY - card.offsetTop}px`);
        root.style.setProperty('--bridge-width', `${anchor.width}px`);
        root.style.setProperty('--bridge-height', `${anchor.height}px`);
      }
      bridgeAnchorRafRef.current = window.requestAnimationFrame(updateBridgeAnchor);
    };

    updateBridgeAnchor();
    return () => window.cancelAnimationFrame(bridgeAnchorRafRef.current);
  }, [orbitPhase, selectedOrbitCardId]);

  useEffect(() => {
    if (selectedOrbitCardId) return;
    const root = orbitRef.current;
    root?.style.removeProperty('--bridge-x');
    root?.style.removeProperty('--bridge-y');
    root?.style.removeProperty('--bridge-width');
    root?.style.removeProperty('--bridge-height');
  }, [selectedOrbitCardId]);

  useEffect(() => {
    setShowEntranceHint(entranceMode === 'unfold');
    try {
      setShowHint(window.sessionStorage.getItem('lowkey:onboarding-seen') !== 'true');
    } catch {
      setShowHint(true);
    }
  }, [entranceMode]);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    try {
      window.sessionStorage.setItem('lowkey:onboarding-seen', 'true');
    } catch {
      // The visual hint may still be dismissed when storage is unavailable.
    }
  }, []);

  const dismissActiveHint = useCallback(() => {
    if (entranceMode === 'unfold' && entrancePhase !== 'complete') {
      setShowEntranceHint(false);
      return;
    }
    dismissHint();
  }, [dismissHint, entranceMode, entrancePhase]);

  const resetOrbitHover = useCallback(() => {
    const root = orbitRef.current;
    if (!root) return;
    window.cancelAnimationFrame(orbitInteractionRafRef.current);
    orbitInteractionRafRef.current = 0;
    pendingOrbitPointerRef.current = null;
    if (orbitPointerRef.current) orbitPointerRef.current.dataset.visible = 'false';
    root.querySelectorAll<HTMLElement>('[data-orbit-card]').forEach((card) => {
      card.style.setProperty('--hover-x', '0px');
      card.style.setProperty('--hover-y', '0px');
      card.style.setProperty('--hover-z', '0px');
      card.style.setProperty('--hover-scale', '1');
      card.style.setProperty('--hover-yaw', '0deg');
      delete card.dataset.hovered;
    });
    hoveredOrbitIndexRef.current = -1;
    setHoveredOrbitCardId(null);
  }, []);

  const handleOrbitPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (orbitPhase !== 'orbit') return;
    pendingOrbitPointerRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      pointerType: event.pointerType,
    };
    if (orbitInteractionRafRef.current) return;

    orbitInteractionRafRef.current = window.requestAnimationFrame(() => {
      orbitInteractionRafRef.current = 0;
      const pointer = pendingOrbitPointerRef.current;
      const root = orbitRef.current;
      if (!pointer || !root) return;
      const rootRect = orbitBoundsRef.current ?? root.getBoundingClientRect();
      const mobile = rootRect.width < 640;
      const centreX = rootRect.left + rootRect.width / 2;
      const centreY = rootRect.top + rootRect.height * (mobile ? 0.42 : 0.44);
      const ringRadius = mobile
        ? Math.min(rootRect.width * 0.39, rootRect.height * 0.18)
        : Math.min(rootRect.width * 0.175, rootRect.height * 0.31, 240);
      const pointerX = pointer.clientX - centreX;
      const pointerY = pointer.clientY - centreY;
      const pointerRadius = Math.hypot(pointerX, pointerY);
      const pointerAngle = Math.atan2(pointerY, pointerX);
      const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-orbit-card]'));
      const hitThreshold = mobile ? 62 : 82;
      let closestIndex = -1;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const cardAngle = orbitAngleRef.current + Math.PI / 2
          + ((index + 0.5) / cards.length) * Math.PI * 2;
        const angleDelta = Math.atan2(
          Math.sin(pointerAngle - cardAngle),
          Math.cos(pointerAngle - cardAngle),
        );
        const distance = Math.hypot(angleDelta * ringRadius, pointerRadius - ringRadius);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      if (closestDistance > hitThreshold) closestIndex = -1;
      const interactionStrength = closestIndex >= 0
        ? Math.max(0, 1 - closestDistance / hitThreshold)
        : 0;

      cards.forEach((card, index) => {
        const cardAngle = orbitAngleRef.current + Math.PI / 2
          + ((index + 0.5) / cards.length) * Math.PI * 2;
        const radialX = Math.cos(cardAngle);
        const radialY = Math.sin(cardAngle);
        const rawDelta = index - closestIndex;
        const wrappedDelta = closestIndex >= 0
          ? ((rawDelta + cards.length / 2) % cards.length + cards.length) % cards.length - cards.length / 2
          : 0;
        const primaryWave = closestIndex >= 0
          ? Math.exp(-(wrappedDelta * wrappedDelta) / 0.52) * interactionStrength
          : 0;
        const neighbourWave = closestIndex >= 0
          ? Math.max(0, 1 - Math.abs(wrappedDelta) / 3.6) * interactionStrength
          : 0;
        const radialLift = 18 * primaryWave + 4 * neighbourWave;
        const tangentShift = wrappedDelta === 0 ? 0 : Math.sign(wrappedDelta) * 15 * neighbourWave;
        const flipDirection = radialX >= 0 ? -1 : 1;
        const hoverYaw = flipDirection * (52 * primaryWave + 10 * neighbourWave);
        card.style.setProperty('--hover-x', `${radialX * radialLift - radialY * tangentShift}px`);
        card.style.setProperty('--hover-y', `${radialY * radialLift + radialX * tangentShift}px`);
        card.style.setProperty('--hover-z', `${24 * primaryWave}px`);
        card.style.setProperty('--hover-scale', String(1 + 0.07 * primaryWave + 0.018 * neighbourWave));
        card.style.setProperty('--hover-yaw', `${hoverYaw}deg`);
        if (index === closestIndex) card.dataset.hovered = 'true';
        else delete card.dataset.hovered;
      });

      if (orbitPointerRef.current && pointer.pointerType !== 'touch') {
        orbitPointerRef.current.style.setProperty('--pointer-x', `${pointer.clientX - rootRect.left}px`);
        orbitPointerRef.current.style.setProperty('--pointer-y', `${pointer.clientY - rootRect.top}px`);
        orbitPointerRef.current.dataset.visible = 'true';
      }
      if (closestIndex !== hoveredOrbitIndexRef.current) {
        hoveredOrbitIndexRef.current = closestIndex;
        setHoveredOrbitCardId(closestIndex >= 0 ? orbitCards[closestIndex]?.id ?? null : null);
      }
    });
  }, [orbitCards, orbitPhase]);

  const startOrbitEntrance = useCallback((card: OrbitCardData) => {
    if (!isOrbitEntrance || orbitPhase !== 'orbit') return;
    clearOrbitTimers();
    resetOrbitHover();
    setSelectedOrbitCardId(card.id);
    controllerRef.current?.setEntranceCollection(card.railIndex);
    setOrbitPhase('gathering');
    if (reducedMotion) {
      setOrbitPhase('handoff');
      controllerRef.current?.startEntrance(true);
      return;
    }
    // Keep the selected artwork visually continuous: first let the planar
    // card reach the optical centre, then grow its acrylic shell while the
    // owning WebGL case fades in underneath it. The scene begins unfolding
    // before the DOM shell has fully disappeared, avoiding a white-frame cut.
    queueOrbitPhase('materializing', 430);
    const handoffTimer = window.setTimeout(() => {
      setOrbitPhase('handoff');
      controllerRef.current?.startEntrance();
    }, 980);
    orbitTimersRef.current.push(handoffTimer);
  }, [clearOrbitTimers, isOrbitEntrance, orbitPhase, queueOrbitPhase, reducedMotion, resetOrbitHover]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || rail.length === 0) return;

    setReady(false);
    const controller = new SceneController(frame, rail, reducedMotion, {
      onStageChange: (nextStage, index) => {
        setStage(nextStage);
        if (index >= 0) setMetaIndex(index);
        if (entranceMode === 'standard' && nextStage === 'archive') setReady(true);
      },
      onEnterSeries,
      onSceneReady: () => {
        // The first rendered frame is the reliable readiness signal for every
        // entrance mode. Standard mode previously waited for a later
        // `archive` stage callback, which could be skipped when the controller
        // started with that same stage and left the loading veil visible until
        // the timeout fallback (or a manual refresh).
        setReady(true);
      },
      onEntrancePhaseChange: (nextPhase, index) => {
        setEntrancePhase(nextPhase);
        if (index >= 0) setMetaIndex(index);
        if (nextPhase === 'closed' && returningToEntranceRef.current) {
          returningToEntranceRef.current = false;
          if (isOrbitEntrance) {
            setOrbitPhase('rematerializing');
            queueOrbitPhase('restoring', reducedMotion ? 1 : 360);
            const restoreTimer = window.setTimeout(() => {
              setSelectedOrbitCardId(null);
              setOrbitPhase('orbit');
            }, reducedMotion ? 2 : 1440);
            orbitTimersRef.current.push(restoreTimer);
          } else {
            setShowEntranceHint(true);
          }
        }
      },
      onEntranceComplete: () => {
        if (isOrbitEntrance) {
          setOrbitPhase('settling');
          queueOrbitPhase('complete', reducedMotion ? 1 : 140);
        }
        onEntranceComplete?.();
      },
    }, {
      entranceMode: entranceMode === 'orbit' ? 'unfold' : entranceMode,
      entranceStyle: entranceMode === 'orbit' ? 'single' : 'stack',
    });
    controllerRef.current = controller;
    controller.start();
    // The scene's archive callback is emitted when the entrance rail has
    // actually settled. Keep a conservative fallback for unusual low-frame
    // environments where that callback may be delayed.
    const readyTimer = window.setTimeout(
      () => setReady(true),
      entranceMode !== 'standard' ? 1200 : 3200,
    );

    return () => {
      window.clearTimeout(readyTimer);
      if (controllerRef.current === controller) controllerRef.current = null;
      controller.dispose();
    };
  }, [entranceMode, isOrbitEntrance, onEnterSeries, onEntranceComplete, queueOrbitPhase, rail, reducedMotion]);

  const returnToEntrance = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller?.resetEntrance()) return;
    returningToEntranceRef.current = true;
    if (isOrbitEntrance) setOrbitPhase('returning');
    setShowEntranceHint(false);
    frameRef.current?.focus({ preventScroll: true });
  }, [isOrbitEntrance]);

  const currentIndex = Math.min(metaIndex, Math.max(0, published.length - 1));
  const currentCollection = published[currentIndex];
  const activeWork = currentCollection?.works[0];
  const open = stage === 'release';
  const transitioning = stage === 'focus' || stage === 'selected';
  const entranceActive = entranceMode !== 'standard' && entrancePhase !== 'complete';
  const archiveCaseLabel = `${published.length} archive ${published.length === 1 ? 'case' : 'cases'}`;
  const canReturnToEntrance = entranceMode !== 'standard'
    && entrancePhase === 'complete'
    && stage === 'archive'
    && (!isOrbitEntrance || orbitPhase === 'complete');
  const stateLabel = entrancePhase === 'closed'
    ? '01 / ARCHIVE CLOSED'
    : entrancePhase === 'inspecting'
      ? String(currentIndex + 1).padStart(2, '0') + ' / ' + String(published.length).padStart(2, '0')
      : entrancePhase === 'unfolding'
        ? 'UNFOLDING ARCHIVE'
        : entrancePhase === 'folding'
          ? 'CLOSING ARCHIVE'
        : stage === 'archive'
          ? 'DEFAULT STATE'
          : stage === 'release'
            ? 'OPEN STATE'
            : 'OPENING';

  return (
    <section
      className={styles.shell}
      data-stage={stage}
      data-entrance-mode={entranceMode}
      data-entrance-phase={entrancePhase}
      data-orbit-phase={orbitPhase}
      aria-label="LOWKEY transparent archive"
    >
      <div
        ref={frameRef}
        className={styles.sceneFrame}
        tabIndex={isOrbitEntrance && orbitPhase !== 'complete' ? -1 : 0}
        role="application"
        aria-label={isOrbitEntrance && orbitPhase !== 'complete'
          ? 'The archive rail appears after activating Enter the LOWKEY archive.'
          : entranceActive
            ? `Move, drag, scroll, or press Enter to unfold ${archiveCaseLabel}.`
            : `Drag to browse ${archiveCaseLabel}. Click the centered case to open it.`}
        onPointerDown={dismissActiveHint}
        onWheel={dismissActiveHint}
        onKeyDown={(event) => {
          if (['ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Spacebar', 'Escape'].includes(event.key)) {
            dismissActiveHint();
          }
        }}
      />

      {isOrbitEntrance && (
        <div
          ref={orbitRef}
          className={styles.orbitEntrance}
          data-phase={orbitPhase}
          aria-hidden={orbitPhase === 'complete'}
          onPointerMove={handleOrbitPointerMove}
          onPointerLeave={resetOrbitHover}
        >
          <span ref={orbitPointerRef} className={styles.orbitPointer} data-visible="false" aria-hidden="true" />
          <div className={styles.orbitCards}>
            {orbitCards.map((card, index) => {
              const selected = card.id === selectedOrbitCardId;
              const selectedIndex = selectedOrbitCardId
                ? orbitCards.findIndex((item) => item.id === selectedOrbitCardId)
                : index;
              const style = {
                '--card-delay': `${(index % 12) * 28}ms`,
                '--fold-delay': `${Math.abs(index - (orbitCards.length - 1) / 2) * 4}ms`,
                '--gather-delay': `${Math.min(Math.abs(index - selectedIndex), 12) * 10}ms`,
                backgroundImage: card.image.startsWith('/') ? `url("${card.image}")` : undefined,
                backgroundPosition: `${card.focus[0] * 100}% ${card.focus[1] * 100}%`,
                backgroundSize: 'cover',
              } as CSSProperties;
              const coverStyle = {
                backgroundImage: card.railCover.startsWith('/') ? `url("${card.railCover}")` : undefined,
                backgroundPosition: `${card.railFocus[0] * 100}% ${card.railFocus[1] * 100}%`,
              } as CSSProperties;
              return (
                <button
                  type="button"
                  key={card.id}
                  className={styles.orbitCard}
                  data-orbit-card
                  data-work-id={card.id}
                  data-orbit-index={index}
                  data-selected={selected ? 'true' : 'false'}
                  style={style}
                  onClick={() => startOrbitEntrance(card)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      startOrbitEntrance(card);
                    }
                  }}
                  disabled={orbitPhase !== 'orbit'}
                  aria-label={`${card.title}, from ${card.collectionTitle}`}
                >
                  <i style={coverStyle} />
                </button>
              );
            })}
          </div>

          <header className={styles.orbitSlogan}>
            <h1>
              <span>WELCOME TO MY IMAGINARY WORLD.</span>
            </h1>
          </header>

          <aside
            className={styles.orbitHoverLabel}
            data-visible={hoveredOrbitCard && orbitPhase === 'orbit' ? 'true' : 'false'}
            aria-hidden={!hoveredOrbitCard || orbitPhase !== 'orbit'}
          >
            <strong>{hoveredOrbitCard?.title?.toUpperCase() ?? ''}</strong>
            <span>{hoveredOrbitCard?.collectionTitle?.toUpperCase() ?? ''}</span>
          </aside>

          <p className={styles.orbitInstruction}>
            <span>{orbitPhase === 'orbit' ? 'SELECT A WORK' : 'FORMING THE ARCHIVE'}</span>
            <b>{String(orbitCards.length).padStart(2, '0')} WORKS &#8599;</b>
          </p>
        </div>
      )}

      <p className={styles.stateLabel}>{stateLabel}</p>

      <button
        type="button"
        className={styles.returnToEntrance}
        data-visible={canReturnToEntrance ? 'true' : 'false'}
        onClick={returnToEntrance}
        aria-label={isOrbitEntrance ? 'Return to the artwork orbit' : 'Return to the closed archive entrance'}
        aria-hidden={!canReturnToEntrance}
        tabIndex={canReturnToEntrance ? 0 : -1}
      >
        <span aria-hidden="true">&#8592;</span>
        <b className={styles.returnLong}>{isOrbitEntrance ? 'RETURN TO ORBIT' : 'RETURN TO CLOSED ARCHIVE'}</b>
        <b className={styles.returnShort}>RETURN</b>
      </button>

      <aside
        className={styles.interactionHint}
        data-visible={ready && (
          entranceActive ? showEntranceHint : stage === 'archive' && showHint
        ) ? 'true' : 'false'}
        aria-hidden={entranceActive ? !showEntranceHint : !showHint}
      >
        {entranceActive ? (
          <>
            <span className={styles.desktopHint}>DRAG OR SCROLL TO UNFOLD</span>
            <span className={styles.mobileHint}>SWIPE TO UNFOLD</span>
          </>
        ) : (
          <span>DRAG TO BROWSE&nbsp;&nbsp;/&nbsp;&nbsp;CLICK TO OPEN</span>
        )}
        <i />
      </aside>

      <footer className={styles.brand} aria-hidden={stage !== 'archive'}>
        <strong>{SITE.name}</strong>
        <span>{SITE.tagline}</span>
      </footer>

      <aside
        className={styles.entranceMeta}
        data-visible={ready && entrancePhase === 'inspecting' && currentCollection ? 'true' : 'false'}
        aria-hidden={entrancePhase !== 'inspecting'}
      >
        <strong>{currentCollection?.titleEn?.toUpperCase() ?? ''}</strong>
        <span>{currentCollection?.year ?? ''}</span>
        <span>{currentCollection?.medium?.toUpperCase() ?? ''}</span>
      </aside>

      <section className={styles.workInfo} aria-hidden={!open}>
        <h1>{currentCollection?.titleEn?.toUpperCase() ?? ''}</h1>
        <p>
          SCENE {String(activeWork?.order ?? currentIndex + 1).padStart(2, '0')} / {String(currentCollection?.works.length ?? published.length).padStart(2, '0')}
        </p>
        <p>{currentCollection?.year ?? ''} / {currentCollection?.medium?.toUpperCase() ?? ''}</p>
        <i />
        <small>{currentCollection?.descriptionEn ?? ''}</small>
        <small>{activeWork?.oneLineEn ?? ''}</small>
        <button
          type="button"
          className={styles.viewWorks}
          onClick={() => currentCollection && onEnterSeries(currentCollection.id)}
          aria-label={`View ${currentCollection?.titleEn ?? 'this'} series`}
          tabIndex={open ? 0 : -1}
        >
          <span>VIEW WORKS</span>
          <b>{String(currentCollection?.works.length ?? 0).padStart(2, '0')} IMAGES</b>
        </button>
        <div className={styles.mobileWorkPreview} aria-hidden="true">
          {currentCollection?.works.slice(0, 9).map((work, workIndex) => {
            const localImage = work.image.startsWith('/') && !work.image.startsWith('//');
            return (
              <span
                key={work.id}
                data-active={workIndex === 0 || undefined}
                data-pending={!localImage || undefined}
                style={localImage ? { backgroundImage: `url("${work.image}")` } : undefined}
              >
                {!localImage && String(workIndex + 1).padStart(2, '0')}
              </span>
            );
          })}
        </div>
      </section>

      <div
        className={styles.loadingVeil}
        data-ready={ready ? 'true' : 'false'}
        aria-hidden="true"
      >
        <div className={styles.loadingGhosts}>
          {Array.from({ length: 7 }, (_, index) => <i key={index} />)}
        </div>
        <div className={styles.loadingCopy}>
          <span>PREPARING THE ARCHIVE</span>
          <small>04 / 07</small>
          <b><i /></b>
        </div>
        <div className={styles.loadingBrand}>
          <strong>{SITE.name}</strong>
          <span>{SITE.tagline}</span>
        </div>
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {currentCollection?.titleEn ?? 'Archive'}, item {published.length > 0 ? currentIndex + 1 : 0} of {published.length}.
        {entranceActive
          ? ' Entrance ' + entrancePhase + '.'
          : open
            ? ' Case open.'
            : transitioning
              ? ' Case moving.'
              : ' Case closed.'}
      </p>
    </section>
  );
}
