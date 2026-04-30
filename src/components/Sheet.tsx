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
  selectedField: string | 'barcode' | null;
  setSelectedField: (f: string | 'barcode' | null) => void;
  onUpdateOffsets: (field: string | 'barcode', top: number, left: number) => void;
  onUpdateScale: (field: string | 'barcode', scaleX: number) => void;
}

const Sheet: React.FC<SheetProps> = ({
  labels,
  template,
  mapping,
  styles,
  calibration,
  pageIndex,
  selectedField,
  setSelectedField,
  onUpdateOffsets,
  onUpdateScale,
}) => {
  return (
    <div
      className="relative bg-gray-100/30 shadow-2xl print:bg-white print:shadow-none mx-auto mb-10 print:mb-0"
      onMouseDown={() => setSelectedField(null)}
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
        {labels.map((label, i) => (
          <Label
            key={`${pageIndex}-${i}`}
            data={label}
            template={template}
            mapping={mapping}
            styles={styles}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
            onUpdateOffsets={onUpdateOffsets}
            onUpdateScale={onUpdateScale}
            labelIndex={i}
            labelColumn={i % template.columns}
          />
        ))}
      </div>
    </div>
  );
};

export default Sheet;
