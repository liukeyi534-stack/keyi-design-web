'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';

import { resolveCollectionCover, SITE, type Collection } from '@/data/series';

interface Props {
  series: Collection[];
  onOpen: (id: string) => void;
}

const CASE_WIDTHS = [50, 43, 35, 22, 29, 36, 46];
const CASE_ANGLES = [-17, -13, -8, 0, 7, 12, 16];
const INDEX_WIDTHS = [12, 10, 9, 8, 9, 10, 12];
const INDEX_HEIGHTS = [36, 34, 35, 39, 35, 34, 36];

const shellTint: Record<Collection['shell'], string> = {
  clear: 'rgba(224, 224, 216, .54)',
  frosted: 'rgba(235, 230, 221, .72)',
  smoked: 'rgba(32, 34, 32, .78)',
  paleIce: 'rgba(164, 211, 224, .66)',
  ice: 'rgba(28, 83, 210, .82)',
  amber: 'rgba(191, 109, 10, .78)',
  dichroic: 'rgba(104, 70, 145, .66)',
  milky: 'rgba(241, 238, 232, .78)'
};

export function MobileArchive({ series }: Props) {
  const ordered = useMemo(() => series.slice(0, 7), [series]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const active = openIndex === null ? null : ordered[openIndex] ?? null;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <section
      aria-label="LOWKEY transparent archive"
      style={{
        position: 'relative',
        minHeight: active ? 844 : '100svh',
        overflow: active ? 'auto' : 'hidden',
        color: '#181513',
        background:
          'radial-gradient(ellipse 94% 61% at 50% 42%, #f3ebe4 0%, #eee4dc 55%, #d9ccc2 100%)'
      }}
    >
      <p style={hintStyle}>{active ? 'CLICK TO OPEN' : 'DEFAULT STATE'}</p>

      {active ? (
        <OpenedMobile
          active={active}
          activeIndex={openIndex ?? 0}
          series={ordered}
          onClose={() => setOpenIndex(null)}
          onSelect={setOpenIndex}
        />
      ) : (
        <ClosedMobile series={ordered} onSelect={setOpenIndex} />
      )}
    </section>
  );
}

function ClosedMobile({
  series,
  onSelect
}: {
  series: Collection[];
  onSelect: (index: number) => void;
}) {
  return (
    <>
      <div
        aria-label="Archive cases"
        style={{
          position: 'absolute',
          top: '24.5svh',
          left: '50%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 8,
          width: 'calc(100% - 34px)',
          height: 268,
          transform: 'translateX(-50%)',
          perspective: 1100
        }}
      >
        {series.map((item, index) => (
          <MobileCase
            key={item.id}
            item={item}
            index={index}
            width={CASE_WIDTHS[index] ?? 32}
            angle={CASE_ANGLES[index] ?? 0}
            onClick={() => onSelect(index)}
          />
        ))}
      </div>
      <Rail top="calc(24.5svh + 258px)" />
      <header
        style={{
          position: 'absolute',
          right: 20,
          bottom: '5.2svh',
          left: 20,
          textAlign: 'center'
        }}
      >
        <h1 style={{ margin: 0, font: '400 30px/.95 var(--serif)', letterSpacing: '-.02em' }}>{SITE.name}</h1>
        <p style={{ margin: '15px 0 0', color: '#6c6661', fontSize: 9, letterSpacing: '.27em' }}>
          {SITE.tagline}
        </p>
      </header>
    </>
  );
}

function OpenedMobile({
  active,
  activeIndex,
  series,
  onClose,
  onSelect
}: {
  active: Collection;
  activeIndex: number;
  series: Collection[];
  onClose: () => void;
  onSelect: (index: number) => void;
}) {
  const resolvedCover = resolveCollectionCover(active);
  const artwork = resolvedCover.image.startsWith('/') ? resolvedCover.image : undefined;
  const work = active.works[0];
  const otherCases = series
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => index !== activeIndex);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 92,
          left: '55%',
          width: 164,
          height: 358,
          transform: 'translateX(-50%)'
        }}
      >
        <button
          type="button"
          aria-label={`Close ${active.titleEn}`}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            overflow: 'hidden',
            padding: 12,
            border: '1px solid rgba(31, 85, 205, .86)',
            borderRadius: 2,
            background: 'rgba(52, 94, 196, .18)',
            boxShadow:
              'inset 0 0 0 4px rgba(255,255,255,.28), inset 0 0 0 6px rgba(31,82,193,.30), 0 14px 26px rgba(56,44,36,.14)'
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'relative',
              display: 'block',
              overflow: 'hidden',
              width: '100%',
              height: '100%',
              background: resolvedCover.matte === 'graphite'
                ? '#20201e'
                : resolvedCover.matte === 'transparent'
                  ? 'rgba(255,255,255,.12)'
                  : '#e8dfd4',
              boxShadow: 'inset 0 0 0 1px rgba(12, 28, 73, .52)'
            }}
          >
            {artwork ? (
              <Image
                src={artwork}
                alt=""
                draggable={false}
                fill
                unoptimized
                sizes="140px"
                style={{
                  display: 'block',
                  objectFit: resolvedCover.fit,
                  objectPosition: `${resolvedCover.focus[0] * 100}% ${resolvedCover.focus[1] * 100}%`,
                  transform: `scale(${resolvedCover.zoom})`,
                  transformOrigin: `${resolvedCover.focus[0] * 100}% ${resolvedCover.focus[1] * 100}%`
                }}
              />
            ) : (
              <span style={{ display: 'block', width: '100%', height: '100%', background: `linear-gradient(180deg, ${active.palette.join(', ')})` }} />
            )}
          </span>
          <Fasteners />
        </button>

        <span
          aria-hidden
          style={{
            position: 'absolute',
            zIndex: 4,
            top: -28,
            bottom: -18,
            left: -86,
            width: 84,
            clipPath: 'polygon(0 0, 100% 8%, 100% 92%, 0 100%)',
            border: '2px solid rgba(28, 83, 205, .86)',
            background:
              'linear-gradient(90deg, rgba(255,255,255,.44), rgba(102,145,225,.12) 56%, rgba(255,255,255,.32))',
            boxShadow: 'inset 0 0 0 4px rgba(255,255,255,.20), 0 8px 18px rgba(41,52,86,.08)'
          }}
        />
      </div>

      <Rail top="450px" />

      <div style={{ position: 'absolute', top: 492, left: 24, width: 'calc(100% - 48px)' }}>
        <h2 style={{ margin: 0, font: '400 24px/1.1 var(--serif)', letterSpacing: '-.01em' }}>
          {active.titleEn.toUpperCase()}
        </h2>
        <p style={metaStyle}>SCENE {work?.dimensions ?? '05 / 06'}</p>
        <p style={{ ...metaStyle, marginTop: 4 }}>{active.year} / {active.medium.toUpperCase()}</p>
        <span style={{ display: 'block', width: 20, height: 1, margin: '17px 0 14px', background: '#8a817b' }} />
        <p style={{ margin: 0, color: '#736d69', fontSize: 12, lineHeight: 1.55, letterSpacing: '.055em' }}>
          {active.descriptionEn}<br />
          {work?.oneLineEn ?? 'A moment held in blue.'}
        </p>
      </div>

      <nav
        aria-label="Other archive cases"
        style={{
          position: 'fixed',
          zIndex: 8,
          right: 12,
          bottom: 6,
          left: 12,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 4,
          height: 48,
          padding: '0 0 4px'
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            left: 0,
            height: 7,
            border: '1px solid rgba(105,91,82,.16)',
            background: 'linear-gradient(180deg, rgba(255,255,255,.58), rgba(255,255,255,.18))',
            boxShadow: '0 2px 4px rgba(55,45,38,.10)'
          }}
        />
        {otherCases.map(({ item, index }) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Select ${item.titleEn}`}
            onClick={() => onSelect(index)}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              placeItems: 'end center',
              width: 44,
              minWidth: 44,
              height: 44,
              minHeight: 44,
              padding: '0 0 5px',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'block',
                width: INDEX_WIDTHS[index] ?? 9,
                height: INDEX_HEIGHTS[index] ?? 35,
                border: '1px solid rgba(255,255,255,.62)',
                background: shellTint[item.shell],
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.26), 0 3px 6px rgba(45,38,33,.11)'
              }}
            />
          </button>
        ))}
      </nav>
    </>
  );
}

function MobileCase({
  item,
  index,
  width,
  angle,
  onClick
}: {
  item: Collection;
  index: number;
  width: number;
  angle: number;
  onClick: () => void;
}) {
  const isAlways = item.cover.startsWith('/');
  return (
    <button
      type="button"
      aria-label={`Open ${item.titleEn}`}
      onClick={onClick}
      style={{
        position: 'relative',
        flex: `0 0 ${width}px`,
        width,
        height: index === 3 ? 264 : 260,
        overflow: 'hidden',
        padding: 0,
        border: '1px solid rgba(255,255,255,.72)',
        borderRadius: 2,
        background: shellTint[item.shell],
        boxShadow:
          'inset 0 0 0 3px rgba(255,255,255,.22), inset 0 0 0 5px rgba(42,37,34,.10), 0 8px 12px rgba(58,47,40,.14)',
        transform: `rotateY(${angle}deg)`,
        transformOrigin: index < 3 ? 'right center' : index > 3 ? 'left center' : 'center'
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: '7px 7px 8px',
          opacity: isAlways ? .98 : .68,
          background: isAlways
            ? `url("${item.cover}") center / cover no-repeat`
            : `linear-gradient(158deg, ${item.palette[0]}, ${item.palette[1]} 54%, ${item.palette[2]})`
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 5,
          bottom: 5,
          left: '50%',
          width: index === 3 ? 12 : 10,
          transform: 'translateX(-50%)',
          border: '1px solid rgba(255,255,255,.44)',
          background: index === 3 ? 'rgba(8,31,88,.78)' : 'rgba(22,24,24,.46)',
          color: 'rgba(255,255,255,.86)',
          fontSize: 6,
          letterSpacing: '.16em',
          writingMode: 'vertical-rl',
          textTransform: 'uppercase'
        }}
      >
        {item.titleEn} / {String(index + 1).padStart(2, '0')}
      </span>
    </button>
  );
}

function Rail({ top }: { top: string }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        top,
        right: 14,
        left: 14,
        height: 12,
        border: '1px solid rgba(105,91,82,.18)',
        background: 'linear-gradient(180deg, rgba(255,255,255,.64), rgba(255,255,255,.16))',
        boxShadow: '0 4px 8px rgba(55,45,38,.12)'
      }}
    />
  );
}

function Fasteners() {
  return (
    <>
      {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map((name) => {
        const vertical = name.startsWith('top') ? 8 : undefined;
        const bottom = name.startsWith('bottom') ? 8 : undefined;
        const left = name.endsWith('Left') ? 8 : undefined;
        const right = name.endsWith('Right') ? 8 : undefined;
        return (
          <span
            key={name}
            aria-hidden
            style={{
              position: 'absolute',
              top: vertical,
              right,
              bottom,
              left,
              width: 6,
              height: 6,
              border: '1px solid rgba(37,39,45,.62)',
              borderRadius: '50%',
              background: 'rgba(225,222,210,.76)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.65)'
            }}
          />
        );
      })}
    </>
  );
}

const hintStyle: CSSProperties = {
  position: 'absolute',
  zIndex: 8,
  top: 26,
  left: 22,
  margin: 0,
  color: '#5b5652',
  fontSize: 9,
  lineHeight: 1,
  letterSpacing: '.28em'
};

const metaStyle: CSSProperties = {
  margin: '7px 0 0',
  color: '#736d69',
  fontFamily: 'var(--mono)',
  fontSize: 10,
  lineHeight: 1.25,
  letterSpacing: '.19em'
};
