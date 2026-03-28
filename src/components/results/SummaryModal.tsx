import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';

interface Props {
  markdown: string;
  onClose: () => void;
}

export function SummaryModal({ markdown, onClose }: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'preview' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl flex flex-col w-full max-w-4xl max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-200">{t('results.summaryModalTitle')}</span>
          <div className="flex items-center gap-2">
            {/* Preview / Raw toggle */}
            <div className="flex bg-gray-800 border border-gray-700 rounded-md p-0.5">
              <button
                onClick={() => setMode('preview')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  mode === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t('results.summaryPreview')}
              </button>
              <button
                onClick={() => setMode('raw')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  mode === 'raw' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t('results.summaryRaw')}
              </button>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium bg-gray-800 border border-gray-700 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              {copied ? t('results.copied') : t('results.copy')}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-lg leading-none px-1 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {mode === 'preview' ? (
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-gray-100
              prose-p:text-gray-300
              prose-strong:text-gray-100
              prose-table:text-xs
              prose-td:border prose-td:border-gray-700 prose-td:px-2 prose-td:py-1
              prose-th:border prose-th:border-gray-700 prose-th:px-2 prose-th:py-1 prose-th:bg-gray-800
              prose-blockquote:border-l-gray-600 prose-blockquote:text-gray-400
              prose-code:text-blue-300
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          ) : (
            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
              {markdown}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
