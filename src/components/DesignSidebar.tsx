'use client';

import React, { useEffect, useRef } from 'react';
import { 
  Sliders, 
  Maximize, 
  Type, 
  Eye,
  ChevronUp,
  ChevronDown,
  Crosshair,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Square,
  Minus,
  Trash2,
  Barcode as BarcodeIcon
} from 'lucide-react';
import { Calibration, LabelStyles, Mapping, BarcodeType, VisibilityRule, LabelTemplate } from '@/types';

interface DesignSidebarProps {
  styles: LabelStyles;
  setStyles: (s: LabelStyles) => void;
  calibration: Calibration;
  setCalibration: (c: Calibration) => void;
  mapping: Mapping;
  setMapping: (m: Mapping) => void;
  headers: string[];
  template: LabelTemplate;
  selectedFields: string[];
  setSelectedFields: (ids: string[]) => void;
  saveHistory: (m: Mapping, s: LabelStyles) => void;
}

const DesignSidebar: React.FC<DesignSidebarProps> = ({
  styles,
  setStyles,
  calibration,
  setCalibration,
  mapping,
  setMapping,
  headers,
  template,
  selectedFields,
  setSelectedFields,
  saveHistory,
}) => {
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const barcodeRef = useRef<HTMLDivElement>(null);
  const selectedField = selectedFields[0];

  useEffect(() => {
    if (selectedField === 'barcode' && barcodeRef.current) {
      barcodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (selectedField && fieldRefs.current[selectedField]) {
      fieldRefs.current[selectedField]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedFields, selectedField]);
  const nudge = (axis: 'top' | 'left', amount: number) => {
    setCalibration({
      ...calibration,
      [axis]: Math.round((calibration[axis] + amount) * 100) / 100,
    });
  };

  const updateStyle = <K extends keyof LabelStyles>(key: K, value: LabelStyles[K]) => {
    setStyles({ ...styles, [key]: value });
  };

  const getElementOffset = (axis: 'top' | 'left'): number => {
    if (!selectedField) return 0;
    if (selectedField === 'barcode') {
      return axis === 'top' ? styles.barcodeOffsetTop : styles.barcodeOffsetLeft;
    }
    const shape = styles.shapes?.find(s => s.id === selectedField);
    if (shape) {
      return axis === 'top' ? shape.top : shape.left;
    }
    const colStyle = styles.columnStyles[selectedField] || { offsetTop: 0, offsetLeft: 0, scaleX: 1 };
    return axis === 'top' ? (colStyle.offsetTop || 0) : (colStyle.offsetLeft || 0);
  };

  const nudgeElement = (axis: 'top' | 'left', amount: number) => {
    if (!selectedField) return;
    
    if (selectedField === 'barcode') {
      const key = axis === 'top' ? 'barcodeOffsetTop' : 'barcodeOffsetLeft';
      updateStyle(key as keyof LabelStyles, Math.round((styles[key as keyof LabelStyles] as number + amount) * 100) / 100);
    } else if (styles.shapes?.some(s => s.id === selectedField)) {
      setStyles({
        ...styles,
        shapes: styles.shapes.map(s => s.id === selectedField 
          ? { ...s, [axis]: Math.round((s[axis] + amount) * 100) / 100 } 
          : s)
      });
    } else {
      const colStyle = styles.columnStyles[selectedField] || { 
        fontSize: 7, 
        isBold: false, 
        alignment: 'center', 
        offsetTop: 0, 
        offsetLeft: 0 
      };
      const key = axis === 'top' ? 'offsetTop' : 'offsetLeft';
      setStyles({
        ...styles,
        columnStyles: {
          ...styles.columnStyles,
          [selectedField]: {
            ...colStyle,
            [key]: Math.round((colStyle[key] + amount) * 100) / 100
          }
        }
      });
    }
  };

  return (
    <div className="flex h-full w-80 flex-col border-l bg-gray-50 p-6 print:hidden overflow-y-auto">
      <div className="mb-8 flex items-center gap-2">
        <div className="rounded-lg bg-indigo-600 p-2 text-white">
          <Sliders size={20} />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-gray-900">Design & Calibrate</h2>
      </div>

      <div className="space-y-8">
        {/* Calibration */}
        <section>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
            <Crosshair size={16} />
            <span>Printer Alignment</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold uppercase text-gray-400">Top Offset</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => nudge('top', -0.01)}
                  className="rounded bg-white p-1.5 shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all text-gray-600"
                >
                  <ChevronUp size={14} />
                </button>
                <span className="w-12 text-center text-xs font-mono font-bold text-gray-700">{calibration.top.toFixed(2)}in</span>
                <button
                  onClick={() => nudge('top', 0.01)}
                  className="rounded bg-white p-1.5 shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all text-gray-600"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold uppercase text-gray-400">Left Offset</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => nudge('left', -0.01)}
                  className="rounded bg-white p-1.5 shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all text-gray-600"
                >
                  <ChevronUp className="-rotate-90" size={14} />
                </button>
                <span className="w-12 text-center text-xs font-mono font-bold text-gray-700">{calibration.left.toFixed(2)}in</span>
                <button
                  onClick={() => nudge('left', 0.01)}
                  className="rounded bg-white p-1.5 shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all text-gray-600"
                >
                  <ChevronDown className="-rotate-90" size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Element Position (Conditional) */}
        {selectedField && (
          <section className="animate-in fade-in slide-in-from-right-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-indigo-700 border-b border-indigo-100 pb-2">
              <Crosshair size={16} />
              <span className="truncate">Position: {selectedField}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold uppercase text-gray-400">Vertical</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => nudgeElement('top', -0.01)}
                    className="rounded bg-white p-1.5 shadow-sm border border-indigo-100 hover:bg-indigo-50 active:scale-90 transition-all text-indigo-600"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <span className="w-12 text-center text-xs font-mono font-bold text-gray-700">
                    {getElementOffset('top').toFixed(2)}
                  </span>
                  <button
                    onClick={() => nudgeElement('top', 0.01)}
                    className="rounded bg-white p-1.5 shadow-sm border border-indigo-100 hover:bg-indigo-50 active:scale-90 transition-all text-indigo-600"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold uppercase text-gray-400">Horizontal</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => nudgeElement('left', -0.01)}
                    className="rounded bg-white p-1.5 shadow-sm border border-indigo-100 hover:bg-indigo-50 active:scale-90 transition-all text-indigo-600"
                  >
                    <ChevronUp className="-rotate-90" size={14} />
                  </button>
                  <span className="w-12 text-center text-xs font-mono font-bold text-gray-700">
                    {getElementOffset('left').toFixed(2)}
                  </span>
                  <button
                    onClick={() => nudgeElement('left', 0.01)}
                    className="rounded bg-white p-1.5 shadow-sm border border-indigo-100 hover:bg-indigo-50 active:scale-90 transition-all text-indigo-600"
                  >
                    <ChevronDown className="-rotate-90" size={14} />
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                if (selectedField === 'barcode') {
                  setStyles({ ...styles, barcodeOffsetTop: 0, barcodeOffsetLeft: 0 });
                } else if (selectedField) {
                  const colStyle = styles.columnStyles[selectedField] || { fontSize: 7, isBold: false, alignment: 'center', offsetTop: 0, offsetLeft: 0 };
                  setStyles({
                    ...styles,
                    columnStyles: { ...styles.columnStyles, [selectedField]: { ...colStyle, offsetTop: 0, offsetLeft: 0 } }
                  });
                }
              }}
              className="mt-4 w-full py-1 text-[9px] font-bold uppercase text-gray-400 hover:text-indigo-600 transition-colors"
            >
              Reset Position
            </button>
            <button 
              onClick={() => {
                const firstId = selectedFields[0];
                if (firstId === 'barcode') {
                   setStyles({ ...styles, barcodeScale: 1 });
                 } else if (firstId) {
                   const colStyle = styles.columnStyles[firstId] || { fontSize: 10, isBold: false, alignment: 'center', offsetTop: 0, offsetLeft: 0, scaleX: 1 };
                   setStyles({
                     ...styles,
                     columnStyles: { ...styles.columnStyles, [firstId]: { ...colStyle, scaleX: 1 } }
                   });
                 }
              }}
              className="w-full py-1 text-[9px] font-bold uppercase text-gray-400 hover:text-indigo-600 transition-colors"
            >
              Reset Scale
            </button>
          </section>
        )}

        {/* Columns & Typography */}
        <section>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 border-b pb-2">
            <Type size={16} />
            <span>Label Columns</span>
          </div>
          <div className="space-y-6">
            {mapping.textFields.map((field) => {
              const colStyle = styles.columnStyles[field] || {
                fontSize: 7,
                isBold: mapping.textFields[0] === field,
                alignment: 'center',
                scaleX: 1,
                visibility: 'always'
              };
              
              const isSelected = selectedFields.includes(field);
              const updateCol = (updates: Partial<typeof colStyle>) => {
                setStyles({
                  ...styles,
                  columnStyles: {
                    ...styles.columnStyles,
                    [field]: { ...colStyle, ...updates }
                  }
                });
              };

              return (
                <div 
                  key={field} 
                  onClick={() => setSelectedFields([field])}
                  className={`space-y-3 rounded-lg border p-3 shadow-sm transition-all duration-500 cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-500 ring-2 ring-indigo-200 bg-white scale-[1.02]' 
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const updated = mapping.textFields.filter(f => f !== field);
                          setMapping({ ...mapping, textFields: updated }); 
                          saveHistory({ ...mapping, textFields: updated }, styles);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove from label"
                      >
                        <Trash2 size={12} />
                      </button>
                      <span className="text-[10px] font-bold text-gray-900 truncate max-w-[100px]">{field}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newShape: LabelShape = {
                            id: `shape-${Date.now()}`,
                            type: 'barcode',
                            barcodeColumn: field,
                            top: 0.5,
                            left: 0.5,
                            width: 1,
                            height: 1,
                            borderStyle: 'solid',
                            borderWidth: 0,
                            borderColor: 'transparent',
                            visibility: 'always'
                          };
                          setStyles({ ...styles, shapes: [...(styles.shapes || []), newShape] });
                        }}
                        className="rounded p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
                        title="Add as Barcode"
                      >
                        <BarcodeIcon size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateCol({ isBold: !colStyle.isBold }); }}
                        className={`rounded p-1 transition-all active:scale-90 ${
                          colStyle.isBold ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <Bold size={14} />
                      </button>
                      <div className="flex items-center bg-gray-50 rounded p-0.5 ml-1">
                        {(['left', 'center', 'right'] as const).map((align) => {
                          const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                          return (
                            <button
                              key={align}
                              onClick={(e) => { e.stopPropagation(); updateCol({ alignment: align }); }}
                              className={`rounded p-1 transition-all active:scale-90 ${
                                colStyle.alignment === align ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              <Icon size={12} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1">
                      <span>Font Size</span>
                      <span className="text-indigo-600">{colStyle.fontSize}pt</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="16"
                      step="0.5"
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      value={colStyle.fontSize || 7}
                      onChange={(e) => updateCol({ fontSize: parseFloat(e.target.value) })}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1">
                      <span>Horizontal Scale</span>
                      <span className="text-indigo-600">{colStyle.scaleX || 1}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="4"
                      step="0.1"
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      value={colStyle.scaleX || 1}
                      onChange={(e) => updateCol({ scaleX: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">
                      Text Case
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] shadow-sm focus:border-indigo-500 focus:outline-none"
                      value={colStyle.textTransform || 'none'}
                      onChange={(e) => updateCol({ textTransform: e.target.value as 'none' | 'uppercase' | 'lowercase' | 'capitalize' })}
                    >
                      <option value="none">Original</option>
                      <option value="uppercase">UPPERCASE</option>
                      <option value="lowercase">lowercase</option>
                      <option value="capitalize">Capitalize</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">
                      Font Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-6 w-10 cursor-pointer rounded border border-gray-300 p-0.5"
                        value={colStyle.color || styles.color || '#000000'}
                        onChange={(e) => updateCol({ color: e.target.value })}
                      />
                      <span className="text-[10px] font-mono text-gray-500 uppercase">
                        {colStyle.color || styles.color || '#000000'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">
                      Visibility Pattern
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] shadow-sm focus:border-indigo-500 focus:outline-none"
                      value={colStyle.visibility || 'always'}
                      onChange={(e) => updateCol({ visibility: e.target.value as VisibilityRule })}
                    >
                      <option value="always">Always</option>
                      <option value="odd-labels">Odd Labels Only</option>
                      <option value="even-labels">Even Labels Only</option>
                      <option value="odd-columns">Odd Columns Only</option>
                      <option value="even-columns">Even Columns Only</option>
                    </select>
                  </div>
                </div>
              );
            })}

            {mapping.textFields.length === 0 && (
              <div className="text-center py-4 text-[10px] text-gray-400 italic">
                Select columns in the left sidebar to style them.
              </div>
            )}
          </div>
        </section>

        {/* Barcode Format & Position */}
        <section 
          onClick={() => setSelectedFields(['barcode'])}
          className={`transition-all duration-500 rounded-xl p-1 cursor-pointer ${
            selectedFields.includes('barcode') ? 'ring-2 ring-indigo-500 bg-indigo-50/20' : ''
          }`}
        >
          <div className="mb-4 flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Maximize size={16} />
              <span>Barcode Config {selectedFields.length === 1 && selectedFields[0] !== 'barcode' && styles.shapes?.find(s => s.id === selectedFields[0])?.type === 'barcode' ? '(Selected Clone)' : '(Primary)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMapping({ ...mapping, barcode: '' })}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Remove barcode"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                Data Source (Column)
              </label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={(selectedFields.length === 1 && selectedFields[0] !== 'barcode' ? styles.shapes?.find(s => s.id === selectedFields[0])?.barcodeColumn : mapping.barcode) || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  const firstId = selectedFields[0];
                  if (selectedFields.length === 1 && firstId !== 'barcode' && styles.shapes?.some(s => s.id === firstId)) {
                    setStyles({
                      ...styles,
                      shapes: styles.shapes.map(s => s.id === firstId ? { ...s, barcodeColumn: newValue } : s)
                    });
                  } else {
                    setMapping({ ...mapping, barcode: newValue });
                  }
                }}
              >
                <option value="">None / Manual</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                Barcode Format
              </label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={styles.barcodeType}
                onChange={(e) => updateStyle('barcodeType', e.target.value as BarcodeType)}
              >
                <option value="CODE128">CODE128 (Standard)</option>
                <option value="EAN13">EAN-13</option>
                <option value="EAN8">EAN-8</option>
                <option value="UPC">UPC-A</option>
                <option value="CODE39">CODE39</option>
                <option value="ITF14">ITF-14</option>
                <option value="MSI">MSI</option>
                <option value="pharmacode">Pharmacode</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                Barcode Position
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['top', 'bottom', 'left', 'right', 'center'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateStyle('barcodePosition', pos)}
                    className={`rounded border py-1.5 text-[9px] font-bold uppercase transition-all active:scale-95 shadow-sm ${
                      styles.barcodePosition === pos
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                Barcode Scale
              </label>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={styles.barcodeScale || 0.8}
                onChange={(e) => updateStyle('barcodeScale', parseFloat(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>Small</span>
                <span className="font-bold text-indigo-600">x{styles.barcodeScale}</span>
                <span>Large</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                Barcode Height (px)
              </label>
              <input
                type="range"
                min="10"
                max="60"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={styles.barcodeHeight || 15}
                onChange={(e) => updateStyle('barcodeHeight', parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>10px</span>
                <span className="font-bold text-indigo-600">{styles.barcodeHeight}px</span>
                <span>60px</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                Barcode Width Scale
              </label>
              <input
                type="range"
                min="0.1"
                max="4"
                step="0.1"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={styles.barcodeScaleX || 1}
                onChange={(e) => updateStyle('barcodeScaleX', parseFloat(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>Narrow</span>
                <span className="font-bold text-indigo-600">x{styles.barcodeScaleX || 1}</span>
                <span>Wide</span>
              </div>
            </div>
            
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                Barcode Visibility
              </label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:outline-none"
                value={styles.barcodeVisibility || 'always'}
                onChange={(e) => updateStyle('barcodeVisibility', e.target.value)}
              >
                <option value="always">Always</option>
                <option value="odd-labels">Odd Labels Only</option>
                <option value="even-labels">Even Labels Only</option>
                <option value="odd-columns">Odd Columns Only</option>
                <option value="even-columns">Even Columns Only</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400">
                Barcode Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-8 w-12 cursor-pointer rounded border border-gray-300 p-0.5"
                  value={styles.barcodeColor || '#000000'}
                  onChange={(e) => updateStyle('barcodeColor', e.target.value)}
                />
                <span className="text-[11px] font-mono text-gray-500 uppercase">
                  {styles.barcodeColor || '#000000'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={styles.showBarcodeValue}
                  onChange={(e) => updateStyle('showBarcodeValue', e.target.checked)}
                />
                <Eye size={14} />
                <span>Show Barcode Text</span>
              </label>

              {styles.showBarcodeValue && (
                <div className="pl-6 space-y-3 border-l-2 border-indigo-100 ml-1.5 py-1">
                  <div>
                    <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">
                      Text Position
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['top', 'bottom', 'left', 'right'] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => updateStyle('barcodeTextPosition', pos)}
                          className={`rounded border py-1 text-[9px] font-bold uppercase transition-all shadow-sm ${
                            (styles.barcodeTextPosition || 'bottom') === pos
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">
                      Font Type
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[10px] shadow-sm focus:border-indigo-500 focus:outline-none"
                      value={styles.barcodeFontFamily || 'monospace'}
                      onChange={(e) => updateStyle('barcodeFontFamily', e.target.value)}
                    >
                      <option value="monospace">Monospace</option>
                      <option value="sans-serif">Sans-Serif</option>
                      <option value="serif">Serif</option>
                      <option value="Arial">Arial</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1">
                      <span>Text Size</span>
                      <span className="text-indigo-600">{styles.barcodeFontSize || 8}pt</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="16"
                      step="0.5"
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      value={styles.barcodeFontSize || 8}
                      onChange={(e) => updateStyle('barcodeFontSize', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateStyle('barcodeTextBold', !styles.barcodeTextBold)}
                      className={`rounded p-1 transition-all active:scale-90 ${
                        styles.barcodeTextBold ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <Bold size={12} />
                    </button>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Bold</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Design Shapes */}
        <section className="border-t pt-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Square size={16} />
              <span>Design Shapes</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  const newShape: LabelShape = {
                    id: `shape-${Date.now()}`,
                    type: 'line',
                    orientation: 'horizontal',
                    top: 0.5,
                    left: 0.5,
                    width: 1.5,
                    height: 0.05,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: '#000000',
                    visibility: 'always'
                  };
                  setStyles({ ...styles, shapes: [...(styles.shapes || []), newShape] });
                }}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase px-1"
              >
                + Line
              </button>
              <button
                onClick={() => {
                  const newShape: LabelShape = {
                    id: `shape-${Date.now()}`,
                    type: 'rectangle',
                    top: 0.5,
                    left: 0.5,
                    width: 1,
                    height: 1,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: '#000000',
                    visibility: 'always'
                  };
                  setStyles({ ...styles, shapes: [...(styles.shapes || []), newShape] });
                }}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase px-1"
              >
                + Box
              </button>
              <button
                onClick={() => {
                  const newShape: LabelShape = {
                    id: `shape-${Date.now()}`,
                    type: 'text',
                    textContent: 'NEW TEXT',
                    top: 0.5,
                    left: 0.5,
                    width: 1.5,
                    height: 0.2,
                    fontSize: 8,
                    isBold: false,
                    textAlign: 'center',
                    fontFamily: 'sans-serif',
                    color: '#000000',
                    borderStyle: 'solid',
                    borderWidth: 0,
                    borderColor: 'transparent',
                    visibility: 'always'
                  };
                  setStyles({ ...styles, shapes: [...(styles.shapes || []), newShape] });
                }}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase px-1"
              >
                + Text
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {styles.shapes?.map((shape) => {
              const isSelected = selectedFields.includes(shape.id);
              const updateShape = (updates: Partial<LabelShape>) => {
                setStyles({
                  ...styles,
                  shapes: styles.shapes.map(s => s.id === shape.id ? { ...s, ...updates } : s)
                });
              };

              return (
                <div 
                  key={shape.id}
                  onClick={() => setSelectedFields([shape.id])}
                  className={`rounded-xl border p-4 transition-all shadow-sm cursor-pointer ${
                    isSelected ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {shape.type === 'line' ? <Minus size={12} /> : shape.type === 'rectangle' ? <Square size={12} /> : shape.type === 'text' ? <Type size={12} /> : <BarcodeIcon size={12} />}
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">
                        {shape.type === 'line' ? 'Separator' : shape.type === 'rectangle' ? 'Box' : shape.type === 'text' ? 'Static Text' : 'Barcode Clone'}
                      </span>
                    </div>
                    <button 
                      onClick={() => setStyles({ ...styles, shapes: styles.shapes.filter(s => s.id !== shape.id) })}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {shape.type === 'line' && (
                      <div className="col-span-2">
                        <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">Orientation</label>
                        <div className="flex gap-1">
                          {(['horizontal', 'vertical'] as const).map(o => (
                            <button
                              key={o}
                              onClick={() => {
                                const updates: Partial<LabelShape> = { 
                                  orientation: o,
                                  // Swap width/height for better UX when switching
                                  width: o === 'horizontal' ? 1.5 : 0.05,
                                  height: o === 'horizontal' ? 0.05 : 1.5
                                };
                                updateShape(updates);
                              }}
                              className={`flex-1 rounded border py-1 text-[9px] font-bold uppercase transition-all ${
                                (shape.orientation || 'horizontal') === o
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {o}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">Style</label>
                      <select 
                        className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[10px] shadow-sm focus:border-indigo-500 outline-none"
                        value={shape.borderStyle}
                        onChange={(e) => updateShape({ borderStyle: e.target.value as 'solid' | 'dotted' | 'dashed' })}
                      >
                        <option value="solid">Solid</option>
                        <option value="dotted">Dotted</option>
                        <option value="dashed">Dashed</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">Thick (pt)</label>
                      <input 
                        type="number" 
                        step="0.5" 
                        min="0.5"
                        className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[10px] shadow-sm focus:border-indigo-500 outline-none"
                        value={shape.borderWidth || 1}
                        onChange={(e) => updateShape({ borderWidth: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">Visibility Pattern</label>
                      <select 
                        className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[10px] shadow-sm focus:border-indigo-500 outline-none"
                        value={shape.visibility}
                        onChange={(e) => updateShape({ visibility: e.target.value as VisibilityRule })}
                      >
                        <option value="always">Always</option>
                        <option value="odd-labels">Odd Labels Only</option>
                        <option value="even-labels">Even Labels Only</option>
                        <option value="odd-columns">Odd Columns Only</option>
                        <option value="even-columns">Even Columns Only</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">
                        {shape.type === 'text' || shape.type === 'barcode' ? 'Color' : 'Border Color'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          className="h-6 w-10 cursor-pointer rounded border border-gray-300 p-0.5"
                          value={(shape.type === 'text' || shape.type === 'barcode' ? shape.color : shape.borderColor) || '#000000'}
                          onChange={(e) => {
                            if (shape.type === 'text' || shape.type === 'barcode') {
                              updateShape({ color: e.target.value });
                            } else {
                              updateShape({ borderColor: e.target.value });
                            }
                          }}
                        />
                        <span className="text-[10px] font-mono text-gray-500 uppercase">
                          {(shape.type === 'text' || shape.type === 'barcode' ? shape.color : shape.borderColor) || '#000000'}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 border-t pt-2 mt-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1">
                            <span>Top Pos</span>
                            <span className="text-indigo-600">{shape.top.toFixed(2)}in</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max={template.labelHeight} 
                            step="0.01"
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            value={shape.top || 0}
                            onChange={(e) => updateShape({ top: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1">
                            <span>Left Pos</span>
                            <span className="text-indigo-600">{shape.left.toFixed(2)}in</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max={template.labelWidth} 
                            step="0.01"
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            value={shape.left || 0}
                            onChange={(e) => updateShape({ left: parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>

                      {shape.type !== 'barcode' && shape.type !== 'text' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1">
                              <span>Width</span>
                              <span className="text-indigo-600">{shape.width.toFixed(2)}in</span>
                            </div>
                            <input 
                              type="range" 
                              min="0.05" 
                              max={template.labelWidth} 
                              step="0.01"
                              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              value={shape.width || 0.5}
                              onChange={(e) => updateShape({ width: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1">
                              <span>Height</span>
                              <span className="text-indigo-600">{shape.height.toFixed(2)}in</span>
                            </div>
                            <input 
                              type="range" 
                              min="0.01" 
                              max={template.labelHeight} 
                              step="0.01"
                              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              value={shape.height || 0.5}
                              onChange={(e) => updateShape({ height: parseFloat(e.target.value) })}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {shape.type === 'text' && (
                      <>
                        <div className="col-span-2">
                          <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">Source Column (Optional)</label>
                          <select 
                            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[10px] shadow-sm focus:border-indigo-500 outline-none"
                            value={shape.textColumn || ''}
                            onChange={(e) => updateShape({ textColumn: e.target.value || undefined })}
                          >
                            <option value="">Static Text (Manual)</option>
                            {headers.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">Content</label>
                          <textarea 
                            rows={2}
                            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] shadow-sm focus:border-indigo-500 outline-none resize-none"
                            value={shape.textContent || ''}
                            onChange={(e) => updateShape({ textContent: e.target.value })}
                            placeholder="Type text here..."
                            disabled={!!shape.textColumn}
                          />
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-1">
                              <span>Size</span>
                              <span className="text-indigo-600">{shape.fontSize || 8}pt</span>
                            </div>
                            <input 
                              type="range" 
                              min="4" 
                              max="48" 
                              step="0.5"
                              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              value={shape.fontSize || 8}
                              onChange={(e) => updateShape({ fontSize: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">Font</label>
                            <select 
                              className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[10px] shadow-sm focus:border-indigo-500 outline-none"
                              value={shape.fontFamily || 'sans-serif'}
                              onChange={(e) => updateShape({ fontFamily: e.target.value })}
                            >
                              <option value="sans-serif">Sans-Serif</option>
                              <option value="serif">Serif</option>
                              <option value="monospace">Monospace</option>
                              <option value="Arial">Arial</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="Courier New">Courier New</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">Alignment</label>
                          <div className="flex gap-1">
                            {(['left', 'center', 'right'] as const).map(align => (
                              <button
                                key={align}
                                onClick={() => updateShape({ textAlign: align })}
                                className={`flex-1 rounded border py-1 text-[9px] font-bold uppercase transition-all ${
                                  (shape.textAlign || 'center') === align
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {align[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">Bold</label>
                          <button
                            onClick={() => updateShape({ isBold: !shape.isBold })}
                            className={`w-full rounded border py-1 text-[9px] font-bold uppercase transition-all ${
                              shape.isBold
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            Bold
                          </button>
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-[9px] font-bold uppercase text-gray-400">Text Case</label>
                          <select 
                            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-[10px] shadow-sm focus:border-indigo-500 outline-none"
                            value={shape.textTransform || 'none'}
                            onChange={(e) => updateShape({ textTransform: e.target.value as 'none' | 'uppercase' | 'lowercase' | 'capitalize' })}
                          >
                            <option value="none">Original</option>
                            <option value="uppercase">UPPERCASE</option>
                            <option value="lowercase">lowercase</option>
                            <option value="capitalize">Capitalize</option>
                          </select>
                        </div>
                      </>
                    )}
                    </div>
                  </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DesignSidebar;
