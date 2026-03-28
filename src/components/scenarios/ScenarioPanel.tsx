import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScenarioStore } from '../../store/useScenarioStore';

const STORAGE_KEY = 'deal-calculator-scenarios';

function handleExport() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const blob = new Blob([JSON.stringify(JSON.parse(raw), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `deal-calculator-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ScenarioPanel() {
  const { t, i18n } = useTranslation();
  const { scenarios, activeId, saveScenario, loadScenario, duplicateScenario, deleteScenario, renameScenario, newScenario } = useScenarioStore();
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  const importRef = useRef<HTMLInputElement>(null);
  const activeScenario = scenarios.find(s => s.id === activeId);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        window.location.reload();
      } catch {
        alert(t('scenarios.invalidFile'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveAs = () => {
    const name = saveName.trim() || activeScenario?.name;
    if (!name) return;
    saveScenario(name);
    setSaveName('');
    setShowSave(false);
  };

  const handleRename = (id: string) => {
    if (!renameVal.trim()) return;
    renameScenario(id, renameVal.trim());
    setRenamingId(null);
  };

  const locale = i18n.language === 'he' ? 'he-IL' : 'en-US';

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">{t('scenarios.title')}</p>
          <div className="flex gap-1">
            <button
              onClick={handleExport}
              title={t('scenarios.exportTitle')}
              className="text-[10px] px-1.5 py-0.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
            >
              {t('scenarios.export')}
            </button>
            <button
              onClick={() => importRef.current?.click()}
              title={t('scenarios.importTitle')}
              className="text-[10px] px-1.5 py-0.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded transition-colors"
            >
              {t('scenarios.import')}
            </button>
            <input ref={importRef} type="file" accept=".json,application/json" className="hidden" onChange={handleImport} />
          </div>
        </div>

        {/* Active scenario indicator */}
        {activeScenario ? (
          <div className="flex items-center justify-between">
            <div className="text-xs text-blue-400 truncate">{activeScenario.name}</div>
            <div className="text-[10px] text-gray-500">{t('scenarios.autoSaved')}</div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">{t('scenarios.unsaved')}</div>
        )}

        {/* Buttons */}
        <div className="flex gap-1.5 mt-2">
          {!activeScenario && (
            <button
              onClick={() => setShowSave(true)}
              className="flex-1 text-xs py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
            >
              {t('scenarios.save')}
            </button>
          )}
          {activeScenario && (
            <button
              onClick={() => { setSaveName(activeScenario.name); setShowSave(v => !v); }}
              className="flex-1 text-xs py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              {t('scenarios.saveAs')}
            </button>
          )}
          <button
            onClick={newScenario}
            className="flex-1 text-xs py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
          >
            {t('scenarios.new')}
          </button>
        </div>

        {showSave && (
          <div className="mt-2 flex gap-1">
            <input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveAs()}
              placeholder={activeScenario?.name ?? t('scenarios.namePlaceholder')}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={handleSaveAs}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              ✓
            </button>
          </div>
        )}
      </div>

      {/* Scenario list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
        {scenarios.length === 0 && (
          <p className="text-xs text-gray-500 text-center mt-4">{t('scenarios.empty')}</p>
        )}
        {scenarios.map(s => (
          <div
            key={s.id}
            className={`rounded-lg border transition-colors ${
              s.id === activeId
                ? 'bg-blue-600/20 border-blue-500'
                : 'bg-gray-800 border-gray-700 hover:border-gray-500'
            }`}
          >
            {renamingId === s.id ? (
              <div className="flex gap-1 p-2">
                <input
                  value={renameVal}
                  onChange={e => setRenameVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRename(s.id)}
                  className="flex-1 bg-gray-700 rounded px-2 py-0.5 text-xs text-white outline-none"
                  autoFocus
                />
                <button onClick={() => handleRename(s.id)} className="text-xs text-green-400">✓</button>
                <button onClick={() => setRenamingId(null)} className="text-xs text-gray-400">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-1 p-2">
                <button
                  onClick={() => loadScenario(s.id)}
                  className="flex-1 text-right text-xs text-gray-200 truncate"
                >
                  {s.name}
                </button>
                <button
                  onClick={() => { setRenamingId(s.id); setRenameVal(s.name); }}
                  className="text-gray-500 hover:text-gray-300 text-xs px-0.5"
                  title={t('scenarios.rename')}
                >
                  ✎
                </button>
                <button
                  onClick={() => duplicateScenario(s.id, `${s.name}${t('scenarios.duplicateSuffix')}`)}
                  className="text-gray-500 hover:text-gray-300 text-xs px-0.5"
                  title={t('scenarios.duplicate')}
                >
                  ⧉
                </button>
                <button
                  onClick={() => {
                    if (confirm(t('scenarios.confirmDelete', { name: s.name }))) deleteScenario(s.id);
                  }}
                  className="text-gray-500 hover:text-red-400 text-xs px-0.5"
                  title={t('scenarios.delete')}
                >
                  ✕
                </button>
              </div>
            )}
            <div className="px-2 pb-1.5 text-[10px] text-gray-500">
              {t('scenarios.updatedAt')} {new Date(s.updatedAt).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
