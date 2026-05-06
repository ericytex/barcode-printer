import { LabelTemplate } from '@/types';

export const TEMPLATES: Record<string, LabelTemplate> = {
  '5160': {
    id: '5160',
    name: 'Avery 5160 (3 x 10)',
    columns: 3,
    rows: 10,
    labelWidth: 2.625,
    labelHeight: 1,
    marginTop: 0.5,
    marginBottom: 0.5,
    marginLeft: 0.1875,
    marginRight: 0.1875,
    horizontalGap: 0.125,
    verticalGap: 0,
    labelsPerPage: 30,
  },
  '5167': {
    id: '5167',
    name: 'Avery 5167 (4 x 20)',
    columns: 4,
    rows: 20,
    labelWidth: 1.75,
    labelHeight: 0.5,
    marginTop: 0.5,
    marginBottom: 0.5,
    marginLeft: 0.28,
    marginRight: 0.28,
    horizontalGap: 0.3133, 
    verticalGap: 0,
    labelsPerPage: 80,
  },
  'Z-5000T-3.9x0.9': {
    id: 'Z-5000T-3.9x0.9',
    name: 'Zebra Z-Xtreme 5000T (3.938 x 0.938)',
    columns: 1,
    rows: 1,
    labelWidth: 3.938,
    labelHeight: 0.938,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    horizontalGap: 0,
    verticalGap: 0,
    labelsPerPage: 1,
    pageWidth: 3.938,
    pageHeight: 0.938,
  },
  '10008404': {
    id: '10008404',
    name: 'Zebra Z-Xtreme 5000T (4 across - 4x5 Sheet)',
    columns: 4,
    rows: 5,
    labelWidth: 0.9375, // 15/16"
    labelHeight: 0.9375, // 15/16"
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0.0625, // 1/16"
    marginRight: 0.0625, // 1/16"
    horizontalGap: 0.0625, // 1/16"
    verticalGap: 0.0625, // 1/16"
    labelsPerPage: 20,
    pageWidth: 4.0625, // 4 1/16"
    pageHeight: 5,
  },
};
