import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function WordPopup({ word, onClose, source = 'manual' }) {
  const [def, setDef] = useState('Loading...');
  const [example, setExample] = useState('');
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(r => r.json())
      .then(d => {
        const meaning = d?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;
        const ex = d?.[0]?.meanings?.[0]?.definitions?.[0]?.example;
        setDef(meaning || 'Definition not found.');
        if (ex) setExample(ex);
      })
      .catch(() => setDef('Could not fetch definition.'));
  }, [word]);

  const saveToVocab = async () => {
    if (def === 'Loading...' || def === 'Could not fetch definition.' || def === 'Definition not found.') return;
    setSaving(true);
    try {
      await axios.post('/api/vocabulary/add', { word, definition: def, example, source });
      toast.success(`'${word}' saved to Vocabulary Builder!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save word.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-dark-800 border border-white/10 p-6 max-w-sm w-full animate-slide-up shadow-2xl rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-display font-bold text-white capitalize">{word}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Definition</p>
            <p className="text-sm text-slate-200 leading-relaxed">{def}</p>
          </div>
          
          {example && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Example</p>
              <p className="text-sm text-slate-400 italic border-l-2 border-primary-500/30 pl-3">"{example}"</p>
            </div>
          )}
        </div>

        <button 
          onClick={saveToVocab} 
          disabled={saving || def === 'Loading...'}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
        >
          {saving ? 'Saving...' : '➕ Add to Vocabulary'}
        </button>
      </div>
    </div>
  );
}
