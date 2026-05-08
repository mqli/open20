import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/stores';
import { useLocale } from '@/hooks';
import { Button, Card, CardContent } from '@/components/ui';
import { ChevronLeft, ChevronRight, Check, Swords } from 'lucide-react';

const STEPS = [
  { id: 'details', name: 'Details' },
  { id: 'species', name: 'Species' },
  { id: 'class', name: 'Class' },
  { id: 'abilities', name: 'Abilities' },
  { id: 'review', name: 'Review' },
];

// Mock data for demo
const SPECIES = [
  { id: 'human', name: 'Human', description: 'Adaptable and versatile' },
  { id: 'elf', name: 'Elf', description: 'Graceful and long-lived' },
  { id: 'dwarf', name: 'Dwarf', description: 'Stout and resilient' },
  { id: 'halfling', name: 'Halfling', description: 'Lucky and nimble' },
];

const CLASSES = [
  { id: 'Fighter', name: 'Fighter', description: 'Master of combat' },
  { id: 'Wizard', name: 'Wizard', description: 'Arcane spellcaster' },
  { id: 'Rogue', name: 'Rogue', description: 'Stealth and precision' },
  { id: 'Cleric', name: 'Cleric', description: 'Divine healer' },
];

export function CharacterCreation() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { initCharacter, isLoading } = useCharacterStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [abilities, setAbilities] = useState({
    Strength: 10,
    Dexterity: 10,
    Constitution: 10,
    Intelligence: 10,
    Wisdom: 10,
    Charisma: 10,
  });

  const handleCreate = async () => {
    await initCharacter({
      name: name || 'New Character',
      speciesId: selectedSpecies,
      classId: selectedClass,
      abilityScores: abilities,
    });
    navigate('/game');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return name.length > 0;
      case 1: return selectedSpecies !== '';
      case 2: return selectedClass !== '';
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="w-full space-y-4">
            <h2 className="text-xl font-semibold">{t('creation.name')}</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter character name..."
              className="w-full h-12 px-4 bg-[--color-bg-elevated] border border-[--color-border] rounded-lg text-lg"
            />
          </div>
        );

      case 1:
        return (
          <div className="w-full space-y-4">
            <h2 className="text-xl font-semibold">{t('creation.species')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {SPECIES.map((species) => (
                <Card
                  key={species.id}
                  className={`cursor-pointer transition-colors ${
                    selectedSpecies === species.id
                      ? 'border-[--color-accent-gold] bg-[--color-bg-elevated]'
                      : 'hover:bg-[--color-bg-elevated]'
                  }`}
                  onClick={() => setSelectedSpecies(species.id)}
                >
                  <CardContent>
                    <h3 className="font-semibold">{species.name}</h3>
                    <p className="text-sm text-[--color-text-secondary]">{species.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="w-full space-y-4">
            <h2 className="text-xl font-semibold">{t('creation.class')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {CLASSES.map((cls) => (
                <Card
                  key={cls.id}
                  className={`cursor-pointer transition-colors ${
                    selectedClass === cls.id
                      ? 'border-[--color-accent-gold] bg-[--color-bg-elevated]'
                      : 'hover:bg-[--color-bg-elevated]'
                  }`}
                  onClick={() => setSelectedClass(cls.id)}
                >
                  <CardContent>
                    <h3 className="font-semibold">{cls.name}</h3>
                    <p className="text-sm text-[--color-text-secondary]">{cls.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="w-full space-y-4">
            <h2 className="text-xl font-semibold">{t('creation.abilities')}</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(abilities).map(([ability, value]) => (
                <div key={ability} className="flex items-center justify-between">
                  <span className="font-medium w-24">{ability.slice(0, 3)}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAbilities({ ...abilities, [ability]: Math.max(1, value - 1) })}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-semibold">{value}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAbilities({ ...abilities, [ability]: Math.min(20, value + 1) })}
                    >
                      +
                    </Button>
                    <span className="text-sm text-[--color-text-secondary] w-8">
                      {value >= 10 ? `+${Math.floor((value - 10) / 2)}` : Math.floor((value - 10) / 2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="w-full space-y-4">
            <h2 className="text-xl font-semibold">{t('creation.review')}</h2>
            <Card>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[--color-text-secondary]">Name</span>
                    <span className="font-semibold">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[--color-text-secondary]">Species</span>
                    <span className="font-semibold">{SPECIES.find(s => s.id === selectedSpecies)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[--color-text-secondary]">Class</span>
                    <span className="font-semibold">{selectedClass}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[--color-bg-primary] text-[--color-text-primary]">
      {/* Header */}
      <header className="p-4 border-b border-[--color-border] w-full">
        <div className="flex items-center justify-center gap-2">
          <Swords className="w-6 h-6 text-[--color-accent-gold]" />
          <h1 className="text-xl font-bold">{t('creation.title')}</h1>
        </div>
      </header>

      {/* Progress */}
      <div className="p-4 w-full">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? 'bg-[--color-accent-green] text-white'
                    : index === currentStep
                    ? 'bg-[--color-accent-gold] text-[--color-bg-primary]'
                    : 'bg-[--color-bg-elevated] text-[--color-text-muted]'
                }`}
              >
                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    index < currentStep ? 'bg-[--color-accent-green]' : 'bg-[--color-border]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-[--color-text-secondary] mt-2">
          {t('creation.step', { current: currentStep + 1, total: STEPS.length })}
        </p>
      </div>

      {/* Content */}
      <main className="p-4 w-full">{renderStep()}</main>

      {/* Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 border-t border-[--color-border] bg-[--color-bg-primary]">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('common.back')}
          </Button>
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
            >
              {t('common.next')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={isLoading || !canProceed()}>
              {isLoading ? t('common.loading') : t('creation.createCharacter')}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
