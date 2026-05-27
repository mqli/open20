import type { Meta, StoryObj } from '@storybook/react';
import { SpellEditor } from './SpellEditor';
import type { Spell } from 'open20-core';
import { useState } from 'react';

// ── Sample Data ──────────────────────────────────────

const SAMPLE_CAANTRIP: Partial<Spell> = {
  id: 'fire-bolt',
  name: 'Fire Bolt',
  level: 0,
  school: 'Evocation',
  castingTime: 'Action',
  range: '120 feet',
  components: ['V', 'S'],
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: [
    'You hurl a mote of fire at a creature or object within range.',
    'Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage.',
  ],
  cantripUpgrade: [
    { atCharacterLevel: 5, damage: [{ dice: '2d10', type: 'Fire' }] },
    { atCharacterLevel: 11, damage: [{ dice: '3d10', type: 'Fire' }] },
    { atCharacterLevel: 17, damage: [{ dice: '4d10', type: 'Fire' }] },
  ],
  source: 'PHB',
  classes: ['Wizard', 'Sorcerer'],
};

const SAMPLE_SPELL_LEVEL1: Partial<Spell> = {
  id: 'magic-missile',
  name: 'Magic Missile',
  level: 1,
  school: 'Evocation',
  castingTime: 'Action',
  range: '120 feet',
  components: ['V', 'S'],
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: [
    'You create three glowing darts of magical force.',
    'Each dart hits a creature of your choice that you can see within range.',
  ],
  damage: {
    entries: [{ dice: '1d4+1', type: 'Force' }],
    perSlot: [{ dice: '1d4+1', type: 'Force' }],
  },
  usingAHigherLevelSpellSlot: [
    'When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st.',
  ],
  source: 'PHB',
  classes: ['Wizard'],
};

const SAMPLE_HEALING: Partial<Spell> = {
  id: 'cure-wounds',
  name: 'Cure Wounds',
  level: 1,
  school: 'Evocation',
  castingTime: 'Action',
  range: 'Touch',
  components: ['V', 'S'],
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: [
    'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier.',
  ],
  heal: { dice: '1d8' },
  usingAHigherLevelSpellSlot: [
    'When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st.',
  ],
  source: 'PHB',
  classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'],
};

// ── Meta Configuration ──────────────────────────────

const meta: Meta<typeof SpellEditor> = {
  title: 'Spell/SpellEditor',
  component: SpellEditor,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A reusable spell editor component for creating and editing D&D 5e spells. Supports all Spell type fields with form validation and real-time preview.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

// ── Stories ────────────────────────────────────────

export const Default: StoryObj<typeof SpellEditor> = {
  name: 'Create New Spell',
  args: {
    onSubmit: (spell) => console.log('Create spell:', spell),
  },
  render: (args) => {
    const [submittedData, setSubmittedData] = useState<Partial<Spell>>();
    return (
      <div className="max-w-4xl mx-auto">
        <SpellEditor
          {...args}
          onSubmit={(spell) => {
            setSubmittedData(spell);
            args.onSubmit?.(spell);
          }}
        />
        {submittedData && (
          <pre className="mt-4 p-4 bg-bg-tertiary rounded-md text-xs overflow-auto">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        )}
      </div>
    );
  },
};

export const EditCantrip: StoryObj<typeof SpellEditor> = {
  name: 'Edit Cantrip',
  args: {
    defaultValue: SAMPLE_CAANTRIP,
    onSubmit: (spell) => console.log('Update spell:', spell),
    onCancel: () => console.log('Cancel edit'),
  },
  render: (args) => (
    <div className="max-w-4xl mx-auto">
      <SpellEditor {...args} />
    </div>
  ),
};

export const EditLevel1Spell: StoryObj<typeof SpellEditor> = {
  name: 'Edit 1st Level Spell',
  args: {
    defaultValue: SAMPLE_SPELL_LEVEL1,
    onSubmit: (spell) => console.log('Update spell:', spell),
  },
  render: (args) => (
    <div className="max-w-4xl mx-auto">
      <SpellEditor {...args} />
    </div>
  ),
};

export const EditHealingSpell: StoryObj<typeof SpellEditor> = {
  name: 'Edit Healing Spell',
  args: {
    defaultValue: SAMPLE_HEALING,
    onSubmit: (spell) => console.log('Update spell:', spell),
  },
  render: (args) => (
    <div className="max-w-4xl mx-auto">
      <SpellEditor {...args} />
    </div>
  ),
};

export const WithPreview: StoryObj<typeof SpellEditor> = {
  name: 'With Live Preview',
  args: {
    defaultValue: SAMPLE_CAANTRIP,
    showPreview: true,
    onSubmit: (spell) => console.log('Submit:', spell),
  },
  render: (args) => (
    <div className="max-w-6xl mx-auto">
      <SpellEditor {...args} />
    </div>
  ),
};

export const Disabled: StoryObj<typeof SpellEditor> = {
  name: 'Disabled Mode',
  args: {
    defaultValue: SAMPLE_SPELL_LEVEL1,
    disabled: true,
  },
  render: (args) => (
    <div className="max-w-4xl mx-auto">
      <SpellEditor {...args} />
    </div>
  ),
};

export const ControlledMode: StoryObj<typeof SpellEditor> = {
  name: 'Controlled Mode',
  render: () => {
    const [value, setValue] = useState<Partial<Spell>>(SAMPLE_CAANTRIP);
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <SpellEditor
          value={value}
          onChange={(spell) => {
            console.log('Change:', spell);
            setValue(spell);
          }}
          onSubmit={(spell) => console.log('Submit:', spell)}
        />
        <div className="p-4 bg-bg-tertiary rounded-md">
          <h4 className="text-sm font-bold mb-2">Current Form Data:</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};

export const EmbeddableExample: StoryObj<typeof SpellEditor> = {
  name: 'Embeddable (Dialog Example)',
  render: () => {
    const [open, setOpen] = useState(false);
    const [spell, setSpell] = useState<Partial<Spell>>();
    return (
      <div className="p-8">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md"
        >
          Open Spell Editor
        </button>
        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-bg-secondary w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 rounded-lg p-6">
              <SpellEditor
                defaultValue={spell}
                onSubmit={(s) => {
                  setSpell(s);
                  setOpen(false);
                }}
                onCancel={() => setOpen(false)}
              />
            </div>
          </div>
        )}
        {spell && (
          <div className="mt-4 p-4 bg-bg-tertiary rounded-md">
            <h4 className="text-sm font-bold mb-2">Saved Spell:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(spell, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  },
};
