/// <reference types="jasmine" />
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ResizeColumnDirective } from './resize-column.directive';

@Component({
  selector: 'host-resize-test',
  standalone: true,
  imports: [ResizeColumnDirective],
  template: `
    <div id="tableContainer">
      <table class="mat-mdc-table" id="tableA">
        <tr class="mat-mdc-header-row">
          <th class="mat-mdc-header-cell" [columnsResizable]="resizable" [index]="0">A1</th>
          <th class="mat-mdc-header-cell">A2</th>
        </tr>
        <tr class="mat-mdc-row">
          <td class="mat-mdc-cell">A1-Row</td>
          <td class="mat-mdc-cell">A2-Row</td>
        </tr>
      </table>

      <table class="mat-mdc-table" id="tableB">
        <tr class="mat-mdc-header-row">
          <th class="mat-mdc-header-cell">B1</th>
          <th class="mat-mdc-header-cell">B2</th>
        </tr>
        <tr class="mat-mdc-row">
          <td class="mat-mdc-cell">B1-Row</td>
          <td class="mat-mdc-cell">B2-Row</td>
        </tr>
      </table>
    </div>
  `,
})
class HostComponent {
  resizable = true;
}

describe('ResizeColumnDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    hostElement = fixture.nativeElement as HTMLElement;
  });

  function getPrimaryHeader(): HTMLElement {
    return hostElement.querySelector('#tableA .mat-mdc-header-cell') as HTMLElement;
  }

  function getResizer(): HTMLElement | null {
    return hostElement.querySelector('#tableA .mat-mdc-header-cell .resize-holder') as HTMLElement | null;
  }

  function getDirective(): ResizeColumnDirective {
    return fixture.debugElement.query(By.directive(ResizeColumnDirective)).injector.get(ResizeColumnDirective);
  }

  function dispatchMouseEvent(target: Document | Element, type: string, clientX: number): void {
    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX,
      screenX: clientX,
    });
    target.dispatchEvent(event);
  }

  it('should add/remove resize handle based on columnsResizable input', () => {
    expect(getResizer()).not.toBeNull();

    fixture.componentInstance.resizable = false;
    fixture.detectChanges();

    expect(getResizer()).toBeNull();

    fixture.componentInstance.resizable = true;
    fixture.detectChanges();

    expect(getResizer()).not.toBeNull();
  });

  it('should initialize resize handle with expected inline styles and prepend it to header cell', () => {
    const headerCell = getPrimaryHeader();
    const resizer = getResizer() as HTMLElement;

    expect(resizer).not.toBeNull();
    expect(headerCell.firstElementChild).toBe(resizer);
    expect(resizer.style.display).toBe('block');
    expect(resizer.style.position).toBe('absolute');
    expect(resizer.style.height).toBe('100%');
    expect(resizer.style.width).toBe('2px');
    expect(resizer.style.cursor).toBe('col-resize');
    expect(resizer.style.top).toBe('0px');
    expect(resizer.style.zIndex).toBe('9999');
    expect(resizer.style.marginLeft).toBe('-16px');
    expect(resizer.style.backgroundColor).toBe('transparent');
    expect(resizer.style.transition).toBe('background-color 120ms ease-in-out');
  });

  it('should apply and remove hover background on resize handle', () => {
    const resizer = getResizer() as HTMLElement;

    resizer.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(resizer.style.backgroundColor).toContain('--mat-table-resize-hover-bg');

    resizer.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(resizer.style.backgroundColor).toBe('');
  });

  it('should resize current table and sync width to related tables', () => {
    const headerCell = getPrimaryHeader();
    Object.defineProperty(headerCell, 'offsetWidth', {
      value: 120,
      configurable: true,
    });

    const resizer = getResizer() as HTMLElement;
    dispatchMouseEvent(resizer, 'mousedown', 100);
    dispatchMouseEvent(document, 'mousemove', 170);
    dispatchMouseEvent(document, 'mouseup', 170);

    const expectedWidth = '185px';

    const tableAHeader = hostElement.querySelector('#tableA .mat-mdc-header-row .mat-mdc-header-cell:nth-child(1)') as HTMLElement;
    const tableACell = hostElement.querySelector('#tableA .mat-mdc-row .mat-mdc-cell:nth-child(1)') as HTMLElement;
    const tableBHeader = hostElement.querySelector('#tableB .mat-mdc-header-row .mat-mdc-header-cell:nth-child(1)') as HTMLElement;
    const tableBCell = hostElement.querySelector('#tableB .mat-mdc-row .mat-mdc-cell:nth-child(1)') as HTMLElement;

    expect(tableAHeader.style.width).toBe(expectedWidth);
    expect(tableACell.style.width).toBe(expectedWidth);
    expect(tableBHeader.style.width).toBe(expectedWidth);
    expect(tableBCell.style.width).toBe(expectedWidth);
  });

  it('should enforce minimum column width', () => {
    const headerCell = getPrimaryHeader();
    Object.defineProperty(headerCell, 'offsetWidth', {
      value: 50,
      configurable: true,
    });

    const resizer = getResizer() as HTMLElement;
    dispatchMouseEvent(resizer, 'mousedown', 100);
    dispatchMouseEvent(document, 'mousemove', 10);
    dispatchMouseEvent(document, 'mouseup', 10);

    const tableAHeader = hostElement.querySelector('#tableA .mat-mdc-header-row .mat-mdc-header-cell:nth-child(1)') as HTMLElement;
    expect(tableAHeader.style.width).toBe('40px');
  });

  it('should safely handle guarded mouse handlers when internals are missing', () => {
    const directive = getDirective() as unknown as {
      columnsResizable: boolean;
      table: HTMLElement | null;
      resizerElement: HTMLElement | null;
      onMouseDown: (event: MouseEvent) => void;
      onMouseEnter: () => void;
      onMouseLeave: () => void;
    };

    directive.columnsResizable = false;
    directive.table = null;
    directive.resizerElement = null;

    expect(() => directive.onMouseDown(new MouseEvent('mousedown', { cancelable: true }))).not.toThrow();
    expect(() => directive.onMouseEnter()).not.toThrow();
    expect(() => directive.onMouseLeave()).not.toThrow();
  });

  it('should keep hover style on mouseleave while pressed and clear it on mouseup', () => {
    const directive = getDirective() as unknown as {
      resizerElement: HTMLElement | null;
      pressed: boolean;
      onMouseLeave: () => void;
      onMouseUp: (event: MouseEvent) => void;
    };
    const resizer = getResizer() as HTMLElement;
    resizer.style.backgroundColor = 'rgb(1, 2, 3)';
    directive.resizerElement = resizer;

    directive.pressed = true;
    directive.onMouseLeave();
    expect(resizer.style.backgroundColor).toBe('rgb(1, 2, 3)');

    directive.pressed = false;
    directive.onMouseUp(new MouseEvent('mouseup'));
    expect(resizer.style.backgroundColor).toBe('');
  });

  it('should cover getRelatedTables fallback branches', () => {
    const directive = getDirective() as unknown as {
      table: HTMLElement | null;
      getRelatedTables: () => HTMLElement[];
    };

    directive.table = null;
    expect(directive.getRelatedTables()).toEqual([]);

    const detachedTable = document.createElement('table');
    directive.table = detachedTable;
    expect(directive.getRelatedTables()).toEqual([detachedTable]);

    const container = document.createElement('div');
    container.id = 'tableContainer';
    const plainTable = document.createElement('table');
    container.appendChild(plainTable);
    document.body.appendChild(container);

    directive.table = plainTable;
    expect(directive.getRelatedTables()).toEqual([plainTable]);

    container.remove();
  });

  it('should fallback to current table in applyColumnWidthToRelatedTables and ignore non-elements', () => {
    const directive = getDirective() as unknown as {
      index: number;
      table: HTMLElement | null;
      relatedTables: HTMLElement[];
      applyColumnWidthToRelatedTables: (width: number) => void;
      applyWidthToElement: (element: Element | null, widthPx: string) => void;
    };

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    headerRow.className = 'mat-mdc-header-row';
    headerRow.appendChild(document.createElement('th'));
    table.appendChild(headerRow);

    directive.index = 0;
    directive.table = table;
    directive.relatedTables = [];

    directive.applyColumnWidthToRelatedTables(77);
    expect((headerRow.children[0] as HTMLElement).style.width).toBe('77px');

    expect(() =>
      directive.applyWidthToElement(document.createTextNode('x') as unknown as Element, '60px')
    ).not.toThrow();
  });

  it('should return early in initializeResizer when parent table cannot be resolved', () => {
    const directive = getDirective() as unknown as {
      renderer: { parentNode: (node: unknown) => unknown };
      resizerElement: HTMLElement | null;
      initializeResizer: () => void;
    };

    spyOn(directive.renderer, 'parentNode').and.returnValue(null);
    directive.resizerElement = null;

    directive.initializeResizer();

    expect(directive.resizerElement).toBeNull();
  });
});
