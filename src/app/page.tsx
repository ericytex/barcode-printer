'use client';

import { useState, useMemo, useTransition, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import DesignSidebar from '@/components/DesignSidebar';
import Sheet from '@/components/Sheet';
import Label from '@/components/Label';
import { Calibration, LabelData, Mapping, LabelStyles, LabelShape, SavedTemplate } from '@/types';
import { TEMPLATES } from '@/constants/templates';

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [isPrinting, setIsPrinting] = useState(false);

  const [template, setTemplate] = useState(TEMPLATES['5160']);
  const [data, setData] = useState<LabelData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>({
    textFields: [],
    barcode: '',
  });
  const [calibration, setCalibration] = useState<Calibration>({
    top: 0,
    left: 0,
  });
  
  const handleSetCalibration = (c: Calibration) => {
    startTransition(() => {
      setCalibration(c);
    });
  };

  const [styles, setStyles] = useState<LabelStyles>({
    fontSizeHeader: 7.5,
    fontSizeText: 6.5,
    barcodeScale: 0.8,
    barcodeHeight: 15,
    showBarcodeValue: false,
    barcodeFontSize: 8,
    barcodeTextBold: false,
    barcodeFontFamily: 'monospace',
    barcodeTextPosition: 'bottom',
    barcodeType: 'CODE128',
    barcodePosition: 'bottom',
    barcodeOffsetTop: 0,
    barcodeOffsetLeft: 0,
    barcodeScaleX: 1,
    barcodeVisibility: 'always',
    color: '#000000',
    barcodeColor: '#000000',
    columnStyles: {},
    shapes: [],
  });
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<Partial<LabelShape>[] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // History State
  const [history, setHistory] = useState<{ mapping: Mapping; styles: LabelStyles }[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);

  const saveHistory = useCallback((m: Mapping, s: LabelStyles) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyPointer + 1);
      const lastEntry = newHistory[newHistory.length - 1];
      
      // Don't save if state hasn't changed
      if (lastEntry && 
          JSON.stringify(lastEntry.mapping) === JSON.stringify(m) && 
          JSON.stringify(lastEntry.styles) === JSON.stringify(s)) {
        return prev;
      }

      const updated = [...newHistory, { mapping: m, styles: s }];
      if (updated.length > 50) updated.shift();
      setHistoryPointer(updated.length - 1);
      return updated;
    });
  }, [historyPointer]);

  // Initial history snapshot
  const hasInitializedHistory = useRef(false);
  useEffect(() => {
    if (!hasInitializedHistory.current && isLoaded) {
      setHistory([{ mapping, styles }]);
      setHistoryPointer(0);
      hasInitializedHistory.current = true;
    }
  }, [isLoaded, mapping, styles]);

  const undo = useCallback(() => {
    if (historyPointer > 0) {
      const prev = history[historyPointer - 1];
      setMapping(prev.mapping);
      setStyles(prev.styles);
      setHistoryPointer(historyPointer - 1);
    }
  }, [history, historyPointer]);

  const redo = useCallback(() => {
    if (historyPointer < history.length - 1) {
      const next = history[historyPointer + 1];
      setMapping(next.mapping);
      setStyles(next.styles);
      setHistoryPointer(historyPointer + 1);
    }
  }, [history, historyPointer]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);
      if (isInput) return;

      // UNDO / REDO
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        redo();
        e.preventDefault();
      }

      // SELECT ALL (Cmd/Ctrl + A)
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        const allIds = [
          ...(mapping.barcode ? ['barcode'] : []),
          ...(mapping.textFields || []),
          ...(styles.shapes || []).map(s => s.id)
        ];
        setSelectedFields(allIds);
      }

      // DELETE / BACKSPACE
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedFields.length === 0) return;
        
        setMapping(prev => ({
          ...prev,
          barcode: selectedFields.includes('barcode') ? '' : prev.barcode,
          textFields: (prev.textFields || []).filter(f => !selectedFields.includes(f))
        }));
        
        setStyles(prev => ({
          ...prev,
          shapes: (prev.shapes || []).filter(s => !selectedFields.includes(s.id))
        }));
        
        setSelectedFields([]);
        saveHistory(mapping, styles);
      }

      // COPY (Cmd/Ctrl + C)
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (selectedFields.length === 0) return;
        
        const configs: Partial<LabelShape>[] = [];
        
        selectedFields.forEach(id => {
          if (id === 'barcode') {
            configs.push({
              type: 'barcode',
              barcodeColumn: mapping.barcode || undefined,
              top: styles.barcodeOffsetTop,
              left: styles.barcodeOffsetLeft,
              width: 1.5,
              height: 0.5,
              barcodeScale: styles.barcodeScale,
              barcodeScaleX: styles.barcodeScaleX || 1,
              barcodeHeight: styles.barcodeHeight,
              fontSize: styles.barcodeFontSize || 8,
              color: styles.barcodeColor || '#000000',
              borderStyle: 'solid',
              borderWidth: 0,
              borderColor: 'transparent',
              visibility: styles.barcodeVisibility
            });
          } else if (id.startsWith('shape-')) {
            const shape = (styles.shapes || []).find(s => s.id === id);
            if (shape) configs.push({ ...shape });
          } else {
            // Mapped text field
            const isTextField = (mapping.textFields || []).includes(id);
            const colStyle = styles.columnStyles?.[id];
            if (isTextField && colStyle) {
              configs.push({
                type: 'text',
                textColumn: id,
                top: colStyle.offsetTop || 0,
                left: colStyle.offsetLeft || 0,
                fontSize: colStyle.fontSize || 7,
                isBold: colStyle.isBold || false,
                textAlign: colStyle.alignment || 'center',
                textTransform: colStyle.textTransform || 'none',
                color: colStyle.color || styles.color || '#000000',
                width: 1.5,
                height: 0.2,
                borderStyle: 'solid',
                borderWidth: 0,
                borderColor: 'transparent',
                visibility: colStyle.visibility || 'always'
              });
            }
          }
        });

        if (configs.length > 0) {
          setClipboard(configs);
          e.preventDefault();
        }
      }

      // PASTE (Cmd/Ctrl + V)
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        if (!clipboard) return;

        const newShapes: LabelShape[] = clipboard.map((config, idx) => ({
          ...config,
          id: `shape-${Date.now()}-${idx}`,
          top: (config.top || 0), // No offset to maintain exact location
          left: (config.left || 0),
        } as LabelShape));

        setStyles(prev => {
          const next = {
            ...prev,
            shapes: [...(prev.shapes || []), ...newShapes]
          };
          saveHistory(mapping, next);
          return next;
        });
        setSelectedFields(newShapes.map(s => s.id));
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFields, clipboard, mapping, styles, undo, redo, saveHistory]);

  const handleSetStyles = (s: LabelStyles) => {
    startTransition(() => {
      setStyles(s);
    });
  };

  const handleMoveFields = (ids: string[], dt: number, dl: number) => {
    // 1. Update Mapping (for barcode source if needed - actually mapping doesn't have offset)
    
    // 2. Update Styles in a single batch
    setStyles(prev => {
      const newStyles = { ...prev };
      
      // Update Primary Barcode
      if (ids.includes('barcode')) {
        newStyles.barcodeOffsetTop = (newStyles.barcodeOffsetTop || 0) + dt;
        newStyles.barcodeOffsetLeft = (newStyles.barcodeOffsetLeft || 0) + dl;
      }
      
      // Update Shapes
      const shapeIds = ids.filter(id => id.startsWith('shape-'));
      if (shapeIds.length > 0) {
        newStyles.shapes = (newStyles.shapes || []).map(s => 
          shapeIds.includes(s.id) ? { ...s, top: s.top + dt, left: s.left + dl } : s
        );
      }
      
      // Update Mapped Text Fields
      const textIds = ids.filter(id => !id.startsWith('shape-') && id !== 'barcode');
      if (textIds.length > 0) {
        const newColStyles = { ...(newStyles.columnStyles || {}) };
        textIds.forEach(id => {
          const current = newColStyles[id] || { offsetTop: 0, offsetLeft: 0 };
          newColStyles[id] = {
            ...current,
            offsetTop: (current.offsetTop || 0) + dt,
            offsetLeft: (current.offsetLeft || 0) + dl
          };
        });
        newStyles.columnStyles = newColStyles;
      }
      
      return newStyles;
    });
  };

  const handleUpdateScale = (field: string | 'barcode', factor: number, side?: 'left' | 'right' | 'top' | 'bottom') => {
    const newScale = Math.max(0.1, Math.round(factor * 100) / 100);
    
    setStyles(prev => {
      // 1. Check if it's a Shape
      const shapes = prev.shapes || [];
      const shape = shapes.find(s => s.id === field);
      if (shape) {
        const isVerticalScaling = side === 'top' || side === 'bottom';
        return {
          ...prev,
          shapes: shapes.map(s => {
            if (s.id !== field) return s;
            
            const next = { ...s };
            if (isVerticalScaling) {
              next.height = s.height * (factor / 1);
              if (s.type === 'barcode') {
                next.barcodeHeight = (s.barcodeHeight || prev.barcodeHeight) * (factor / 1);
              }
            } else {
              next.width = s.width * (factor / 1);
              if (s.type === 'barcode') {
                next.barcodeScaleX = (s.barcodeScaleX || prev.barcodeScaleX || 1) * (factor / 1);
              }
            }
            return next;
          })
        };
      }

      // 2. Check if it's the Barcode
      if (field === 'barcode') {
        return { ...prev, barcodeScaleX: newScale };
      }
      
      // 3. It's a Text Column
      const colStyle = prev.columnStyles[field] || { 
        fontSize: 7, 
        isBold: false, 
        alignment: 'center', 
        offsetTop: 0, 
        offsetLeft: 0,
        scaleX: 1,
        visibility: 'always'
      };

      return {
        ...prev,
        columnStyles: {
          ...prev.columnStyles,
          [field]: { ...colStyle, scaleX: newScale }
        }
      };
    });
  };

  const [activeTab, setActiveTab] = useState<'preview' | 'design'>('preview');
  const [globalCopies, setGlobalCopies] = useState(1);
  const [quantityColumn, setQuantityColumn] = useState<string>('');
  const [previewLimit, setPreviewLimit] = useState<number | 'all'>('all');

  // --- Persistence Logic ---
  
  // Load state on mount (Client-only)
  useEffect(() => {
    try {
      const savedDesign = localStorage.getItem('avery-printer-design');
      const savedData = localStorage.getItem('avery-printer-data');

      if (savedDesign) {
        const parsed = JSON.parse(savedDesign);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.template) setTemplate(parsed.template);
        if (parsed.mapping) setMapping(parsed.mapping);
        if (parsed.styles) setStyles(parsed.styles);
        if (parsed.calibration) setCalibration(parsed.calibration);
      }

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
        if (parsedData.length > 0) {
          setHeaders(Object.keys(parsedData[0]));
        }
      }
    } catch (e) {
      console.warn('Persistence load failed', e);
    }
    
    // Using a microtask or small delay to mark as loaded 
    // to avoid cascading render lint warning in some environments,
    // though the real fix is batched updates in React 18.
    setIsLoaded(true);
  }, []);

  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    fetch('/api/templates')
      .then(res => res.json())
      .then((data: SavedTemplate[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedTemplates(data);
        } else {
          // If no templates exist on disk, attempt to recover the last autosaved design
          const lastDesign = localStorage.getItem('avery-printer-design');
          if (lastDesign) {
            try {
              const parsedDesign = JSON.parse(lastDesign);
              if (parsedDesign.template && parsedDesign.styles) {
                const recovered = {
                  name: 'Recovered Design',
                  timestamp: Date.now(),
                  design: parsedDesign
                };
                setSavedTemplates([recovered]);
                // Save it to the backend so it's persisted on disk
                fetch('/api/templates', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(recovered),
                }).catch(e => console.warn('Failed to auto-save recovered design', e));
              }
            } catch (e) {
              console.warn('Failed to parse autosave for recovery', e);
            }
          }
        }
      })
      .catch(e => {
        console.warn('Failed to fetch templates from API', e);
      });
  }, []);

  const handleSaveTemplate = async (name: string) => {
    const newTemplate: SavedTemplate = {
      name,
      timestamp: Date.now(),
      design: { template, mapping, styles, calibration }
    };
    
    // Optimistic UI update
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });
    } catch (e) {
      console.error('Failed to save template to disk', e);
      setSavedTemplates(savedTemplates); // revert on failure
      alert('Failed to save template to disk. Please try again.');
    }
  };

  const handleLoadTemplate = (t: SavedTemplate) => {
    setTemplate(t.design.template);
    setMapping(t.design.mapping);
    setStyles(t.design.styles);
    setCalibration(t.design.calibration);
    saveHistory(t.design.mapping, t.design.styles);
  };

  const handleDeleteTemplate = async (index: number) => {
    // Optimistic UI update
    const updated = savedTemplates.filter((_, i) => i !== index);
    setSavedTemplates(updated);
    
    try {
      await fetch(`/api/templates?index=${index}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete template from disk', e);
      setSavedTemplates(savedTemplates); // revert on failure
      alert('Failed to delete template from disk. Please try again.');
    }
  };

  // Save design state
  useEffect(() => {
    if (!isLoaded) return;
    const designState = { template, mapping, styles, calibration };
    localStorage.setItem('avery-printer-design', JSON.stringify(designState));
  }, [template, mapping, styles, calibration, isLoaded]);

  // Save data state separately
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('avery-printer-data', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save data to localStorage', e);
    }
  }, [data, isLoaded]);

  const handlePrint = () => {
    setIsPrinting(true);
    const originalTitle = document.title;
    document.title = ''; // Clear title to remove browser headers
    
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
      setIsPrinting(false);
    }, 500);
  };

  // Monitor print events for system print dialog (Cmd+P)
  useEffect(() => {
    const beforePrint = () => setIsPrinting(true);
    const afterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  // Chunk data into pages
  const pages = useMemo(() => {
    const itemsPerPage = template.labelsPerPage;
    
    let displayData: LabelData[] = [];
    
    if (data.length > 0) {
      data.forEach(item => {
        // Skip rows that are completely empty
        const hasData = Object.values(item).some(val => val && val.toString().trim() !== '');
        if (!hasData) return;

        const qtyStr = quantityColumn ? item[quantityColumn] : null;
        const qty = qtyStr ? parseInt(qtyStr) || globalCopies : globalCopies;
        for (let i = 0; i < qty; i++) {
          displayData.push(item);
        }
      });
    } else {
      // If no data, show a placeholder page with empty labels
      displayData = Array.from({ length: itemsPerPage }, () => ({} as LabelData));
    }

    const chunks = [];
    for (let i = 0; i < displayData.length; i += itemsPerPage) {
      const chunk = displayData.slice(i, i + itemsPerPage);
      // Fill the last page with empty labels if needed to maintain grid layout
      if (chunk.length < itemsPerPage) {
        const remaining = itemsPerPage - chunk.length;
        const filler = Array.from({ length: remaining }, () => ({} as LabelData));
        chunks.push([...chunk, ...filler]);
      } else {
        chunks.push(chunk);
      }
    }
    return chunks;
  }, [data, template, globalCopies, quantityColumn]);

  return (
    <main className="flex h-screen overflow-hidden bg-gray-50 print:block print:h-auto print:overflow-visible">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: ${template.id === '10008404' ? '4.0625in 5in' : `${template.pageWidth || 8.5}in ${template.pageHeight || 11}in`} !important;
            margin: 0 !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: ${template.pageWidth || 8.5}in !important;
            height: ${template.pageHeight || 11}in !important;
            overflow: hidden !important;
          }
          .print-container {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: ${template.pageWidth || 8.5}in !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }
        }
      `}} />

      <Sidebar
        template={template}
        setTemplate={setTemplate}
        mapping={mapping}
        setMapping={setMapping}
        headers={headers}
        setHeaders={setHeaders}
        setData={setData}
        onPrint={handlePrint}
        globalCopies={globalCopies}
        setGlobalCopies={setGlobalCopies}
        quantityColumn={quantityColumn}
        setQuantityColumn={setQuantityColumn}
        isPending={isPending}
        savedTemplates={savedTemplates}
        onSaveTemplate={handleSaveTemplate}
        onLoadTemplate={handleLoadTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        saveHistory={saveHistory}
        styles={styles}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-gray-200/50 print:bg-white print:block print:overflow-visible">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b bg-white px-8 py-3 print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-sm font-bold transition-colors rounded-md ${
                activeTab === 'preview' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sheet Preview
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`px-4 py-2 text-sm font-bold transition-colors rounded-md ${
                activeTab === 'design' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Design Mode
            </button>
          </div>
          {activeTab === 'preview' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Show:</label>
              <select
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                value={previewLimit}
                onChange={(e) => setPreviewLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              >
                <option value="all">All Pages</option>
                <option value="1">1 Page</option>
                <option value="2">2 Pages</option>
                <option value="5">5 Pages</option>
                <option value="10">10 Pages</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto p-12 print:p-0 print:overflow-visible print:block">
          {!isLoaded ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">Initialising Workspace</p>
              </div>
            </div>
          ) : (
            <div className="print-container">
            {(activeTab === 'preview' || isPrinting) ? (
              pages.map((pageData, index) => {
                const shouldRenderOnScreen = isPrinting || previewLimit === 'all' || index < previewLimit;
                if (!shouldRenderOnScreen && !isPrinting) return (
                  <div key={index} className="hidden print:block">
                    <Sheet
                      pageIndex={index}
                      labels={pageData}
                      template={template}
                      mapping={mapping}
                      styles={styles}
                      calibration={calibration}
                      selectedFields={selectedFields}
                      setSelectedFields={setSelectedFields}
                      onMoveFields={handleMoveFields}
                      onDragEnd={() => saveHistory(mapping, styles)}
                      onUpdateScale={handleUpdateScale}
                    />
                  </div>
                );

                return (
                  <Sheet
                    key={`${template.id}-${index}`}
                    pageIndex={index}
                    labels={pageData}
                    template={template}
                    mapping={mapping}
                    styles={styles}
                    calibration={calibration}
                    selectedFields={selectedFields}
                    setSelectedFields={setSelectedFields}
                    onMoveFields={handleMoveFields}
                    onDragEnd={() => saveHistory(mapping, styles)}
                    onUpdateScale={handleUpdateScale}
                  />
                );
              })
            ) : (
              <div 
                className="flex h-full items-center justify-center min-h-[600px] print:hidden"
                onMouseDown={() => setSelectedFields([])}
              >
                <div 
                  className="bg-gray-100/30 p-16 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-200 scale-150"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="mb-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-4">
                    Master Design Preview
                  </div>
                  <Label
                    data={data[0] || {}}
                    template={template}
                    mapping={mapping}
                    styles={styles}
                    calibration={calibration}
                    selectedFields={selectedFields}
                    setSelectedFields={setSelectedFields}
                    onMoveFields={handleMoveFields}
                    onDragEnd={() => saveHistory(mapping, styles)}
                    onUpdateScale={handleUpdateScale}
                  />
                  <div className="mt-8 text-center text-[9px] text-gray-300 italic">
                    Actual physical size: {template.labelWidth}&quot; x {template.labelHeight}&quot;
                  </div>
                </div>
              </div>
            )}
            
            {/* Hidden print-only container for when in design mode but printing */}
            {activeTab === 'design' && !isPrinting && (
              <div className="hidden print:block">
                {pages.map((pageData, index) => (
                  <Sheet
                    key={`print-${template.id}-${index}`}
                    pageIndex={index}
                    labels={pageData}
                    template={template}
                    mapping={mapping}
                    styles={styles}
                    calibration={calibration}
                    selectedFields={selectedFields}
                    setSelectedFields={setSelectedFields}
                    onMoveFields={handleMoveFields}
                    onDragEnd={() => saveHistory(mapping, styles)}
                    onUpdateScale={handleUpdateScale}
                  />
                ))}
              </div>
            )}
            
            {data.length === 0 && activeTab === 'preview' && (
              <div className="pointer-events-none fixed bottom-12 right-[340px] max-w-xs rounded-xl bg-white p-6 shadow-2xl print:hidden">
                <h3 className="mb-2 font-bold text-gray-900">Get Started</h3>
                <p className="text-sm text-gray-600">
                  Upload a CSV file in the sidebar to populate your labels. 
                  Map your columns to the header, subtext, and barcode fields.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

      <DesignSidebar
        styles={styles}
        setStyles={handleSetStyles}
        calibration={calibration}
        setCalibration={handleSetCalibration}
        mapping={mapping}
        setMapping={setMapping}
        headers={headers}
        template={template}
        selectedFields={selectedFields}
        setSelectedFields={setSelectedFields}
        saveHistory={saveHistory}
      />
    </main>
  );
}
