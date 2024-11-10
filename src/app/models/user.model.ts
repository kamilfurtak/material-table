export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  [key: string]: any;
}

export interface ColumnDef {
  columnDef: string;
  header: string;
  cell: (element: User) => string;
}