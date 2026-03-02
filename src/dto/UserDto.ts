export interface UserDto {
  id: number;
  username: string;
  password: string;
  name: string;
  role: "ADMIN" | "STUDENT" | "INSTRUCTOR";
  studentId?: string | null;
  points?: number | null;
  totalCourses?: number | null;
  badges?: any[] | null;
  instructorId?: string | null;
  instructorCourses?: number | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AddUserDto {
  username: string;
  password: string;
  name: string;
  role: "ADMIN" | "STUDENT" | "INSTRUCTOR";
  student_id?: string | null;
  instructor_id?: string | null;
  image?: string | null;
}

export interface EditUserDto {
  username?: string;
  name?: string;
  role?: "ADMIN" | "STUDENT" | "INSTRUCTOR";
  studentId?: string | null;
  instructorId?: string | null;
  image?: string | null;
}
