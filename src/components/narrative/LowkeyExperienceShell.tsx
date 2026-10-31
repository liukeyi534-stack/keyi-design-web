'use client';

import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import { SeriesReader } from '@/components/SeriesReader';
import type { EntranceMode } from '@/components/archive/types';
import { PUBLISHED_COLLECTIONS as PUBLISHED, SITE, type Series } from '@/data/series';
import { NARRATIVE_SECTIONS, type NarrativeSectionId } from '@/data/site-narrative';
import { STATEMENT_ZH, STATEMENT_EN, PRACTICE_WORKS, ABOUT_ZH, ABOUT_EN, CONTACT_SERVICES } from '@/data/lowkey-content';
import Image from 'next/image';
import styles from './LowkeyExperienceShell.module.css';
import { useNarrativeMotion } from './useNarrativeMotion';
import { usePracticeGallery } from './usePracticeGallery';
import 'photoswipe/style.css';
import './gallery.css';

const DEBUG_BRIDGE_PROGRESS = process.env.NODE_ENV !== 'production';

const ArchiveScene = dynamic(
  () => import('@/components/ArchiveScene').then((module) => module.ArchiveScene),
  { ssr: false, loading: () => <ExperienceFallback /> },
);

type View =
  | { kind: 'archive' }
  | { kind: 'series'; seriesId: string; workIndex?: number }
  | { kind: 'series'; seriesId: string; story: true };

interface NarrativeBridgeProps {
  storyArmed: boolean;
  reducedMotion: boolean;
  archiveRef: RefObject<HTMLDivElement>;
  runwayRef: RefObject<HTMLDivElement>;
  navigationRef: RefObject<HTMLElement>;
  indexRef: RefObject<HTMLDivElement>;
  continueRef: RefObject<HTMLButtonElement>;
  onEngagedChange: (engaged: boolean) => void;
}

function NarrativeBridge({
  storyArmed,
  reducedMotion,
  archiveRef,
  runwayRef,
  navigationRef,
  indexRef,
  continueRef,
  onEngagedChange,
}: NarrativeBridgeProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const fragmentsRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const wash = washRef.current;
    const fragmentsLayer = fragmentsRef.current;
    const statement = statementRef.current;
    const archive = archiveRef.current;
    const runway = runwayRef.current;
    const navigation = navigationRef.current;
    const index = indexRef.current;
    const continueCue = continueRef.current;

    if (
      !storyArmed
      || !stage
      || !wash
      || !fragmentsLayer
      || !statement
      || !archive
      || !runway
      || !navigation
      || !index
      || !continueCue
    ) {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);
    let cleanupMotion = () => {};
    const context = gsap.context(() => {
      const statementLines = Array.from(statement.querySelectorAll<HTMLElement>('[data-reveal-line]'));
      const statementMeta = Array.from(statement.querySelectorAll<HTMLElement>('[data-reveal-meta]'));
      const statementRule = statement.querySelector<HTMLElement>('[data-reveal-rule]');
      const statementDetail = statement.querySelector<HTMLElement>('[data-reveal-detail]');
      const statementField = statement.querySelector<HTMLElement>('[data-reveal-field]');
      const matteAxis = stage.querySelector<HTMLElement>('[data-matte-axis]');
      const matteVeil = stage.querySelector<HTMLElement>('[data-matte-veil]');
      const statementSupport = [statementDetail, statementField]
        .filter((element): element is HTMLElement => Boolean(element));
      const sourceCards = Array.from(archive.querySelectorAll<HTMLElement>('[data-orbit-card]'));

      gsap.set(wash, { opacity: 0 });
      gsap.set(archive, { opacity: 1, scale: 1, transformOrigin: '50% 50%' });
      gsap.set(statement, { autoAlpha: 0 });
      gsap.set(statementLines, { autoAlpha: 0, yPercent: 112 });
      gsap.set(statementMeta, { autoAlpha: 0, y: 12 });
      gsap.set(statementRule, { autoAlpha: 0, scaleX: 0.06, transformOrigin: '50% 50%' });
      gsap.set(statementSupport, { autoAlpha: 0, y: 18 });
      gsap.set(matteAxis, { autoAlpha: 0, scaleY: 0.04, transformOrigin: '50% 0%' });
      gsap.set(matteVeil, { autoAlpha: 0, scaleX: 1, transformOrigin: '100% 50%' });
      gsap.set([navigation, index], { autoAlpha: 0 });
      gsap.set(navigation, { pointerEvents: 'none' });

      let targetProgress = 0;
      let renderedProgress = 0;
      let motionTimeline: gsap.core.Timeline | null = null;
      let tickerActive = false;
      let engaged = false;
      let archivePromoted = false;
      let archiveContained = false;
      let geometryWidth = 0;
      let geometryHeight = 0;
      let resizeFrame = 0;
      let renderFrame: (_time: number, deltaTime: number) => void = () => {};

      // Read all artwork styles first, then perform one DOM write. The bridge is
      // prepared before the first wheel event so entering it never allocates a
      // stack of nodes on the interaction frame.
      const fragmentStyles = sourceCards.map((card) => {
        const computed = window.getComputedStyle(card);
        return {
          workId: card.dataset.workId,
          backgroundImage: computed.backgroundImage,
          backgroundPosition: computed.backgroundPosition,
          backgroundSize: computed.backgroundSize,
        };
      });
      const fragmentDocument = document.createDocumentFragment();
      const fragments = fragmentStyles.map((fragmentStyle, fragmentIndex) => {
        const fragment = document.createElement('div');
        fragment.className = styles.bridgeFragment;
        fragment.dataset.fragmentIndex = String(fragmentIndex);
        fragment.dataset.workId = fragmentStyle.workId;
        fragment.style.backgroundImage = fragmentStyle.backgroundImage;
        fragment.style.backgroundPosition = fragmentStyle.backgroundPosition;
        fragment.style.backgroundSize = fragmentStyle.backgroundSize;
        fragmentDocument.appendChild(fragment);
        return fragment;
      });
      fragmentsLayer.replaceChildren(fragmentDocument);

      const captureGeometry = () => {
        const snapshots = sourceCards.map((card) => {
          const rect = card.getBoundingClientRect();
          return {
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2,
            width: card.offsetWidth,
            height: card.offsetHeight,
            rotation: (((Number.parseFloat(card.style.getPropertyValue('--orbit-rotation')) || 0) % 360) + 540) % 360 - 180,
          };
        });

        snapshots.forEach((snapshot, fragmentIndex) => {
          const fragment = fragments[fragmentIndex];
          fragment.style.left = `${snapshot.centerX - snapshot.width / 2}px`;
          fragment.style.top = `${snapshot.centerY - snapshot.height / 2}px`;
          fragment.style.width = `${snapshot.width}px`;
          fragment.style.height = `${snapshot.height}px`;
          fragment.dataset.originCenterX = String(snapshot.centerX);
          fragment.dataset.originCenterY = String(snapshot.centerY);
          fragment.dataset.originRotation = String(snapshot.rotation);
          fragment.dataset.originWidth = String(snapshot.width);
          fragment.dataset.originHeight = String(snapshot.height);
        });
      };

      const buildMotionTimeline = () => {
        const preservedProgress = motionTimeline?.progress() ?? renderedProgress;
        motionTimeline?.kill();
        captureGeometry();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const centerX = viewportWidth / 2;
        const centerY = viewportHeight / 2;
        const targetBoxes = Array.from(stage.querySelectorAll<HTMLElement>('[data-blue-target]'));
        const stageRect = stage.getBoundingClientRect();
        const targets = targetBoxes.map((box) => {
          const rect = box.getBoundingClientRect();
          return { id: box.dataset.blueTarget, x: rect.left - stageRect.left + rect.width / 2,
            y: rect.top - stageRect.top + rect.height / 2, width: rect.width, height: rect.height };
        });
        geometryWidth = viewportWidth;
        geometryHeight = viewportHeight;

        gsap.set(fragments, {
          autoAlpha: 0,
          x: 0,
          y: 0,
          scale: 1,
          rotation: (_fragmentIndex: number, fragment: HTMLDivElement) => Number(fragment.dataset.originRotation) || 0,
          transformOrigin: '50% 50%',
        });
        gsap.set(continueCue, { autoAlpha: 1, y: 0 });
        gsap.set(matteAxis, { autoAlpha: 0, scaleY: .04 });
        gsap.set(matteVeil, { autoAlpha: 0, scaleX: 1 });

        const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
        timeline
          // The clones inherit the exact on-screen geometry. A simultaneous
          // hand-off avoids a blank frame or a double image at the first pixel.
          .set(fragments, { autoAlpha: 1 }, .001)
          .set(sourceCards, { autoAlpha: 0 }, .001)
          .to(continueCue, { autoAlpha: 0, y: -8, duration: .12, ease: 'power2.out' }, .012)
          .to(wash, { opacity: 1, duration: .28, ease: 'power2.out' }, .025)
          .to(archive, { opacity: 0, scale: .985, duration: .28, ease: 'power2.out' }, .04)
          .to(matteAxis, { autoAlpha: 1, scaleY: 1, duration: .44, ease: 'power2.out' }, .11)
          .set(matteVeil, { autoAlpha: 1 }, .12)
          .to(matteVeil, { scaleX: 0, duration: .5, ease: 'power2.inOut' }, .14);

        fragments.forEach((fragment, fragmentIndex) => {
          const originX = Number(fragment.dataset.originCenterX) || centerX;
          const originY = Number(fragment.dataset.originCenterY) || centerY;
          const radialX = originX - centerX;
          const radialY = originY - centerY;
          const originRotation = Number(fragment.dataset.originRotation) || 0;
          const originWidth = Number(fragment.dataset.originWidth) || 72;

          const target = targets.find((item) => item.id === fragment.dataset.workId);
          if (target) {
            timeline.to(fragment, {
              x: target.x - originX, y: target.y - originY,
              scaleX: target.width / originWidth, scaleY: target.height / Number(fragment.dataset.originHeight), rotation: 0, opacity: 1,
              duration: .64, ease: 'power2.inOut',
            }, .025 + targets.indexOf(target) * .035);
          } else {
            timeline.to(fragment, {
              x: radialX * 1.8,
              y: radialY * 1.38,
              scale: .54,
              rotation: originRotation - 5,
              opacity: 0,
              duration: .52,
              ease: 'none',
            }, .025);
          }
        });

        timeline
          .to(statement, { autoAlpha: 1, duration: .12, ease: 'power2.out' }, .2)
          .to(statementRule, { autoAlpha: 1, scaleX: 1, duration: .24, ease: 'power2.out' }, .21)
          .to(statementMeta, { autoAlpha: 1, y: 0, duration: .22, ease: 'power2.out' }, .24)
          .to(statementLines, {
            autoAlpha: 1,
            yPercent: 0,
            duration: .28,
            stagger: .045,
            ease: 'power2.out',
          }, .27)
          .to(statementSupport, {
            autoAlpha: 1,
            y: 0,
            duration: .22,
            stagger: .04,
            ease: 'power2.out',
          }, .58)
          .to([navigation, index], { autoAlpha: 1, duration: .18, ease: 'power2.out' }, .76)
          .to({}, { duration: .02 }, .98);

        if (reducedMotion) {
          timeline.clear()
            .set(statement, { autoAlpha: 1 })
            .set(statementLines, { yPercent: 0 })
            .set(statementMeta, { y: 0 })
            .set(statementRule, { scaleX: 1 })
            .set(statementSupport, { y: 0 })
            .to(continueCue, { autoAlpha: 0, duration: .06 }, 0)
            .to(archive, { autoAlpha: 0, duration: .16 }, 0)
            .to(wash, { opacity: 1, duration: .16 }, 0)
            .to([...statementMeta, statementRule, ...statementLines, ...statementSupport, navigation, index], {
              autoAlpha: 1,
              duration: .18,
            }, .08);
        }

        motionTimeline = timeline;
        motionTimeline.progress(preservedProgress).pause();
      };

      // Geometry and the timeline are prepared before the first wheel event.
      // The interaction frame now only updates one normalized progress value.
      buildMotionTimeline();

      const stopTicker = () => {
        if (!tickerActive) return;
        tickerActive = false;
        gsap.ticker.remove(renderFrame);
      };

      const resetBridge = () => {
        engaged = false;
        onEngagedChange(false);
        motionTimeline?.progress(0).pause();
        gsap.set(fragments, { autoAlpha: 0, x: 0, y: 0, scale: 1, rotation: 0 });
        gsap.set(sourceCards, { clearProps: 'opacity,visibility' });
        gsap.set(wash, { opacity: 0 });
        gsap.set(archive, { opacity: 1, scale: 1 });
        gsap.set(statement, { autoAlpha: 0 });
        gsap.set(continueCue, { autoAlpha: 1, y: 0 });
        gsap.set([navigation, index], { autoAlpha: 0 });
        gsap.set(statementLines, { autoAlpha: 0, yPercent: 112 });
        gsap.set(statementMeta, { autoAlpha: 0, y: 12 });
        gsap.set(statementRule, { autoAlpha: 0, scaleX: .06 });
        gsap.set(statementSupport, { autoAlpha: 0, y: 18 });
        gsap.set(matteAxis, { autoAlpha: 0, scaleY: .04 });
        gsap.set(matteVeil, { autoAlpha: 0, scaleX: 1 });
      };

      renderFrame = (_time: number, deltaTime: number) => {
        if (!motionTimeline) {
          stopTicker();
          return;
        }
        const velocityBoost = Math.min(2.5, Math.abs(trigger.getVelocity()) / 1200);
        const baseResponse = targetProgress > renderedProgress ? 10.5 : 13;
        const response = reducedMotion
          ? 1
          : 1 - Math.exp(-(Math.min(deltaTime, 40) / 1000) * (baseResponse + velocityBoost));
        renderedProgress += (targetProgress - renderedProgress) * response;
        if (Math.abs(targetProgress - renderedProgress) < .00008) renderedProgress = targetProgress;
        motionTimeline.progress(renderedProgress).pause();

        if (DEBUG_BRIDGE_PROGRESS) {
          stage.dataset.targetProgress = targetProgress.toFixed(4);
          stage.dataset.renderedProgress = renderedProgress.toFixed(4);
        }

        const shouldPromote = renderedProgress > .001 && renderedProgress < .995;
        if (shouldPromote !== archivePromoted) {
          archivePromoted = shouldPromote;
          archive.style.willChange = shouldPromote ? 'transform, opacity' : 'auto';
        }
        const shouldContain = renderedProgress > .4;
        if (shouldContain !== archiveContained) {
          archiveContained = shouldContain;
          archive.style.contentVisibility = shouldContain ? 'hidden' : 'visible';
        }
        archive.style.pointerEvents = renderedProgress > .012 ? 'none' : 'auto';
        navigation.style.pointerEvents = renderedProgress > .77 ? 'auto' : 'none';

        if (targetProgress === 0 && renderedProgress === 0 && engaged) {
          resetBridge();
          stopTicker();
        } else if (targetProgress === renderedProgress) {
          stopTicker();
        }
      };

      const ensureTicker = () => {
        if (tickerActive) return;
        tickerActive = true;
        gsap.ticker.add(renderFrame);
      };

      const trigger = ScrollTrigger.create({
        id: 'lowkey-inertial-reveal',
        trigger: runway,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        refreshPriority: -10,
        onUpdate: (self) => {
          targetProgress = self.progress;
          if (targetProgress > 0.0005 && !engaged) {
            engaged = true;
            onEngagedChange(true);
          }
          ensureTicker();
        },
      });

      const handleViewportResize = () => {
        if (window.innerWidth === geometryWidth && window.innerHeight === geometryHeight) return;
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(() => buildMotionTimeline());
      };
      window.addEventListener('resize', handleViewportResize, { passive: true });
      const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      cleanupMotion = () => {
        window.cancelAnimationFrame(refreshFrame);
        window.cancelAnimationFrame(resizeFrame);
        window.removeEventListener('resize', handleViewportResize);
        stopTicker();
        trigger.kill();
        motionTimeline?.kill();
        fragmentsLayer.replaceChildren();
      };
    }, stage);
    return () => {
      cleanupMotion();
      archive.style.willChange = 'auto';
      archive.style.contentVisibility = 'visible';
      archive.style.pointerEvents = 'auto';
      onEngagedChange(false);
      context.revert();
    };
  }, [
    archiveRef,
    continueRef,
    indexRef,
    navigationRef,
    reducedMotion,
    runwayRef,
    storyArmed,
    onEngagedChange,
  ]);

  return (
    <div ref={stageRef} className={styles.bridgeStage}>
      <div ref={washRef} className={styles.bridgeWash} />
      <i className={styles.bridgeMatteAxis} data-matte-axis hidden />
      <i className={styles.bridgeMatteVeil} data-matte-veil hidden />
      <div ref={statementRef} className={styles.bridgeStatement}>
        <div className={styles.bridgeStatementMeta} data-reveal-meta>
          <span>01 / STATEMENT · 创作立场</span><span>AI VISUAL PRACTICE / 2026</span>
        </div>
        <span className={styles.bridgeStatementRule} data-reveal-rule />
        <div className={styles.statementCopy}>
          <h2><span><i data-reveal-line>design thinking</i></span><span><i data-reveal-line>meets business</i></span></h2>
          <p className={styles.bridgeStatementKicker} data-reveal-meta>让设计思考与商业判断，在同一处相遇。</p>
        </div>
        <div className={styles.blueComposition}>
          {[
            ['01', '/archive/demo/blue.svg', '蓝色山水与远处的亮面'],
            ['02', '/archive/demo/blue-2.svg', '蓝色水道与一处微小的落点'],
            ['03', '/archive/demo/blue-3.svg', '深蓝空间中的细窄桥面'],
          ].map(([id, image, alt]) => <div key={id} data-blue-target={`blue-passage:blue-passage-${id}`}>
            <Image src={image} alt={alt} width={720} height={1080} unoptimized style={{ opacity: reducedMotion ? 1 : 0 }} />
          </div>)}
        </div>
        <div className={styles.bridgeStatementField} data-reveal-field><span>BLUE / SELECTED STUDIES</span></div>
      </div>
      <div ref={fragmentsRef} className={styles.bridgeFragments} />
    </div>
  );
}

function SectionMeta({ index, labelEn, labelZh }: {
  index: string;
  labelEn: string;
  labelZh: string;
}) {
  return (
    <div className={styles.sectionMeta} data-chapter-meta>
      <span>{index} / {labelEn}</span>
      <span>{labelZh}</span>
    </div>
  );
}

export function ExperienceFallback() {
  return (
    <div className={styles.fallback} role="status">
      <span>PREPARING THE ARCHIVE…</span>
    </div>
  );
}

export function LowkeyExperienceShell() {
  const archiveHostRef = useRef<HTMLDivElement>(null);
  const narrativeViewportRef = useRef<HTMLDivElement>(null);
  const bridgeRunwayRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const storyIndexRef = useRef<HTMLDivElement>(null);
  const continueCueRef = useRef<HTMLButtonElement>(null);
  const pointerDownRef = useRef(false);

  const [view, setView] = useState<View>({ kind: 'archive' });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [entranceMode, setEntranceMode] = useState<EntranceMode>('orbit');
  const [entranceReady, setEntranceReady] = useState(false);
  const [orbitReady, setOrbitReady] = useState(false);
  const [storyEngaged, setStoryEngaged] = useState(false);
  const [activeSection, setActiveSection] = useState<NarrativeSectionId>('statement');
  const [wechatCopyStatus, setWechatCopyStatus] = useState('点击复制微信号');

  const copyWechat = async () => {
    try {
      await navigator.clipboard.writeText(SITE.wechat);
      setWechatCopyStatus('已复制微信号');
    } catch {
      setWechatCopyStatus('复制未成功，请手动复制上方微信号');
    }
  };

  const storyArmed = orbitReady && view.kind === 'archive';

  useEffect(() => {
    if (!storyArmed) setStoryEngaged(false);
  }, [storyArmed]);

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlOverflowX: html.style.overflowX,
      htmlOverflowY: html.style.overflowY,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyBackground: body.style.background,
      bodyOverflow: body.style.overflow,
      bodyOverflowX: body.style.overflowX,
      bodyOverflowY: body.style.overflowY,
    };

    html.style.overflowX = 'hidden';
    html.style.overflowY = storyArmed ? 'auto' : 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overflow = storyArmed ? 'visible' : 'hidden';
    body.style.overflowX = storyArmed ? 'visible' : 'hidden';
    body.style.overflowY = storyArmed ? 'visible' : 'hidden';
    body.style.background = storyArmed ? '#fff' : '#fbfaf8';

    return () => {
      html.style.overflowX = previous.htmlOverflowX;
      html.style.overflowY = previous.htmlOverflowY;
      html.style.overscrollBehavior = previous.htmlOverscroll;
      body.style.background = previous.bodyBackground;
      body.style.overflow = previous.bodyOverflow;
      body.style.overflowX = previous.bodyOverflowX;
      body.style.overflowY = previous.bodyOverflowY;
    };
  }, [storyArmed]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    // Replay the orbit on every public page load. The opening composition is
    // intentionally deterministic instead of depending on a tab-local flag.
    setEntranceMode('orbit');
    setEntranceReady(true);
  }, []);

  const activeSeries = useMemo<Series | null>(() => {
    if (view.kind !== 'series') return null;
    return PUBLISHED.find((series) => series.id === view.seriesId) ?? null;
  }, [view]);

  const onEnterSeries = useCallback((id: string) => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setView({ kind: 'series', seriesId: id, workIndex: 0 });
  }, []);

  const onOpenStory = useCallback((id: string) => setView({ kind: 'series', seriesId: id, story: true }), []);
  const onCloseStory = useCallback((id: string) => setView({ kind: 'series', seriesId: id }), []);
  const onCloseReader = useCallback(() => setView({ kind: 'archive' }), []);

  useEffect(() => {
    if (!entranceReady || view.kind !== 'archive') {
      setOrbitReady(false);
      return;
    }
    const host = archiveHostRef.current;
    if (!host) return;
    const syncOrbitState = () => {
      const shell = host.querySelector<HTMLElement>('[data-entrance-mode="orbit"]');
      const nextReady = shell?.dataset.orbitPhase === 'orbit';
      setOrbitReady((current) => {
        return nextReady;
      });
    };
    syncOrbitState();
    const observer = new MutationObserver(syncOrbitState);
    observer.observe(host, { subtree: true, attributes: true, attributeFilter: ['data-orbit-phase'] });
    return () => observer.disconnect();
  }, [entranceReady, view.kind]);

  useLayoutEffect(() => {
    if (!orbitReady || view.kind !== 'archive') return undefined;
    window.scrollTo({ top: 0, behavior: 'auto' });
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(refreshFrame);
  }, [orbitReady, view.kind]);

  const exitStory = useCallback(() => {
    setActiveSection('statement');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    window.requestAnimationFrame(() => {
      archiveHostRef.current?.querySelector<HTMLElement>('[data-orbit-card]:not(:disabled)')?.focus({ preventScroll: true });
    });
  }, [reducedMotion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.querySelector('.pswp')) return;
      if (storyArmed && window.scrollY > 0 && (event.key === 'Escape' || event.key === 'Esc')) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else if (storyArmed && window.scrollY <= 2 && event.key === 'PageDown') {
        event.preventDefault();
        window.scrollTo({ top: Math.round(window.innerHeight * 0.72), behavior: 'auto' });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exitStory, storyArmed]);

  useEffect(() => {
    const narrativeRoot = narrativeViewportRef.current;
    if (!storyArmed || !narrativeRoot) return;
    const sections = Array.from(narrativeRoot.querySelectorAll<HTMLElement>('[data-narrative-section]'));
    const update = () => {
      let current: NarrativeSectionId = 'statement';
      sections.forEach(section => {
        if (section.getBoundingClientRect().top <= window.innerHeight * .32)
          current = section.dataset.narrativeSection as NarrativeSectionId;
      });
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = 'contact';
      setActiveSection(current);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [storyArmed]);

  useNarrativeMotion(narrativeViewportRef, storyArmed, reducedMotion);
  usePracticeGallery(narrativeViewportRef, storyArmed, reducedMotion);

  const handlePointerDownCapture = useCallback((_event: ReactPointerEvent<HTMLDivElement>) => {
    pointerDownRef.current = true;
  }, []);
  const releasePointer = useCallback(() => { pointerDownRef.current = false; }, []);

  const goToSection = useCallback((id: NarrativeSectionId) => {
    const section = narrativeViewportRef.current?.querySelector<HTMLElement>(`#${id}`);
    if (!section) return;
    const target = section.getBoundingClientRect().top + window.scrollY
      + (id === 'statement' ? Math.max(0, section.offsetHeight - window.innerHeight) : 0);
    window.scrollTo({ top: target, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  if (!entranceReady) return <ExperienceFallback />;

  return (
    <main
      className={styles.experience}
      data-story-open={storyArmed ? 'true' : 'false'}
      onPointerDownCapture={handlePointerDownCapture}
      onPointerUpCapture={releasePointer}
      onPointerCancelCapture={releasePointer}
    >
      <div ref={archiveHostRef} className={styles.archiveLayer}>
        <div
          className={styles.archiveScene}
          data-active={view.kind === 'archive' ? 'true' : 'false'}
          aria-hidden={view.kind !== 'archive'}
        >
          <ArchiveScene
            narrativeSelection
            series={PUBLISHED}
            reducedMotion={reducedMotion}
            onEnterSeries={onEnterSeries}
            entranceMode={entranceMode}
          />
        </div>
        {view.kind === 'series' && activeSeries && (
          <SeriesReader
            series={activeSeries}
            storyOpen={'story' in view && view.story === true}
            initialIndex={'workIndex' in view ? view.workIndex : 0}
            onClose={onCloseReader}
            onOpenStory={() => onOpenStory(activeSeries.id)}
            onCloseStory={() => onCloseStory(activeSeries.id)}
          />
        )}
      </div>

      {view.kind === 'archive' && (
        <button
          ref={continueCueRef}
          className={styles.continueCue}
          data-visible={orbitReady ? 'true' : 'false'}
          type="button"
          tabIndex={orbitReady ? 0 : -1}
          onClick={() => window.scrollTo({ top: Math.round(window.innerHeight * 0.72), behavior: 'auto' })}
          aria-label={`Continue to the ${SITE.name} personal narrative`}
        >
          <span className={styles.continueLine} aria-hidden="true" />
          <span><b>SCROLL TO CONTINUE</b><small>向下继续</small></span>
        </button>
      )}

      <div
        ref={narrativeViewportRef}
        className={styles.narrativeViewport}
        tabIndex={storyEngaged ? 0 : -1}
        aria-hidden={!storyEngaged}
        aria-label={`${SITE.name} personal narrative`}
      >
        <header ref={navigationRef} className={styles.navigation} data-dark={activeSection === 'contact'}>
          <button className={styles.wordmark} type="button" onClick={exitStory}>
            <span>{SITE.name} / 00</span><small>{SITE.tagline}</small>
          </button>
          <nav aria-label="Personal narrative chapters">
            <button type="button" onClick={exitStory}>ARCHIVE</button>
            {NARRATIVE_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                data-active={activeSection === section.id ? 'true' : 'false'}
                onClick={() => goToSection(section.id)}
              >
                {section.labelEn}
              </button>
            ))}
          </nav>
          <span className={styles.languageState} aria-label="Language layout: English and Chinese">EN / 中</span>
        </header>

        <div ref={storyIndexRef} className={styles.storyIndex} data-dark={activeSection === 'contact'} aria-hidden="true">
          <span>{NARRATIVE_SECTIONS.find((section) => section.id === activeSection)?.index}</span><i /><span>04</span>
        </div>

        <div className={styles.narrativeBody}>
          <div
            id="statement"
            ref={bridgeRunwayRef}
            className={styles.bridgeRunway}
            data-narrative-section="statement"
          >
            <NarrativeBridge
              storyArmed={storyArmed}
              reducedMotion={reducedMotion}
              archiveRef={archiveHostRef}
              runwayRef={bridgeRunwayRef}
              navigationRef={navigationRef}
              indexRef={storyIndexRef}
              continueRef={continueCueRef}
              onEngagedChange={setStoryEngaged}
            />
          </div>

          <section className={styles.statementEssay} data-essay aria-label="创作立场全文">
            <span className={styles.eyebrow}>A PERSONAL VISUAL ARCHIVE</span>
            <div className={styles.essayColumns}>
              <div lang="zh-CN">{STATEMENT_ZH.map((text) => <p key={text}>{text}</p>)}</div>
              <div lang="en">{STATEMENT_EN.map((text) => <p key={text}>{text}</p>)}</div>
            </div>
          </section>

          <section id="practice" className={styles.selectedPractice} data-narrative-section="practice">
            <div className={styles.selectedStage} data-practice-stage>
              <SectionMeta index="02" labelEn="PRACTICE" labelZh="创作实践" />
              <header className={styles.selectedHeading}>
                <div><h2 data-motion-title>看见设计，看见生活。</h2><p lang="en">See design. See life.</p></div>
                <p className={styles.selectedIntro}>七件精选作品横铺，文创、服务、宠物、品牌、产品与实习项目各留一支——点击任意一张图片，跳到该作品的详情页。</p>
              </header>
              <div className={styles.selectedWindow} data-practice-window tabIndex={0} role="region" aria-label="七幅精选作品，可左右拖动或点击跳转详情页">
                <div className={styles.selectedTrack} data-practice-track>
                  {PRACTICE_WORKS.map((work) => (
                    <figure key={work.id} className={styles.selectedWork} data-practice-work>
                      <a
                        className={styles.workLink}
                        href={work.image}
                        onClick={(event) => { event.preventDefault(); onEnterSeries(work.id); }}
                        aria-label={`查看作品：${work.label}`}
                      >
                      <Image src={work.image} alt={work.alt} width={928} height={1232} unoptimized draggable={false} className={styles.selectedImage} /></a>
                      <figcaption>
                        <span className={styles.eyebrow}>{work.index} / {work.labelEn} · {work.label}</span>
                        <h3>{work.title}</h3><p>{work.copy}</p>{work.copyEn ? <p lang="en">{work.copyEn}</p> : null}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
              <div className={styles.selectedFooter}><span>SEVEN SELECTED WORKS / 创作实践精选</span><span className={styles.dragHint}>SCROLL / DRAG ↔</span><span data-practice-count>01 / 07</span></div>
              <div className={styles.practiceProgress} aria-hidden="true"><i data-practice-progress /></div>
            </div>
          </section>

          <section id="about" className={styles.personalAbout} data-narrative-section="about">
            <SectionMeta index="03" labelEn="ABOUT" labelZh={`关于 ${SITE.authorZh}`} />
            <div className={styles.personalGrid}>
              <header className={styles.personalTitle}><h2>我是 {SITE.authorZh}。</h2><p lang="en">I’m {SITE.author}.</p></header>
              <div className={styles.personalText} data-about-text>
                <div lang="zh-CN">{ABOUT_ZH.map((text) => <p key={text}>{text}</p>)}</div>
                <div lang="en">{ABOUT_EN.map((text) => <p key={text}>{text}</p>)}</div>
                <a
                  className={styles.resumeLink}
                  href={SITE.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open full resume PDF in a new tab"
                >
                  <span className={styles.resumeLinkZh}>查看更多</span>
                  <span className={styles.resumeLinkEn} lang="en">VIEW FULL RESUME <span aria-hidden="true">↗</span></span>
                </a>
              </div>
              <div className={styles.personalAside}>
                <figure className={styles.personalPortrait} data-portrait>
                  <Image src={SITE.portrait} alt="A black-and-white portrait of the author" width={1200} height={748} unoptimized />
                </figure>
              </div>
            </div>
          </section>

          <section id="contact" className={styles.contactReveal} data-narrative-section="contact">
            <div className={styles.finalContact} data-contact-panel>
            <SectionMeta index="04" labelEn="CONTACT" labelZh="联系与合作" />
            <div className={styles.contactTop}><div className={styles.contactLead}>
              <h2>从一次交谈开始。</h2><p className={styles.contactEnglish} lang="en">It starts with a conversation.</p>
              <p>如果你有一个想法，欢迎一起探索它的视觉表达。<br />也欢迎关于作品、艺术与创作的交流。</p>
              <p lang="en">Let’s explore your idea through images.</p>
            </div>

            <div className={styles.contactLinks}><span className={styles.eyebrow}>GET IN TOUCH</span>
              <a className={styles.emailLink} href={`mailto:${SITE.contact}`} aria-label={`发送邮件至 ${SITE.contact}`}>{SITE.contact} <span aria-hidden="true">↗</span></a>
              <a className={styles.socialLink} href={SITE.social.url} target="_blank" rel="noopener noreferrer"><span>{SITE.social.label} ↗</span><small>PUBLIC PROFILE</small></a>
              <div className={styles.wechatContact}>
                <span>微信联系 · <span className={styles.wechatId}>{SITE.wechat}</span></span>
                <button type="button" onClick={copyWechat} aria-label={`复制微信号 ${SITE.wechat}`}>
                  <span role="status" aria-live="polite">{wechatCopyStatus}</span>
                </button>
              </div>
            </div>
            </div>
            <ul className={styles.serviceList}>{CONTACT_SERVICES.map(([zh, en]) => <li key={en}><span>{zh}</span><small lang="en">{en}</small></li>)}</ul>
            <footer className={styles.finalFooter}><span>{SITE.name} — {SITE.tagline}</span><button type="button" onClick={exitStory}>返回作品圆环 <span aria-hidden="true">↑</span></button></footer>
            <div className={styles.contactMotto}><p lang="en">welcome to my imaginary world.</p><p>欢迎来到我想象中的世界。</p></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
