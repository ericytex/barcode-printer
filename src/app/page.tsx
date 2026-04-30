'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DesignSidebar from '@/components/DesignSidebar';
import Sheet from '@/components/Sheet';
import Label from '@/components/Label';
import { Calibration, LabelData, Mapping, LabelStyles, SavedTemplate } from '@/types';
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
    columnStyles: {},
    shapes: [],
  });
  const [selectedField, setSelectedField] = useState<string | 'barcode' | null>(null);

  const handleSetStyles = (s: LabelStyles) => {
    startTransition(() => {
      setStyles(s);
    });
  };

  const handleUpdateOffsets = (field: string | 'barcode', top: number, left: number) => {
    setStyles(prev => {
      // 1. Check if it's a Shape
      if ((prev.shapes || []).some(s => s.id === field)) {
        return {
          ...prev,
          shapes: prev.shapes.map(s => s.id === field ? { ...s, top, left } : s)
        };
      }

      // 2. Check if it's the Barcode
      if (field === 'barcode') {
        return {
          ...prev,
          barcodeOffsetTop: top,
          barcodeOffsetLeft: left
        };
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
          [field]: { ...colStyle, offsetTop: top, offsetLeft: left }
        }
      };
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
          shapes: shapes.map(s => s.id === field ? { 
            ...s, 
            width: !isVerticalScaling ? s.width * (factor / 1) : s.width,
            height: isVerticalScaling ? s.height * (factor / 1) : s.height
          } : s)
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
  const [isLoaded, setIsLoaded] = useState(false);

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
    const saved = localStorage.getItem('avery-printer-user-templates');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setSavedTemplates(JSON.parse(saved));
  }, []);

  const handleSaveTemplate = (name: string) => {
    const newTemplate: SavedTemplate = {
      name,
      timestamp: Date.now(),
      design: { template, mapping, styles, calibration }
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('avery-printer-user-templates', JSON.stringify(updated));
  };

  const handleLoadTemplate = (t: SavedTemplate) => {
    setTemplate(t.design.template);
    setMapping(t.design.mapping);
    setStyles(t.design.styles);
    setCalibration(t.design.calibration);
  };

  const handleDeleteTemplate = (index: number) => {
    const updated = savedTemplates.filter((_, i) => i !== index);
    setSavedTemplates(updated);
    localStorage.setItem('avery-printer-user-templates', JSON.stringify(updated));
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
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
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
            {activeTab === 'preview' ? (
              pages.map((pageData, index) => {
                const shouldRenderOnScreen = isPrinting || previewLimit === 'all' || index < previewLimit;
                if (!shouldRenderOnScreen) return (
                  <div key={index} className="hidden print:block h-[11in]">
                    {/* Placeholder to keep page count accurate for print if needed, 
                        but usually we just render the real sheet */}
                    <Sheet
                      pageIndex={index}
                      labels={pageData}
                      template={template}
                      mapping={mapping}
                      styles={styles}
                      calibration={calibration}
                      selectedField={selectedField}
                      setSelectedField={setSelectedField}
                      onUpdateOffsets={handleUpdateOffsets}
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
                    selectedField={selectedField}
                    setSelectedField={setSelectedField}
                    onUpdateOffsets={handleUpdateOffsets}
                    onUpdateScale={handleUpdateScale}
                  />
                );
              })
            ) : (
              <div 
                className="flex h-full items-center justify-center min-h-[600px]"
                onMouseDown={() => setSelectedField(null)}
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
                    selectedField={selectedField}
                    setSelectedField={setSelectedField}
                    onUpdateOffsets={handleUpdateOffsets}
                    onUpdateScale={handleUpdateScale}
                  />
                  <div className="mt-8 text-center text-[9px] text-gray-300 italic">
                    Actual physical size: {template.labelWidth}&quot; x {template.labelHeight}&quot;
                  </div>
                </div>
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
        selectedField={selectedField}
      />
    </main>
  );
}
