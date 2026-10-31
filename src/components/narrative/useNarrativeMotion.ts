'use client';

import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** One scroll owner per region; pointer dragging writes the same scroll progress. */
export function useNarrativeMotion(rootRef: RefObject<HTMLDivElement>, armed: boolean, reduced: boolean) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !armed) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      if (!reduced) {
        root.querySelectorAll<HTMLElement>('[data-motion-title]').forEach((title) => {
          gsap.fromTo(title, { clipPath: 'inset(0 0 100% 0)', y: 28 }, {
            clipPath: 'inset(0 0 0% 0)', y: 0, ease: 'none',
            scrollTrigger: { trigger: title, start: 'top 95%', end: 'top 70%', scrub: .22 },
          });
        });
        const essay = root.querySelector('[data-essay]');
        if (essay) gsap.from(essay.querySelectorAll('[lang]'), {
          y: 36, stagger: .12, ease: 'none',
          scrollTrigger: { trigger: essay, start: 'top bottom', end: 'top 48%', scrub: .25 },
        });

      }
    }, root);

    media.add({ desktop: '(min-width: 800px)', mobile: '(max-width: 799px)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
      const about = root.querySelector<HTMLElement>('#about');
      const portrait = root.querySelector<HTMLElement>('[data-portrait]');
      const grid = portrait?.parentElement;
      if (about && portrait && grid && ctx.conditions?.desktop && !ctx.conditions?.reduce) {
        gsap.fromTo(portrait, {
          x: () => -(grid.clientWidth / 2 - portrait.offsetWidth / 2), scale: 1.12,
        }, { x: 0, scale: 1, ease: 'none', scrollTrigger: {
          trigger: about, start: 'top 72%', end: 'top 12%', scrub: .2, invalidateOnRefresh: true,
        } });
        gsap.fromTo(grid.querySelectorAll('header, [data-about-text]'), { autoAlpha: 0, y: 22 }, {
          autoAlpha: 1, y: 0, ease: 'none', scrollTrigger: {
            trigger: about, start: 'top 44%', end: 'top 12%', scrub: .2,
          },
        });
      }
      const contact = root.querySelector<HTMLElement>('#contact');
      const panel = root.querySelector<HTMLElement>('[data-contact-panel]');
      if (contact && panel && ctx.conditions?.desktop && !ctx.conditions?.reduce) {
        // The clipped panel stays in place while the preceding page uncovers it.
        // Once uncovered, long contact content continues in normal document flow.
        gsap.fromTo(panel, { y: () => -(window.innerHeight - 96) }, {
          y: 0, ease: 'none',
          scrollTrigger: { trigger: contact, start: 'top bottom', end: 'clamp(top 96px)', scrub: true, invalidateOnRefresh: true },
        });
      }
      const section = root.querySelector<HTMLElement>('#practice');
      const viewport = root.querySelector<HTMLElement>('[data-practice-window]');
      const track = root.querySelector<HTMLElement>('[data-practice-track]');
      const progress = root.querySelector<HTMLElement>('[data-practice-progress]');
      const counter = root.querySelector<HTMLElement>('[data-practice-count]');
      if (!section || !viewport || !track) return;
      const desktop = Boolean(ctx.conditions?.desktop && !ctx.conditions?.reduce);
      const distance = () => Math.max(1, track.scrollWidth - viewport.clientWidth);
      const update = (p: number) => {
        if (progress) progress.style.transform = `scaleX(${p})`;
        if (counter) counter.textContent = `${String(Math.min(7, 1 + Math.round(p * 6))).padStart(2, '0')} / 07`;
      };
      update(0);
      let tween: gsap.core.Tween | undefined;
      if (desktop) {
        tween = gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: {
          id: 'lowkey-practice', trigger: section, start: 'top top', end: 'bottom bottom',
          scrub: .25, invalidateOnRefresh: true, onUpdate: (self) => update(self.progress),
        } });
        track.querySelectorAll('figcaption').forEach((caption) => {
          gsap.fromTo(caption, { x: 18 }, { x: -18, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .4 },
          });
        });
      }
      const read = () => desktop ? (tween?.scrollTrigger?.progress ?? 0) * distance() : viewport.scrollLeft;
      const write = (value: number) => {
        const x = gsap.utils.clamp(0, distance(), value);
        if (desktop && tween?.scrollTrigger) {
          const st = tween.scrollTrigger;
          window.scrollTo({ top: st.start + (x / distance()) * (st.end - st.start), behavior: 'auto' });
          ScrollTrigger.update();
          tween.progress(x / distance());
          st.getTween()?.progress(1);
        } else viewport.scrollLeft = x;
      };
      let pointer: number | null = null;
      let lastX = 0, lastTime = 0, velocity = 0, frame = 0;
      let lastPosition = 0, startX = 0;
      const stop = () => { cancelAnimationFrame(frame); velocity = 0; };
      const down = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || e.button !== 0 || pointer !== null) return;
        stop(); pointer = e.pointerId; lastX = e.clientX; lastTime = performance.now();
        lastPosition = read(); startX = e.clientX;
      };
      const move = (e: PointerEvent) => {
        if (pointer !== e.pointerId) return;
        if (!viewport.hasPointerCapture(e.pointerId)) {
          if (Math.abs(e.clientX - startX) < 6) return;
          viewport.setPointerCapture(e.pointerId); viewport.dataset.dragging = 'true';
        }
        const now = performance.now(), dx = lastX - e.clientX;
        velocity = dx / Math.max(8, now - lastTime);
        lastPosition = gsap.utils.clamp(0, distance(), lastPosition + dx);
        write(lastPosition); lastX = e.clientX; lastTime = now;
      };
      const up = (e: PointerEvent) => {
        if (pointer !== e.pointerId) return;
        pointer = null; delete viewport.dataset.dragging;
        if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
        if (e.type === 'pointercancel' || reduced || performance.now() - lastTime > 90) { stop(); return; }
        let previous = performance.now();
        const coast = (now: number) => {
          const dt = Math.min(32, now - previous); previous = now;
          velocity *= Math.exp(-dt / 110);
          const next = gsap.utils.clamp(0, distance(), lastPosition + velocity * dt);
          write(next);
          if (Math.abs(velocity) > .015 && next !== lastPosition) frame = requestAnimationFrame(coast);
          lastPosition = next;
        };
        frame = requestAnimationFrame(coast);
      };
      const key = (e: KeyboardEvent) => {
        if (document.querySelector('.pswp')) return;
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault(); stop();
        write(e.key === 'Home' ? 0 : e.key === 'End' ? distance() : read() + (e.key === 'ArrowRight' ? 1 : -1) * distance() / 2);
      };
      const scroll = () => { if (!desktop) update(viewport.scrollLeft / distance()); };
      viewport.addEventListener('pointerdown', down);
      viewport.addEventListener('pointermove', move);
      viewport.addEventListener('pointerup', up);
      viewport.addEventListener('pointercancel', up);
      viewport.addEventListener('keydown', key);
      viewport.addEventListener('scroll', scroll, { passive: true });
      window.addEventListener('wheel', stop, { passive: true });
      return () => {
        stop(); delete viewport.dataset.dragging;
        viewport.removeEventListener('pointerdown', down); viewport.removeEventListener('pointermove', move);
        viewport.removeEventListener('pointerup', up); viewport.removeEventListener('pointercancel', up);
        viewport.removeEventListener('keydown', key); viewport.removeEventListener('scroll', scroll);
        window.removeEventListener('wheel', stop);
        viewport.scrollLeft = 0;
      };
    });
    let live = true;
    const refresh = () => { if (live) ScrollTrigger.refresh(); };
    root.querySelectorAll('img').forEach((img) => img.addEventListener('load', refresh));
    document.fonts.ready.then(refresh);
    const frame = requestAnimationFrame(refresh);
    return () => {
      live = false; cancelAnimationFrame(frame);
      root.querySelectorAll('img').forEach((img) => img.removeEventListener('load', refresh));
      media.revert(); context.revert();
    };
  }, [rootRef, armed, reduced]);
}
