import dayjs from 'dayjs/esm';

import { FlowGraph } from './designer/flow-graph';
import { IFlowCounts, IFlowStats, IStepCounts, IStepStats } from './flow.service';

/** A titled table of stats; with columns, every row has one value per column. */
export interface FlowStatsSection {
  title: string;
  columns?: string[];
  rows: Array<{ label: string; values: string[] }>;
  note?: string;
}

/** The stats of a started Flow, as shown in its stats popover and on its stats page. */
export function flowStatsSections(stats: IFlowStats): FlowStatsSection[] {
  // Processing times are only meaningful once a message went through
  const processed = Number(stats.transactionsTotal) > 0;
  const processingTime = (value: unknown): string => (processed ? formatProcessingTime(value) : '—');
  return [
    {
      title: 'Runtime',
      rows: [
        { label: 'Status', values: ['Started'] },
        { label: 'Running for', values: [formatDuration(stats.uptimeMillis)] },
        { label: 'Last completed', values: [formatTimestamp(stats.lastCompleted)] },
        { label: 'Last failed', values: [formatTimestamp(stats.lastFailed)] },
      ],
    },
    {
      title: 'Messages',
      columns: ['Transactions', 'Exchanges'],
      rows: [
        { label: 'Total', values: [formatCount(stats.transactionsTotal), formatCount(stats.exchangesTotal)] },
        { label: 'Completed', values: [formatCount(stats.transactionsCompleted), formatCount(stats.exchangesCompleted)] },
        { label: 'Pending', values: [formatCount(stats.transactionsPending), formatCount(stats.exchangesPending)] },
        { label: 'Failed', values: [formatCount(stats.transactionsFailed), formatCount(stats.exchangesFailed)] },
      ],
      note: 'A transaction counts a message once, an exchange counts it once for every step it passes.',
    },
    {
      title: 'Processing time',
      rows: [
        { label: 'Average', values: [processingTime(stats.meanProcessingTime)] },
        { label: 'Maximum', values: [processingTime(stats.maxProcessingTime)] },
        { label: 'Last', values: [processingTime(stats.lastProcessingTime)] },
      ],
    },
  ];
}

/**
 * The stats of one Step: its messages as on its badges, and how long it took to process them. Its processing
 * times are left out until they are read.
 */
export function stepStatsSections(counts: IFlowCounts | undefined, stats: IStepStats | undefined): FlowStatsSection[] {
  const processed = Number(counts?.total) > 0;
  const times = stats?.stats;
  const processingTime = (value: unknown): string => (processed ? formatProcessingTime(value) : '—');
  const sections: FlowStatsSection[] = [
    {
      title: 'Messages',
      rows: [
        { label: 'Total', values: [formatCount(counts?.total)] },
        { label: 'Completed', values: [formatCount(counts?.completed)] },
        { label: 'Pending', values: [formatCount(counts?.pending)] },
        { label: 'Failed', values: [formatCount(counts?.failed)] },
      ],
    },
  ];
  if (times) {
    sections.push({
      title: 'Processing time',
      rows: [
        { label: 'Average', values: [processingTime(times.meanProcessingTime)] },
        { label: 'Maximum', values: [processingTime(times.maxProcessingTime)] },
        { label: 'Last', values: [processingTime(times.lastProcessingTime)] },
      ],
    });
  }
  return sections;
}

/**
 * The exchanges of each Step on the canvas, by Step key. The runtime names a Step's routes after its saved id;
 * a Step with more than one route (`34`, `34-…`) gets their counts added up.
 */
export function countsByStepKey(graph: FlowGraph, steps: IStepCounts[]): Map<string, IFlowCounts> {
  const keys = new Map(graph.steps.filter(step => step.id != null).map(step => [String(step.id), step.key]));
  const counts = new Map<string, IFlowCounts>();
  steps.forEach(step => {
    const key = keys.get(String(step.id).split('-')[0]);
    if (key) {
      const sum = counts.get(key);
      counts.set(
        key,
        sum
          ? { total: sum.total + step.total, completed: sum.completed + step.completed, failed: sum.failed + step.failed, pending: sum.pending + step.pending }
          : { total: step.total, completed: step.completed, failed: step.failed, pending: step.pending },
      );
    }
  });
  return counts;
}

/** A count short enough for a badge: 999, 1.2k, 12k, 3.4M. */
export function compactCount(count: number): string {
  const short = (value: number, unit: string): string => `${value < 10 ? Math.floor(value * 10) / 10 : Math.floor(value)}${unit}`;
  if (count >= 1_000_000) {
    return short(count / 1_000_000, 'M');
  }
  return count >= 1000 ? short(count / 1000, 'k') : String(count);
}

function formatTimestamp(value: unknown): string {
  if (value == null || value === '') {
    return '—';
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    if (numeric <= 0) {
      return '—';
    }
    const date = dayjs(numeric);
    return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : '—';
  }
  const date = dayjs(String(value));
  return date.isValid() && date.year() > 1970 ? date.format('YYYY-MM-DD HH:mm:ss') : '—';
}

function formatDuration(value: unknown): string {
  const milliseconds = Number(value);
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return '—';
  }
  const totalSeconds = Math.round(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
  }
  return parts.join(' ');
}

function formatProcessingTime(value: unknown): string {
  const milliseconds = Number(value);
  return Number.isFinite(milliseconds) && milliseconds >= 0 ? `${milliseconds} ms` : '—';
}

function formatCount(value: unknown): string {
  const count = Number(value);
  return Number.isFinite(count) ? String(count) : '0';
}
