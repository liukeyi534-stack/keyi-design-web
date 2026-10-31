'use client';
import { useEffect, type RefObject } from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';

export function usePracticeGallery(rootRef: RefObject<HTMLDivElement>, armed: boolean, reduced: boolean) {
  useEffect(() => {
    const gallery = rootRef.current?.querySelector<HTMLElement>('[data-practice-track]');
    if (!gallery || !armed) return;
    const lightbox = new PhotoSwipeLightbox({
      gallery, children: '[data-gallery-item]', pswpModule: () => import('photoswipe'),
      bgOpacity: .97, mainClass: 'lowkey-gallery', showHideAnimationType: reduced ? 'none' : 'zoom',
      showAnimationDuration: 320, hideAnimationDuration: 260,
      closeTitle: '关闭', zoomTitle: '放大或缩小', arrowPrevTitle: '上一幅', arrowNextTitle: '下一幅',
      errorMsg: '图片暂时无法加载，请关闭后重试。', padding: { top: 70, bottom: 70, left: 24, right: 24 },
    });
    lightbox.on('uiRegister', () => {
      const pswp = lightbox.pswp;
      pswp?.ui?.registerElement({ name: 'artwork-title', order: 9, isButton: false, appendTo: 'root',
        onInit: (el) => { pswp.on('change', () => {
          el.textContent = pswp.currSlide?.data.element?.getAttribute('data-title') || '';
        }); },
      });
    });
    const start = { x: 0, y: 0 };
    let moved = false;
    const down = (e: PointerEvent) => { start.x = e.clientX; start.y = e.clientY; moved = false; };
    const move = (e: PointerEvent) => { if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) moved = true; };
    const click = (e: MouseEvent) => { if (moved && e.detail !== 0) { e.preventDefault(); e.stopImmediatePropagation(); } };
    gallery.addEventListener('pointerdown', down, true);
    window.addEventListener('pointermove', move);
    gallery.addEventListener('click', click, true);
    lightbox.init();
    return () => {
      lightbox.destroy(); gallery.removeEventListener('pointerdown', down, true);
      window.removeEventListener('pointermove', move); gallery.removeEventListener('click', click, true);
    };
  }, [rootRef, armed, reduced]);
}
