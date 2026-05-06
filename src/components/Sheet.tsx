'use client';

import React from 'react';
import { Calibration, LabelData, LabelTemplate, Mapping, LabelStyles } from '@/types';
import Label from './Label';

interface SheetProps {
  labels: LabelData[];
  template: LabelTemplate;
  mapping: Mapping;
  styles: LabelStyles;
  calibration: Calibration;
  pageIndex: number;
  selectedFields: string[];
  setSelectedFields: (ids: string[]) => void;
  onMoveFields: (ids: string[], dt: number, dl: number) => void;
  onDragEnd: () => void;
  onUpdateScale: (field: string | 'barcode', factor: number, side?: 'left' | 'right' | 'top' | 'bottom') => void;
}

const Sheet: React.FC<SheetProps> = ({
  labels,
  template,
  mapping,
  styles,
  calibration,
  pageIndex,
  selectedFields,
  setSelectedFields,
  onMoveFields,
  onDragEnd,
  onUpdateScale,
}) => {
  return (
    <div
      className="relative bg-gray-100/30 shadow-2xl print:bg-white print:shadow-none mx-auto mb-10 print:mb-0 print:m-0"
      onMouseDown={() => setSelectedFields([])}
      style={{
        width: template.pageWidth ? `${template.pageWidth}in` : '8.5in',
        height: template.pageHeight ? `${template.pageHeight}in` : '11in',
        paddingTop: `${template.marginTop + calibration.top}in`,
        paddingLeft: `${template.marginLeft + calibration.left}in`,
        paddingRight: `${template.marginRight}in`,
        paddingBottom: `${template.marginBottom}in`,
        pageBreakAfter: 'always',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${template.columns}, ${template.labelWidth}in)`,
          gridTemplateRows: `repeat(${template.rows}, ${template.labelHeight}in)`,
          columnGap: `${template.horizontalGap}in`,
          rowGap: `${template.verticalGap}in`,
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          justifyContent: 'flex-start',
          alignContent: 'flex-start',
        }}
      >
        {labels.map((label, index) => (
          <div 
            key={`${pageIndex}-${index}`} 
            style={{ 
              width: `${template.labelWidth}in`,
              height: `${template.labelHeight}in`,
              overflow: 'hidden'
            }}
          >
            <Label
              data={label}
              template={template}
              mapping={mapping}
              styles={styles}
              selectedFields={selectedFields}
              setSelectedFields={setSelectedFields}
              onMoveFields={onMoveFields}
              onDragEnd={onDragEnd}
              onUpdateScale={onUpdateScale}
              labelIndex={index + (pageIndex * template.labelsPerPage)}
              labelColumn={index % template.columns}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sheet;
