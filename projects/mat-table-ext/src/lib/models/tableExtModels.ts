import { TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';

/** Generic row data type - defaults to Record<string, unknown> for flexibility */
export type MTExRowData = Record<string, unknown>;

/** Context type for cell templates */
export interface MTExCellContext<T = MTExRowData> {
  $implicit: T;
  row: T;
  column: MTExColumn<T>;
  index: number;
}

/** Context type for header templates */
export interface MTExHeaderContext<T = MTExRowData> {
  $implicit: MTExColumn<T>;
  data: MTExColumn<T>;
}

/** Context type for inline editing templates */
export interface MTExInlineEditingContext<T = MTExRowData> {
  $implicit: T;
  data: T;
  field: string;
  index: number;
}

/** Context type for cell editing templates */
export interface MTExCellEditingContext<T = MTExRowData> {
  $implicit: T;
  data: T;
  index: number;
}

/** Context type for expanded detail templates */
export interface MTExExpandedDetailContext<T = MTExRowData> {
  $implicit: T;
  $explicit: T;
  row: T;
  index: number;
}

/** Column definition of mat-table-ext. */
export interface MTExColumn<T = MTExRowData> {
  field: string;
  options?: string[];
  header?: string;
  name?: string;
  footerText?: string;
  headerTooltip?: TooltipProp;
  cellTooltip?: TooltipProp;
  hide?: boolean;
  disabled?: boolean;
  pinned?: 'left' | 'right';
  left?: string;
  right?: string;
  width?: string;
  resizable?: boolean;
  type: MTExColumnType;
  minWidth?: string;
  maxWidth?: string;
  sortable?: boolean | string;
  sortProp?: MTExColumnSortProp;
  typeParameter?: MTExColumnTypeParameter;
  tag?: MTExColumnTag;
  formatter?: (rowData: T, colDef?: MTExColumn<T>) => string | number | boolean | null | undefined;
  cellTemplate?: TemplateRef<MTExCellContext<T>> | null;
  headerTemplate?: TemplateRef<MTExHeaderContext<T>> | null;
  showExpand?: boolean;
  description?: string;
  summary?: ((data: T[], colDef?: MTExColumn<T>) => string | number) | string;
  class?: string;
  groupName?: string;
}

export interface MTExColumnTag {
  [key: number]: MTExColumnTagValue;
  [key: string]: MTExColumnTagValue;
}

export interface MTExColumnTagValue {
  text?: string;
  color?: string;
}
export interface MTExColumnTypeParameter {
  currencyCode?: string;
  display?: string | boolean;
  digitsInfo?: string;
  format?: string;
  locale?: string;
  timezone?: string;
}

/** The properties of column sort. */
export interface MTExColumnSortProp {
  arrowPosition?: 'before' | 'after';
  disableClear?: boolean;
  id?: string;
  start?: 'asc' | 'desc';
}

/** Column group definition for grouped headers */
export interface MTExColumnGroup {
  name: string;
  label: string;
  columns: string[];
  colspan?: number;
}

export interface DisplayColumn {
  filter: boolean;
  name: string;
  show: boolean;
}
export interface RowChange<T = MTExRowData> {
  row: T;
  index: number;
}
export interface RowSelectionChange<T = MTExRowData> {
  row: T;
  index: number;
  isSelected: boolean;
}
export interface ExpansionChange<T = MTExRowData> {
  data: T;
  index: number;
  expanded: boolean;
}
export interface CellTemplateRefMap<T = MTExRowData> {
  [key: string]: TemplateRef<MTExCellContext<T>>;
}
/** Possible column type values. */
export declare type MTExColumnType =
  | 'selection'
  | 'string'
  | 'boolean'
  | 'number'
  | 'date'
  | 'datepicker'
  | 'textarea';
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
export interface MTExCellTemplate<T = MTExRowData> {
  [key: string]: TemplateRef<MTExCellContext<T>>;
}
export interface FilterSearchValue {
  [key: string]: string | number | boolean | Date | null | undefined;
}
export interface MTExRow extends MTExRowData {
  [key: string]: unknown;
}
export interface ColumnVisibility {
  [key: string]: boolean;
}

export interface MTExColumnPinOption {
  label: string | Observable<string>;
  value: MTExColumnPinValue;
  selected: boolean;
  field: string;
}

export declare type MTExColumnPinValue = 'left' | 'right' | null;

/** Row pinning configuration */
export interface RowPinning {
  index: number;
  position: 'top' | 'bottom';
}

/** Row pinning position type */
export declare type RowPinPosition = 'top' | 'bottom' | null;

/** Function type to determine row pinning position */
export declare type RowPinningFunction<T = MTExRowData> = (row: T, index: number) => RowPinPosition;

/** Function type to determine if a row should be hidden */
export declare type RowHidingFilterFunction<T = MTExRowData> = (row: T, index: number) => boolean;

/** Table configuration for pinned tables */
export interface MTExPinnedTableConfig<T = MTExRowData> {
  /** Enable row pinning feature */
  enableRowPinning?: boolean;
  /** Maximum height for the top pinned table (e.g., '200px', '20vh'). When set, enables scrolling if rows exceed this height. */
  pinnedTopTableMaxHeight?: string;
  /** Maximum height for the bottom pinned table (e.g., '200px', '20vh'). When set, enables scrolling if rows exceed this height. */
  pinnedBottomTableMaxHeight?: string;
  /** Function to determine which rows should be pinned and their position */
  rowPinningFn?: RowPinningFunction<T>;
}

/** Table configuration for row hiding */
export interface MTExRowHidingConfig<T = MTExRowData> {
  /** Enable row hiding feature */
  enableRowHiding?: boolean;
  /** Array of row indices to hide */
  hiddenRowIndices?: number[];
  /** Function to determine if a row should be hidden */
  rowHidingFilterFn?: RowHidingFilterFunction<T>;
}

/** Event emitted when row pinning changes */
export interface RowPinningChangeEvent<T = MTExRowData> {
  row: T;
  position: RowPinPosition;
  index?: number;
}

/** Table styling configuration */
export interface MTExTableStyles {
  /** Height of the table container */
  tableHeight?: string;
  /** Width of the table */
  tableWidth?: string;
  /** Height of the toolbar */
  toolbarHeight?: string;
  /** Custom CSS class for the table */
  tableClassName?: string;
}

/** PDF export configuration */
export interface MTExPDFConfig {
  /** Orientation for PDF export */
  pdfOrientation?: 'portrait' | 'landscape';
}
