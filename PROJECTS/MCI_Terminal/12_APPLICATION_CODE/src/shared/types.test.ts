/**
 * MCI Types Tests
 * 
 * SILO 1: Canonical Telemetry Type Definitions
 * Tests for type utilities and transform functions
 */

import { describe, it, expect } from 'vitest';
import {
  signalToObservation,
  narrativeToObservation,
  classifyLatency,
  getLatencyMessage,
  type CiaSieSignal,
  type CiaSieNarrative,
  type CiaSieLatencyStatus,
} from './types';

describe('SILO 1: Telemetry Contract Types', () => {
  describe('signalToObservation', () => {
    it('transforms signal to AIObservation format', () => {
      const signal: CiaSieSignal = {
        id: 'sig-123',
        chartId: 'chart-456',
        direction: 'buy',
        timestamp: '2026-01-29T12:00:00.000Z',
        indicator: 'RSI',
        freshness: 'fresh',
      };

      const observation = signalToObservation(signal);

      expect(observation.id).toBe('sig-123');
      expect(observation.timestamp).toBe(new Date('2026-01-29T12:00:00.000Z').getTime());
      expect(observation.type).toBe('observation');
      expect(observation.message).toContain('RSI');
      expect(observation.message).toContain('BUY');
      expect(observation.message).toContain('fresh');
    });

    it('handles sell direction', () => {
      const signal: CiaSieSignal = {
        id: 'sig-456',
        chartId: 'chart-789',
        direction: 'sell',
        timestamp: '2026-01-29T13:00:00.000Z',
        indicator: 'MACD',
        freshness: 'stale',
      };

      const observation = signalToObservation(signal);

      expect(observation.message).toContain('MACD');
      expect(observation.message).toContain('SELL');
      expect(observation.message).toContain('stale');
    });

    it('handles neutral direction', () => {
      const signal: CiaSieSignal = {
        id: 'sig-789',
        chartId: 'chart-101',
        direction: 'neutral',
        timestamp: '2026-01-29T14:00:00.000Z',
        indicator: 'EMA',
        freshness: 'fresh',
      };

      const observation = signalToObservation(signal);

      expect(observation.message).toContain('NEUTRAL');
    });
  });

  describe('narrativeToObservation', () => {
    it('transforms narrative to AIObservation format', () => {
      const narrative: CiaSieNarrative = {
        narrative: 'The RSI indicator shows overbought conditions.',
        disclaimer: 'This is not financial advice.',
        modelUsed: 'claude-3-5-sonnet',
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        generatedAt: '2026-01-29T12:00:00.000Z',
      };

      const observation = narrativeToObservation(narrative, 'obs-123');

      expect(observation.id).toBe('obs-123');
      expect(observation.timestamp).toBe(new Date('2026-01-29T12:00:00.000Z').getTime());
      expect(observation.type).toBe('observation');
      expect(observation.message).toContain('RSI indicator shows overbought');
      expect(observation.message).toContain('This is not financial advice');
    });

    it('includes disclaimer in message', () => {
      const narrative: CiaSieNarrative = {
        narrative: 'Test narrative.',
        disclaimer: 'Important disclaimer here.',
        modelUsed: 'claude-3-haiku',
        usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
        generatedAt: '2026-01-29T15:00:00.000Z',
      };

      const observation = narrativeToObservation(narrative, 'obs-456');

      expect(observation.message).toContain('Important disclaimer here');
    });
  });

  describe('classifyLatency', () => {
    it('classifies null as timeout', () => {
      expect(classifyLatency(null)).toBe('timeout');
    });

    it('classifies 0-100ms as ok', () => {
      expect(classifyLatency(0)).toBe('ok');
      expect(classifyLatency(50)).toBe('ok');
      expect(classifyLatency(100)).toBe('ok');
    });

    it('classifies 101-500ms as warn', () => {
      expect(classifyLatency(101)).toBe('warn');
      expect(classifyLatency(300)).toBe('warn');
      expect(classifyLatency(500)).toBe('warn');
    });

    it('classifies 501-2000ms as slow', () => {
      expect(classifyLatency(501)).toBe('slow');
      expect(classifyLatency(1000)).toBe('slow');
      expect(classifyLatency(2000)).toBe('slow');
    });

    it('classifies >2000ms as fail', () => {
      expect(classifyLatency(2001)).toBe('fail');
      expect(classifyLatency(5000)).toBe('fail');
      expect(classifyLatency(10000)).toBe('fail');
    });
  });

  describe('getLatencyMessage', () => {
    it('returns correct message for each status', () => {
      const statuses: CiaSieLatencyStatus[] = ['ok', 'warn', 'slow', 'fail', 'timeout'];
      
      statuses.forEach((status) => {
        const message = getLatencyMessage(status);
        expect(message).toBeTruthy();
        expect(message.length).toBeGreaterThan(10);
      });
    });

    it('returns appropriate message for ok', () => {
      expect(getLatencyMessage('ok')).toContain('normally');
    });

    it('returns appropriate message for warn', () => {
      expect(getLatencyMessage('warn')).toContain('slower');
    });

    it('returns appropriate message for slow', () => {
      expect(getLatencyMessage('slow')).toContain('delays');
    });

    it('returns appropriate message for fail', () => {
      expect(getLatencyMessage('fail')).toContain('very slow');
    });

    it('returns appropriate message for timeout', () => {
      expect(getLatencyMessage('timeout')).toContain('unavailable');
    });
  });

  describe('Type definitions completeness', () => {
    it('CiaSieSignal has all required fields', () => {
      const signal: CiaSieSignal = {
        id: 'test-id',
        chartId: 'chart-id',
        direction: 'buy',
        timestamp: '2026-01-29T00:00:00.000Z',
        indicator: 'RSI',
        freshness: 'fresh',
      };

      // TypeScript compilation ensures type correctness
      expect(signal.id).toBeTruthy();
      expect(signal.chartId).toBeTruthy();
      expect(signal.direction).toMatch(/^(buy|sell|neutral)$/);
      expect(signal.timestamp).toBeTruthy();
      expect(signal.indicator).toBeTruthy();
      expect(signal.freshness).toMatch(/^(fresh|stale)$/);
    });

    it('CiaSieNarrative has all required fields', () => {
      const narrative: CiaSieNarrative = {
        narrative: 'Test narrative',
        disclaimer: 'Test disclaimer',
        modelUsed: 'claude-3-5-sonnet',
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        generatedAt: '2026-01-29T00:00:00.000Z',
      };

      expect(narrative.narrative).toBeTruthy();
      expect(narrative.disclaimer).toBeTruthy();
      expect(narrative.modelUsed).toBeTruthy();
      expect(narrative.usage.promptTokens).toBeGreaterThanOrEqual(0);
      expect(narrative.usage.completionTokens).toBeGreaterThanOrEqual(0);
      expect(narrative.usage.totalTokens).toBeGreaterThanOrEqual(0);
      expect(narrative.generatedAt).toBeTruthy();
    });

    it('CiaSieSignalDirection has valid values', () => {
      const validDirections = ['buy', 'sell', 'neutral'];
      validDirections.forEach((dir) => {
        const signal: CiaSieSignal = {
          id: 'test',
          chartId: 'test',
          direction: dir as 'buy' | 'sell' | 'neutral',
          timestamp: '2026-01-29T00:00:00.000Z',
          indicator: 'RSI',
          freshness: 'fresh',
        };
        expect(signal.direction).toBe(dir);
      });
    });
  });
});
