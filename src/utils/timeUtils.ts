import { useState, useEffect, useMemo } from 'react';
import { TimeStep } from '../types';

export interface StepApproximate {
  step: TimeStep;
  minutesOffset: number;
  targetDate: Date;
  timeStr: string; // e.g. "03:35"
  offsetLabel: string; // e.g. "NOW (Live)" or "+30 MIN"
  approxRelativeLabel: string; // e.g. "Live Now" or "In ~30m"
  fullDisplay: string; // e.g. "~04:05 (In ~30m)"
}

/**
 * Formats a given date to a localized readable full date string.
 * Example: "Monday, Sep 7, 2026"
 */
export function formatLiveDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a given date to a full long date string.
 * Example: "Monday, September 7, 2026"
 */
export function formatFullDate(date: Date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a given date to live 24-hour or 12-hour time string with seconds.
 * Example: "03:35:42"
 */
export function formatLiveTime(date: Date = new Date(), includeSeconds: boolean = true): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false,
  });
}

/**
 * Formats a given date to UTC time string.
 * Example: "10:35:42 UTC"
 */
export function formatUtcTime(date: Date = new Date(), includeSeconds: boolean = true): string {
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return includeSeconds ? `${hours}:${minutes}:${seconds} UTC` : `${hours}:${minutes} UTC`;
}

/**
 * Formats local timezone abbreviation or offset.
 * Example: "PDT" or "GMT+5:30"
 */
export function getTimezoneLabel(date: Date = new Date()): string {
  try {
    const tzString = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = date.toLocaleTimeString(undefined, { timeZoneName: 'short' }).split(' ');
    const abbr = parts[parts.length - 1];
    return abbr && abbr.length <= 6 ? abbr : tzString;
  } catch {
    const offsetMin = -date.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const hrs = Math.floor(Math.abs(offsetMin) / 60);
    const mins = Math.abs(offsetMin) % 60;
    return `UTC${sign}${hrs}${mins > 0 ? `:${mins}` : ''}`;
  }
}

/**
 * Calculates human-friendly relative time approximations (e.g. "just now", "~15s ago", "in ~30m").
 */
export function formatTimeApproximate(
  targetDateInput: Date | string | number,
  baseDate: Date = new Date()
): string {
  const targetDate = typeof targetDateInput === 'object' && targetDateInput instanceof Date
    ? targetDateInput
    : new Date(targetDateInput);

  if (isNaN(targetDate.getTime())) {
    return 'Recent';
  }

  const diffMs = targetDate.getTime() - baseDate.getTime();
  const diffSec = Math.round(diffMs / 1000);

  // Future dates (approximate countdown / projection)
  if (diffSec > 0) {
    if (diffSec < 30) return 'in moments';
    if (diffSec < 90) return 'in ~1 min';
    if (diffSec < 3600) return `in ~${Math.round(diffSec / 60)} mins`;
    if (diffSec < 7200) return `in ~${(diffSec / 3600).toFixed(1)} hrs`;
    if (diffSec < 86400) return `in ~${Math.round(diffSec / 3600)} hrs`;
    const days = Math.round(diffSec / 86400);
    return days === 1 ? 'tomorrow' : `in ~${days} days`;
  }

  // Past dates (approximate elapsed time)
  const elapsedSec = Math.abs(diffSec);
  if (elapsedSec < 8) return 'just now';
  if (elapsedSec < 60) return `~${elapsedSec}s ago`;
  if (elapsedSec < 120) return '~1 min ago';
  if (elapsedSec < 3600) return `~${Math.round(elapsedSec / 60)} mins ago`;
  if (elapsedSec < 7200) return `~${(elapsedSec / 3600).toFixed(1)} hrs ago`;
  if (elapsedSec < 86400) return `~${Math.round(elapsedSec / 3600)} hrs ago`;
  const pastDays = Math.round(elapsedSec / 86400);
  return pastDays === 1 ? 'yesterday' : `~${pastDays} days ago`;
}

/**
 * Generates dynamic time step approximations based on the live clock.
 */
export function getTimeStepApproximates(baseDate: Date = new Date()): StepApproximate[] {
  const offsets: { step: TimeStep; minutes: number; offsetLabel: string; approx: string }[] = [
    { step: 'NOW', minutes: 0, offsetLabel: 'NOW (Base)', approx: 'Live State' },
    { step: '+30', minutes: 30, offsetLabel: '+30 MIN', approx: 'In ~30m' },
    { step: '+60', minutes: 60, offsetLabel: '+60 MIN', approx: 'In ~1h' },
    { step: '+90', minutes: 90, offsetLabel: '+90 MIN', approx: 'In ~1.5h' },
    { step: '+120', minutes: 120, offsetLabel: '+120 MIN', approx: 'In ~2h' },
    { step: '+180', minutes: 180, offsetLabel: '+180 MIN', approx: 'In ~3h' },
  ];

  return offsets.map(({ step, minutes, offsetLabel, approx }) => {
    const target = new Date(baseDate.getTime() + minutes * 60000);
    const timeStr = target.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    return {
      step,
      minutesOffset: minutes,
      targetDate: target,
      timeStr,
      offsetLabel,
      approxRelativeLabel: approx,
      fullDisplay: `~${timeStr} (${approx})`,
    };
  });
}

/**
 * Computes dynamic hyetograph timeline series aligned with real-time clock.
 */
export function getDynamicHyetographData(baseDate: Date = new Date()) {
  const steps = getTimeStepApproximates(baseDate);
  const profiles = [
    { current: 15.2, forecast: 15.2, probability: 45 },
    { current: 28.5, forecast: 42.0, probability: 68 },
    { current: 0, forecast: 78.4, probability: 85 },
    { current: 0, forecast: 95.0, probability: 92 },
    { current: 0, forecast: 112.5, probability: 96 },
    { current: 0, forecast: 55.0, probability: 72 },
  ];

  return steps.map((s, idx) => ({
    time: idx === 0 ? `NOW (~${s.timeStr})` : `+${s.minutesOffset}m (~${s.timeStr})`,
    timeShort: s.timeStr,
    approxLabel: s.approxRelativeLabel,
    current: profiles[idx].current,
    forecast: profiles[idx].forecast,
    probability: profiles[idx].probability,
  }));
}

/**
 * Custom React Hook that provides continuous 1-second live clock ticks, formatted date/time,
 * UTC, and live time approximations.
 */
export function useLiveClock(intervalMs: number = 1000) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  const dateFormatted = useMemo(() => formatLiveDate(now), [now]);
  const fullDateFormatted = useMemo(() => formatFullDate(now), [now]);
  const timeFormatted = useMemo(() => formatLiveTime(now, true), [now]);
  const timeWithoutSeconds = useMemo(() => formatLiveTime(now, false), [now]);
  const utcFormatted = useMemo(() => formatUtcTime(now, true), [now]);
  const timezone = useMemo(() => getTimezoneLabel(now), [now]);
  const stepApproximates = useMemo(() => getTimeStepApproximates(now), [now]);

  return {
    now,
    dateFormatted,
    fullDateFormatted,
    timeFormatted,
    timeWithoutSeconds,
    utcFormatted,
    timezone,
    stepApproximates,
    formatRelative: (target: Date | string | number) => formatTimeApproximate(target, now),
  };
}
