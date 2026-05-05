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
      className="relative bg-gray-100/30 shadow-2xl print:bg-white print:shadow-none mx-auto mb-10 print:mb-0"
      onMouseDown={() => setSelectedFields([])}
      style={{
        width: '8.5in',
        height: '11in',
        paddingTop: `${template.marginTop + calibration.top}in`,
        paddingLeft: `${template.marginLeft + calibration.left}in`,
        paddingRight: `${template.marginRight}in`,
        paddingBottom: `${template.marginBottom}in`,
        pageBreakAfter: 'always',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${template.columns}, ${template.labelWidth}in)`,
          gridTemplateRows: `repeat(${template.rows}, ${template.labelHeight}in)`,
          columnGap: `${template.horizontalGap}in`,
          rowGap: `${template.verticalGap}in`,
        }}
      >
        {labels.map((label, index) => (
          <Label
            key={`${pageIndex}-${index}`}
            data={label}
            template={template}
            mapping={mapping}
            styles={styles}
            selectedFields={selectedFields}
            setSelectedFields={setSelectedFields}
            onMoveFields={onMoveFields}
            onDragEnd={onDragEnd}
            onUpdateScale={onUpdateScale}
            labelIndex={index + (pageIndex * template.itemsPerPage)}
            labelColumn={index % template.columns}
          />
        ))}
      </div>
    </div>
  );
};

export default Sheet;
