// AbilityScoresStep.tsx (T-120, step 3) — §7.4
// Method toggle (Point Buy / Standard Array / Manual) driving six stepper rows.
// All three methods share one row component; only the inc/dec rules differ.

import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { Button, Input, Surface, Text, cn } from '@open20/ui';
import { getModifier } from 'open20-core';
import { ABILITY_NAMES } from 'open20-core/types';
import type { AbilityName } from 'open20-core';
import {
  MANUAL_MAX,
  MANUAL_MIN,
  POINT_BUY_BUDGET,
  STANDARD_ARRAY,
  canDecrementPointBuy,
  canIncrementPointBuy,
  canSwapStandardArray,
  defaultScoresFor,
  pointsRemaining,
  swapStandardArray,
  validateAbilityScores,
  type AbilityScoreMethod,
  type Scores,
} from '@/lib/point-buy';

const METHODS: Array<{ id: AbilityScoreMethod; label: string }> = [
  { id: 'point-buy', label: 'Point Buy' },
  { id: 'standard-array', label: 'Standard Array' },
  { id: 'manual', label: 'Manual' },
];

export interface AbilityScoresStepProps {
  method: AbilityScoreMethod;
  scores: Scores;
  onChange: (patch: { method?: AbilityScoreMethod; scores?: Scores }) => void;
}

export function AbilityScoresStep({ method, scores, onChange }: AbilityScoresStepProps) {
  const remaining = pointsRemaining(scores);
  const { errors } = validateAbilityScores(method, scores);

  const handleMethodChange = (next: AbilityScoreMethod): void => {
    if (next === method) return;
    // Manual keeps whatever is on screen so a point-buy spread can be nudged
    // past 15; the other two methods have strict shapes and must reset.
    onChange({ method: next, scores: next === 'manual' ? scores : defaultScoresFor(next) });
  };

  const step = (ability: AbilityName, dir: 1 | -1): void => {
    if (method === 'standard-array') {
      onChange({ scores: swapStandardArray(scores, ability, dir) });
      return;
    }
    const next = scores[ability] + dir;
    onChange({ scores: { ...scores, [ability]: next } });
  };

  const canStep = (ability: AbilityName, dir: 1 | -1): boolean => {
    if (method === 'point-buy') {
      return dir === 1
        ? canIncrementPointBuy(scores, ability)
        : canDecrementPointBuy(scores, ability);
    }
    if (method === 'standard-array') return canSwapStandardArray(scores, ability, dir);
    return dir === 1 ? scores[ability] < MANUAL_MAX : scores[ability] > MANUAL_MIN;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Method toggle */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Ability score method">
        {METHODS.map((option) => {
          const active = option.id === method;
          return (
            <Button
              key={option.id}
              variant={active ? 'primary' : 'outline'}
              aria-pressed={active}
              onClick={() => handleMethodChange(option.id)}
            >
              {/* NFR-01: the active method is marked by a check, not colour alone. */}
              {active && <Check className="mr-1 h-4 w-4" aria-hidden="true" />}
              {option.label}
            </Button>
          );
        })}
      </div>

      {/* Score rows */}
      <div className="flex flex-col gap-2">
        {ABILITY_NAMES.map((ability) => (
          <AbilityScoreRow
            key={ability}
            ability={ability}
            score={scores[ability]}
            method={method}
            canIncrement={canStep(ability, 1)}
            canDecrement={canStep(ability, -1)}
            onStep={(dir) => step(ability, dir)}
            onSet={(value) => onChange({ scores: { ...scores, [ability]: value } })}
          />
        ))}
      </div>

      {/* Budget readout */}
      <Surface variant="ghost" padding="sm">
        {method === 'point-buy' && (
          <Text
            variant="bodySm"
            className={cn('tabular-nums', remaining > 0 && 'text-warning')}
            color={remaining > 0 ? undefined : 'secondary'}
          >
            Points remaining: {remaining} / {POINT_BUY_BUDGET}
            {remaining > 0 && ' — unspent'}
          </Text>
        )}
        {method === 'standard-array' && (
          <Text variant="bodySm" color="secondary">
            Standard array: {STANDARD_ARRAY.join(', ')} — use +/− to swap values between abilities.
          </Text>
        )}
        {method === 'manual' && (
          <Text variant="bodySm" color="secondary">
            Manual entry — no budget enforced ({MANUAL_MIN}–{MANUAL_MAX}).
          </Text>
        )}
      </Surface>

      {errors.length > 0 && (
        <Surface variant="warning" padding="sm" role="alert">
          {errors.map((message) => (
            <Text key={message} variant="bodySm">
              {message}
            </Text>
          ))}
        </Surface>
      )}
    </div>
  );
}

function AbilityScoreRow({
  ability,
  score,
  method,
  canIncrement,
  canDecrement,
  onStep,
  onSet,
}: {
  ability: AbilityName;
  score: number;
  method: AbilityScoreMethod;
  canIncrement: boolean;
  canDecrement: boolean;
  onStep: (dir: 1 | -1) => void;
  onSet: (value: number) => void;
}) {
  const modifier = getModifier(score);

  return (
    <div className="flex items-center gap-3">
      <Text variant="bodySm" weight="bold" className="w-28 shrink-0">
        {ability}
      </Text>

      <Button
        variant="ghost"
        className="h-11 w-11 shrink-0 p-0"
        aria-label={`Decrease ${ability}`}
        disabled={!canDecrement}
        onClick={() => onStep(-1)}
      >
        <Minus className="h-4 w-4" />
      </Button>

      {method === 'manual' ? (
        <ManualScoreInput ability={ability} score={score} onSet={onSet} />
      ) : (
        <Text variant="body" weight="bold" className="w-20 text-center tabular-nums">
          {score}
        </Text>
      )}

      <Button
        variant="ghost"
        className="h-11 w-11 shrink-0 p-0"
        aria-label={`Increase ${ability}`}
        disabled={!canIncrement}
        onClick={() => onStep(1)}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Text variant="bodySm" color="secondary" className="tabular-nums">
        {modifier >= 0 ? `+${modifier}` : modifier}
      </Text>
    </div>
  );
}

/**
 * Manual score field. Holds the raw string locally so an in-progress edit —
 * an empty box, or a lone "-" — stays on screen instead of being committed as
 * a score. `Number('')` is 0, so parsing the raw value directly would silently
 * set the ability to 0 the moment the user clears the field.
 */
function ManualScoreInput({
  ability,
  score,
  onSet,
}: {
  ability: AbilityName;
  score: number;
  onSet: (value: number) => void;
}) {
  const [raw, setRaw] = useState(String(score));
  const [lastScore, setLastScore] = useState(score);

  // Re-sync when the score changes from outside (e.g. the +/- buttons).
  if (score !== lastScore) {
    setLastScore(score);
    setRaw(String(score));
  }

  return (
    <Input
      type="number"
      min={MANUAL_MIN}
      max={MANUAL_MAX}
      aria-label={`${ability} score`}
      value={raw}
      className="w-20 text-center tabular-nums"
      onChange={(e) => {
        const value = e.target.value;
        setRaw(value);
        // Transient editing states commit nothing.
        if (value.trim() === '') return;
        const parsed = Number(value);
        if (!Number.isInteger(parsed)) return;
        onSet(parsed);
      }}
      // Abandoning a partial edit restores the committed score.
      onBlur={() => setRaw(String(score))}
    />
  );
}
