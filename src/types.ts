export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user' | 'staff';
  department?: 'Administración' | 'Ventas' | 'Ingeniería';
}

export type AppArea = 'admin' | 'sales' | 'eng' | 'landing';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  area: AppArea;
}
