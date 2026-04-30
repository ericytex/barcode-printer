import { LabelTemplate } from '@/types';

export const TEMPLATES: Record<'5160' | '5167', LabelTemplate> = {
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
};
