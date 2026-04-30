'use client';

import React from 'react';
import { 
  Settings, 
  Upload, 
  Printer, 
  Layout, 
  Database,
  Copy
} from 'lucide-react';
import { LabelTemplate, Mapping, LabelData, SavedTemplate } from '@/types';
import { TEMPLATES } from '@/constants/templates';
import Papa from 'papaparse';

interface SidebarProps {
  template: LabelTemplate;
  setTemplate: (t: LabelTemplate) => void;
  mapping: Mapping;
  setMapping: (m: Mapping) => void;
  headers: string[];
  setHeaders: (h: string[]) => void;
  setData: (d: LabelData[]) => void;
  onPrint: () => void;
  globalCopies: number;
  setGlobalCopies: (n: number) => void;
  quantityColumn: string;
  setQuantityColumn: (s: string) => void;
  isPending?: boolean;
  savedTemplates: SavedTemplate[];
  onSaveTemplate: (name: string) => void;
  onLoadTemplate: (t: SavedTemplate) => void;
  onDeleteTemplate: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  template,
  setTemplate,
  mapping,
  setMapping,
  headers,
  setHeaders,
  setData,
  onPrint,
  globalCopies,
  setGlobalCopies,
  quantityColumn,
  setQuantityColumn,
  isPending,
  savedTemplates,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0) {
          const cols = Object.keys(results.data[0] as object);
          setHeaders(cols);
          setData(results.data as LabelData[]);
          
          // Auto-map if headers match common names
          const nameCol = cols.find(c => c.toLowerCase().includes('name') || c.toLowerCase().includes('header'));
          const skuCol = cols.find(c => c.toLowerCase().includes('sku') || c.toLowerCase().includes('desc'));
          const barcodeCol = cols.find(c => c.toLowerCase().includes('barcode') || c.toLowerCase().includes('id'));

          setMapping({
            textFields: [nameCol, skuCol].filter(Boolean) as string[],
            barcode: barcodeCol || cols[0],
          });
        }
      },
    });
  };


  return (
    <div className="flex h-full w-80 flex-col border-r bg-gray-50 p-6 print:hidden overflow-y-auto">
      <div className="mb-8 flex items-center gap-2">
        <div className="rounded-lg bg-indigo-600 p-2 text-white">
          <Printer size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Label Pro</h1>
      </div>

      <div className="space-y-8">
        {/* Template Selection */}
        <section>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Layout size={16} />
            <span>Template</span>
          </div>
          <select
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={template.id}
            onChange={(e) => setTemplate(TEMPLATES[e.target.value as '5160' | '5167'])}
          >
            {Object.values(TEMPLATES).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </section>

        {/* Data Upload */}
        <section>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Database size={16} />
            <span>Data Source</span>
          </div>
          <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white py-4 transition-all hover:border-indigo-400 hover:bg-gray-50 active:scale-[0.98]">
            <Upload size={24} className="mb-2 text-gray-400" />
            <span className="text-xs font-medium text-gray-600">Upload CSV</span>
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
        </section>

        {/* Saved Templates */}
        <section className="border-b pb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Database size={16} />
              <span>Saved Designs</span>
            </div>
            <button
              onClick={() => {
                const name = prompt('Enter a name for this template:');
                if (name) onSaveTemplate(name);
              }}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase"
            >
              Save Current
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {savedTemplates.length === 0 ? (
              <p className="text-[10px] text-gray-400 italic text-center py-2">No saved designs yet</p>
            ) : (
              savedTemplates.map((t, idx) => (
                <div key={idx} className="group flex items-center justify-between gap-2 p-2 rounded bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all">
                  <button
                    onClick={() => onLoadTemplate(t)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="text-[11px] font-bold text-gray-700 truncate">{t.name}</div>
                    <div className="text-[9px] text-gray-400">
                      {new Date(t.timestamp).toLocaleDateString()}
                    </div>
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    title="Delete Template"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Mapping UI */}
        {headers.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-2">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Settings size={16} />
              <span>Data Mapping</span>
            </div>
            <div className="space-y-4">
              {/* Barcode Select */}
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                  Barcode Value
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={mapping.barcode}
                  onChange={(e) => setMapping({ ...mapping, barcode: e.target.value })}
                >
                  <option value="">Select Column</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Fields Checkboxes */}
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase text-gray-400">
                  Display as Text Lines
                </label>
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-gray-200 bg-white p-2 shadow-inner">
                  {headers.map((h) => (
                    <label key={h} className="flex items-center gap-2 py-0.5 text-[11px] text-gray-600 hover:text-gray-900 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={mapping.textFields.includes(h)}
                        onChange={(e) => {
                          const newFields = e.target.checked
                            ? [...mapping.textFields, h]
                            : mapping.textFields.filter(f => f !== h);
                          setMapping({ ...mapping, textFields: newFields });
                        }}
                      />
                      <span className="truncate">{h}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-[9px] text-gray-400 italic">
                  Order follows selection. Uncheck/Recheck to reorder.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Quantity Selection */}
        <section>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Copy size={16} />
            <span>Quantity / Copies</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                Default Copies per Item
              </label>
              <input
                type="number"
                min="1"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={globalCopies}
                onChange={(e) => setGlobalCopies(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            
            {headers.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                  Use Quantity Column (Optional)
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={quantityColumn}
                  onChange={(e) => setQuantityColumn(e.target.value)}
                >
                  <option value="">None (Use Default)</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-auto pt-8 space-y-4">
        {isPending && (
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-indigo-600 animate-pulse">
            <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" />
            <span>Updating labels...</span>
          </div>
        )}
        
        <button
          onClick={onPrint}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Printer size={18} />
          Print Labels
        </button>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to clear all data and reset the design?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full py-2 text-[10px] font-bold uppercase text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear All Data & Design
        </button>
        <p className="mt-3 text-center text-[10px] text-gray-400">
          Set print scale to 100% for accuracy.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
