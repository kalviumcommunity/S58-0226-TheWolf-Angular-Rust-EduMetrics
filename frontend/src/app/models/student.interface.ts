export interface Student {
  id: number;
  name: string;
  email: string;
  enrollment_date: string;
  status: string;
  gpa: number;
  performance_level: string;
  phone?: string;
  address?: string;
  department?: string;
}

export interface PaginatedStudents {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  data: Student[];
}