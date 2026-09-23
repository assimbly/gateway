export type DataTableAlign = 'start' | 'end';

export interface DataTableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  align?: DataTableAlign;
  numeric?: boolean;
}
