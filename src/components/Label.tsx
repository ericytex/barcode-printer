'use client';

import React, { memo } from 'react';
import Barcode from 'react-barcode';
import { LabelData, LabelTemplate, Mapping, LabelStyles } from '@/types';

interface LabelProps {
  data: LabelData;
  template: LabelTemplate;
  mapping: Mapping;
  styles: LabelStyles;
  selectedField: string | 'barcode' | null;
  setSelectedField: (f: string | 'barcode' | null) => void;
  onUpdateOffsets: (field: string | 'barcode', top: number, left: number) => void;
  onUpdateScale: (field: string | 'barcode', factor: number, side?: 'left' | 'right' | 'top' | 'bottom') => void;
  labelIndex: number;
  labelColumn: number;
}

const Label: React.FC<LabelProps> = ({ 
  data, 
  template, 
  mapping, 
  styles,
  selectedField,
  setSelectedField,
  onUpdateOffsets,
  onUpdateScale,
  labelIndex,
  labelColumn
}) => {
  const shouldShowComponent = (rule: string | undefined) => {
    if (!rule || rule === 'always') return true;
    if (rule === 'odd-labels') return (labelIndex + 1) % 2 !== 0;
    if (rule === 'even-labels') return (labelIndex + 1) % 2 === 0;
    if (rule === 'odd-columns') return (labelColumn + 1) % 2 !== 0;
    if (rule === 'even-columns') return (labelColumn + 1) % 2 === 0;
    return true;
  };

  const dragStartPos = React.useRef({ x: 0, y: 0 });
  const initialOffsets = React.useRef({ top: 0, left: 0 });
  const initialScale = React.useRef(1);

  const handleScaleStart = (e: React.MouseEvent, field: string | 'barcode', side: 'left' | 'right' | 'top' | 'bottom') => {
    e.preventDefault();
    e.stopPropagation();
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    if (field === 'barcode') {
      initialScale.current = styles.barcodeScaleX || 1;
    } else {
      const shape = (styles.shapes || []).find(s => s.id === field);
      if (shape) {
        initialScale.current = 1; // For shapes, we treat scale as a delta factor starting from 1
      } else {
        const colStyle = styles.columnStyles[field] || { scaleX: 1 };
        initialScale.current = colStyle.scaleX || 1;
      }
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - dragStartPos.current.x) / 50; 
      const dy = (moveEvent.clientY - dragStartPos.current.y) / 50;
      
      let factor = 1;
      if (side === 'right') factor = 1 + dx;
      else if (side === 'left') factor = 1 - dx;
      else if (side === 'bottom') factor = 1 + dy;
      else if (side === 'top') factor = 1 - dy;

      const newScale = Math.max(0.1, initialScale.current * factor);
      onUpdateScale(field, newScale, side);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent, field: string | 'barcode') => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedField(field);
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    if (field === 'barcode') {
      initialOffsets.current = { top: styles.barcodeOffsetTop, left: styles.barcodeOffsetLeft };
    } else {
      const colStyle = styles.columnStyles[field] || { offsetTop: 0, offsetLeft: 0 };
      initialOffsets.current = { top: colStyle.offsetTop || 0, left: colStyle.offsetLeft || 0 };
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - dragStartPos.current.x) / 96; // Approximate pixels to inches
      const dy = (moveEvent.clientY - dragStartPos.current.y) / 96;
      
      onUpdateOffsets(
        field, 
        Math.round((initialOffsets.current.top + dy) * 100) / 100,
        Math.round((initialOffsets.current.left + dx) * 100) / 100
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  const barcodeValue = data[mapping.barcode] || (mapping.barcode ? 'SAMPLE-123' : '');
  const textLines = mapping.textFields.map(field => ({ 
    name: field, 
    value: data[field] || `[${field}]` 
  }));

  const flexDir = {
    top: 'flex-col-reverse',
    bottom: 'flex-col',
    left: 'flex-row-reverse space-x-reverse space-x-1',
    right: 'flex-row space-x-1',
    center: 'flex-col'
  }[styles.barcodePosition];

  const isVertical = styles.barcodePosition === 'top' || styles.barcodePosition === 'bottom' || styles.barcodePosition === 'center';
  const isCenter = styles.barcodePosition === 'center';

  const renderLine = (field: string) => {
    const colStyle = styles.columnStyles[field] || {
      fontSize: 7,
      isBold: mapping.textFields[0] === field,
      alignment: 'center',
      offsetTop: 0,
      offsetLeft: 0,
      scaleX: 1,
      visibility: 'always'
    };

    const isVisible = shouldShowComponent(colStyle.visibility);
    const isSelected = selectedField === field;

    return (
      <div 
        key={field}
        className={`flex w-full ${
          colStyle.alignment === 'center' ? 'justify-center' : 
          colStyle.alignment === 'right' ? 'justify-end' : 'justify-start'
        } ${!isVisible ? 'opacity-0 pointer-events-none' : ''}`}
      >
        <div 
          onMouseDown={(e) => handleMouseDown(e, field)}
          style={{
            fontSize: `${colStyle.fontSize}pt`,
            textAlign: colStyle.alignment as 'left' | 'center' | 'right',
            transform: `translate(${colStyle.offsetLeft}in, ${colStyle.offsetTop}in) scaleX(${colStyle.scaleX || 1})`
          }}
          className={`w-fit leading-[1.1] uppercase tracking-tight cursor-move transition-shadow px-0 select-none relative overflow-visible
            ${colStyle.isBold ? "font-bold" : "text-gray-500 print:text-black font-medium"}
            ${isSelected 
              ? "ring-2 ring-indigo-500 bg-indigo-50/50 shadow-md z-10" 
              : "hover:bg-gray-50 hover:ring-1 hover:ring-gray-300 print:hover:bg-transparent print:hover:ring-0"
            }
          `}
        >
          <span className="pointer-events-none whitespace-nowrap">{data[field] || `[${field}]`}</span>
          
          {/* Resize Handles */}
          {isSelected && (
            <>
              <div 
                onMouseDown={(e) => handleScaleStart(e, field, 'left')}
                className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-indigo-600/50 hover:bg-indigo-600 transition-colors print:hidden"
              />
              <div 
                onMouseDown={(e) => handleScaleStart(e, field, 'right')}
                className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-indigo-600/50 hover:bg-indigo-600 transition-colors print:hidden"
              />
            </>
          )}
        </div>
      </div>
    );
  };

  const renderShape = (shape: LabelShape) => {
    const isVisible = shouldShowComponent(shape.visibility);
    const isSelected = selectedField === shape.id;

    return (
      <div 
        key={shape.id}
        onMouseDown={(e) => handleMouseDown(e, shape.id)}
        style={{
          position: 'absolute',
          top: `${shape.top}in`,
          left: `${shape.left}in`,
          width: shape.type === 'barcode' ? 'auto' : `${shape.width}in`,
          height: shape.type === 'barcode' ? 'auto' : `${shape.height}in`,
          borderStyle: shape.borderStyle,
          borderColor: shape.borderColor,
          borderTopWidth: (shape.type === 'line' && (shape.orientation || 'horizontal') === 'horizontal') || shape.type === 'rectangle' ? `${shape.borderWidth}pt` : '0px',
          borderBottomWidth: shape.type === 'rectangle' ? `${shape.borderWidth}pt` : '0px',
          borderLeftWidth: shape.type === 'rectangle' || (shape.type === 'line' && shape.orientation === 'vertical') ? `${shape.borderWidth}pt` : '0px',
          borderRightWidth: shape.type === 'rectangle' ? `${shape.borderWidth}pt` : '0px',
          backgroundColor: shape.type === 'rectangle' ? 'transparent' : undefined,
          cursor: 'move',
          zIndex: isSelected ? 20 : 5
        }}
        className={`transition-shadow 
          ${isSelected 
            ? "ring-2 ring-indigo-500 bg-indigo-50/20 shadow-md" 
            : "hover:bg-gray-50/20 hover:ring-1 hover:ring-gray-300"
          }
          ${!isVisible ? 'opacity-0 pointer-events-none' : ''}
          flex items-center justify-center overflow-visible
        `}
      >
        {shape.type === 'barcode' && barcodeValue && (
          <div className={`flex items-center justify-center pointer-events-none gap-1 ${
            styles.barcodeTextPosition === 'left' ? 'flex-row-reverse' : 'flex-row'
          }`}>
            <Barcode
              value={barcodeValue}
              format={styles.barcodeType}
              width={styles.barcodeScale * (styles.barcodeScaleX || 1) * shape.width}
              height={styles.barcodeHeight * shape.height}
              displayValue={styles.showBarcodeValue && (styles.barcodeTextPosition === 'top' || styles.barcodeTextPosition === 'bottom' || !styles.barcodeTextPosition)}
              textPosition={styles.barcodeTextPosition === 'top' ? 'top' : 'bottom'}
              fontSize={(styles.barcodeFontSize || 8) * shape.width}
              fontOptions={styles.barcodeTextBold ? "bold" : ""}
              font={styles.barcodeFontFamily || 'monospace'}
              margin={0}
              background="transparent"
              renderer="svg"
            />
            {styles.showBarcodeValue && (styles.barcodeTextPosition === 'left' || styles.barcodeTextPosition === 'right') && (
              <span
                style={{
                  fontSize: `${(styles.barcodeFontSize || 8) * shape.width}pt`,
                  fontFamily: styles.barcodeFontFamily || 'monospace',
                  fontWeight: styles.barcodeTextBold ? 'bold' : 'normal',
                  lineHeight: 1
                }}
                className="text-gray-900 tracking-widest whitespace-nowrap"
              >
                {barcodeValue}
              </span>
            )}
          </div>
        )}
        {/* Resize Handles */}
        {isSelected && (
          <>
            {/* Horizontal Handles (for all except vertical lines) */}
            {shape.orientation !== 'vertical' && (
              <>
                <div 
                  onMouseDown={(e) => handleScaleStart(e, shape.id, 'left')}
                  className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-indigo-600/50 hover:bg-indigo-600 transition-colors print:hidden"
                />
                <div 
                  onMouseDown={(e) => handleScaleStart(e, shape.id, 'right')}
                  className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-indigo-600/50 hover:bg-indigo-600 transition-colors print:hidden"
                />
              </>
            )}
            {/* Vertical Handles (for all except horizontal lines) */}
            {(shape.type !== 'line' || shape.orientation === 'vertical') && (
              <>
                <div 
                  onMouseDown={(e) => handleScaleStart(e, shape.id, 'top')}
                  className="absolute top-0 left-0 w-full h-1 cursor-ns-resize bg-indigo-600/50 hover:bg-indigo-600 transition-colors print:hidden"
                />
                <div 
                  onMouseDown={(e) => handleScaleStart(e, shape.id, 'bottom')}
                  className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize bg-indigo-600/50 hover:bg-indigo-600 transition-colors print:hidden"
                />
              </>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width: `${template.labelWidth}in`,
        height: `${template.labelHeight}in`,
      }}
      className={`relative flex ${flexDir} items-center justify-center overflow-visible bg-white border border-gray-200/50 shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-md transition-all p-1 text-center print:border-transparent print:shadow-none print:rounded-none`}
      onMouseDown={() => setSelectedField(null)}
    >
      {/* Text Group 1 (Header for Center, or All for others) */}
      <div className="flex flex-1 flex-col items-center justify-center gap-0 min-w-0 w-full">
        {textLines.length > 0 ? (
          (isCenter ? textLines.slice(0, 1) : textLines.slice(0, isVertical ? 5 : 3)).map((line) => renderLine(line.name))
        ) : (
          <div className="h-4 w-2/3 animate-pulse bg-gray-50 print:hidden" />
        )}
      </div>
      
      <div className="flex flex-1 items-center justify-center overflow-visible w-full min-h-0">
        <div 
          onMouseDown={(e) => handleMouseDown(e, 'barcode')}
          style={{
            transform: `translate(${styles.barcodeOffsetLeft}in, ${styles.barcodeOffsetTop}in)`
          }}
          className={`cursor-move transition-shadow select-none p-0 flex items-center justify-center relative
            ${selectedField === 'barcode'
              ? "ring-2 ring-indigo-500 bg-indigo-50/50 shadow-md z-10"
              : "hover:bg-gray-50 hover:ring-1 hover:ring-gray-300 print:hover:bg-transparent print:hover:ring-0"
            }
            ${!shouldShowComponent(styles.barcodeVisibility) ? 'opacity-0 pointer-events-none' : ''}
          `}
        >
          {barcodeValue ? (
            <div className={`flex items-center justify-center overflow-visible pointer-events-none gap-1 ${
              styles.barcodeTextPosition === 'left' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              <Barcode
                value={barcodeValue}
                format={styles.barcodeType}
                width={styles.barcodeScale * (styles.barcodeScaleX || 1)}
                height={styles.barcodeHeight}
                displayValue={styles.showBarcodeValue && (styles.barcodeTextPosition === 'top' || styles.barcodeTextPosition === 'bottom' || !styles.barcodeTextPosition)}
                textPosition={styles.barcodeTextPosition === 'top' ? 'top' : 'bottom'}
                fontSize={styles.barcodeFontSize || 8}
                fontOptions={styles.barcodeTextBold ? "bold" : ""}
                font={styles.barcodeFontFamily || 'monospace'}
                margin={0}
                background="transparent"
                renderer="svg"
              />
              {styles.showBarcodeValue && (styles.barcodeTextPosition === 'left' || styles.barcodeTextPosition === 'right') && (
                <span
                  style={{
                    fontSize: `${styles.barcodeFontSize || 8}pt`,
                    fontFamily: styles.barcodeFontFamily || 'monospace',
                    fontWeight: styles.barcodeTextBold ? 'bold' : 'normal',
                    lineHeight: 1
                  }}
                  className="text-gray-900 tracking-widest whitespace-nowrap"
                >
                  {barcodeValue}
                </span>
              )}
            </div>
          ) : (
            <div className="h-4 w-2/3 animate-pulse bg-gray-100 print:hidden" />
          )}

          {/* Resize Handles */}
          {selectedField === 'barcode' && (
            <>
              <div 
                onMouseDown={(e) => handleScaleStart(e, 'barcode', 'left')}
                className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-indigo-600/50 hover:bg-indigo-600 transition-colors print:hidden"
              />
              <div 
                onMouseDown={(e) => handleScaleStart(e, 'barcode', 'right')}
                className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-indigo-600/50 hover:bg-indigo-600 transition-colors print:hidden"
              />
            </>
          )}
        </div>
      </div>

      {/* Text Group 2 (Subtext for Center position only) */}
      {isCenter && textLines.length > 1 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-0 min-w-0 w-full">
          {textLines.slice(1, 4).map((line) => renderLine(line.name))}
        </div>
      )}

      {/* Shapes Layer */}
      {styles.shapes?.map(renderShape)}
    </div>
  );
};

export default memo(Label);
