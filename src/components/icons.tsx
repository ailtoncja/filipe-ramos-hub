import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <circle cx="9" cy="9" r="5.75" />
      <path d="m13.5 13.5 4 4" strokeLinecap="round" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.5 4.75 15.75 10 6.5 15.25V4.75Z" />
    </svg>
  );
}

export function ListVideoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M3 5h10M3 9.5h7.5M3 14h6" strokeLinecap="round" />
      <path d="m13 10.5 4 2.5-4 2.5v-5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M7 5h8v8M15 5 5.5 14.5" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M4 10h11.5M11 5.5 15.5 10 11 14.5" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M16 10H4.5M9 5.5 4.5 10 9 14.5" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M10 16V4.5M5.5 9 10 4.5 14.5 9" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="3.25" />
      <path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M16.2 12.1A6.5 6.5 0 0 1 7.9 3.8a6.75 6.75 0 1 0 8.3 8.3Z" strokeLinejoin="miter" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <rect x="7" y="7" width="9.5" height="9.5" />
      <path d="M13 7V3.5H3.5V13H7" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" {...props}>
      <path d="m4.5 10.5 3.5 3.5 7.5-8" strokeLinecap="round" />
    </svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M10 3.25 17.25 16H2.75L10 3.25Z" />
      <path d="M10 8v3.75M10 14h.01" strokeLinecap="round" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M10 3.5v9.5M6.25 9.5 10 13.25 13.75 9.5M3.5 16h13" strokeLinecap="round" />
    </svg>
  );
}

export function LinkChainIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M8.5 11.5 11.5 8.5M7 13.5l-1.5 1.5a2.8 2.8 0 0 1-4-4L3 9.5M13 6.5 14.5 5a2.8 2.8 0 0 1 4 4L17 10.5" strokeLinecap="round" />
    </svg>
  );
}

export function PackageIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M10 2.75 16.5 6.25v7.5L10 17.25 3.5 13.75v-7.5L10 2.75Z" />
      <path d="M3.5 6.25 10 9.75l6.5-3.5M10 9.75v7.5" />
    </svg>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M3 6h14M3 14h14" strokeLinecap="round" />
      <circle cx="7.5" cy="6" r="2" fill="var(--bg)" />
      <circle cx="13" cy="14" r="2" fill="var(--bg)" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path d="M16.25 10a6.25 6.25 0 1 1-1.6-4.2" strokeLinecap="round" />
      <path d="M16.25 3.75v3.5h-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
