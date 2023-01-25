import { TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
/** Column definition of mat-table-ext. */
export interface MTExColumn {
  field: string;
  options?: string[];
  header?: string;
  name?: string;
  footerText?: string;
  headerTooltip?: TooltipProp;
  cellTooltip?: TooltipProp;
  pinned?: 'left' | 'right';
  width?: string;
  disabled?: boolean;
  minWidth?: string;
  maxWidth?: string;
  hide?: boolean;
  type: MTExColumnType;
  cellTemplate?: TemplateRef<any> | null;
  headerTemplate?: TemplateRef<any> | null;
}

export interface DisplayColumn {
  filter: boolean;
  name: string;
  show: boolean;
}
export interface RowChange {
  row: { [key: string]: any };
  index: number;
}
export interface RowSelectionChange {
  row: { [key: string]: any };
  index: number;
  isSelected: boolean;
}
export interface ExpansionChange {
  data: { [key: string]: any };
  index: number;
  expanded: boolean;
}
export interface CellTemplateRefMap {
  [key: string]: TemplateRef<any>;
}
/** Possible column type values. */
export declare type MTExColumnType =
  | 'selection'
  | string
  | boolean
  | number
  | 'date';
export interface TooltipProp {
  value: string;
  tooltipPosition?: TooltipPosition;
}
export declare type TooltipPosition =
  | 'left'
  | 'right'
  | 'above'
  | 'below'
  | 'before'
  | 'after';

/** Cell template. */
export interface MTExCellTemplate {
  [key: string]: TemplateRef<any>;
}

export interface MTExColumnPinOption {
  label: string | Observable<string>;
  value: MTExColumnPinValue;
  selected: boolean;
  field: string;
}

export declare type MTExColumnPinValue = 'left' | 'right' | null;
