export interface LabelTemplate {
  id: '5160' | '5167';
  name: string;
  columns: number;
  rows: number;
  labelWidth: number; // in inches
  labelHeight: number; // in inches
  marginTop: number; // in inches
  marginBottom: number; // in inches
  marginLeft: number; // in inches
  marginRight: number; // in inches
  horizontalGap: number; // in inches (if any)
  verticalGap: number; // in inches (if any)
  labelsPerPage: number;
}

export interface Calibration {
  top: number; // offset in inches
  left: number; // offset in inches
}

export interface Mapping {
  textFields: string[];
  barcode: string;
}

export type VisibilityRule = 'always' | 'odd-labels' | 'even-labels' | 'odd-columns' | 'even-columns';

export interface ColumnStyle {
  fontSize: number;
  isBold: boolean;
  alignment: 'left' | 'center' | 'right';
  offsetTop: number;
  offsetLeft: number;
  scaleX: number;
  visibility: VisibilityRule;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export type BarcodeType = 
  | "CODE128" | "CODE128A" | "CODE128B" | "CODE128C"
  | "EAN13" | "EAN8" | "EAN5" | "EAN2"
  | "UPC" | "UPCE"
  | "CODE39"
  | "ITF14" | "ITF"
  | "MSI" | "MSI10" | "MSI11" | "MSI1010" | "MSI1110"
  | "codabar" | "pharmacode";

export interface LabelShape {
  id: string;
  type: 'line' | 'rectangle' | 'barcode' | 'text';
  orientation?: 'horizontal' | 'vertical';
  top: number;
  left: number;
  width: number;
  height: number;
  borderStyle: 'solid' | 'dotted' | 'dashed';
  borderWidth: number;
  borderColor: string;
  visibility: VisibilityRule;
  barcodeColumn?: string;
  textContent?: string;
  fontSize?: number;
  isBold?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;
  color?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textColumn?: string;
  barcodeScale?: number;
  barcodeScaleX?: number;
  barcodeHeight?: number;
}

export interface LabelStyles {
  fontSizeHeader: number;
  fontSizeText: number;
  barcodeScale: number;
  barcodeScaleX: number;
  barcodeHeight: number;
  showBarcodeValue: boolean;
  barcodeFontSize?: number;
  barcodeTextBold?: boolean;
  barcodeFontFamily?: string;
  barcodeTextPosition?: 'top' | 'bottom' | 'left' | 'right';
  barcodeType: BarcodeType;
  barcodePosition: 'top' | 'bottom' | 'left' | 'right' | 'center';
  barcodeOffsetTop: number;
  barcodeOffsetLeft: number;
  barcodeVisibility: VisibilityRule;
  columnStyles: Record<string, ColumnStyle>;
  shapes: LabelShape[];
}

export interface SavedTemplate {
  name: string;
  timestamp: number;
  design: {
    template: LabelTemplate;
    mapping: Mapping;
    styles: LabelStyles;
    calibration: Calibration;
  };
}

export type LabelData = Record<string, string>;
