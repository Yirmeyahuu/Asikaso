import type { User, Task, Department, TaskStats, Activity, CalendarEvent, DashboardData, Organization, OrganizationMember } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async verifyToken(): Promise<{ valid: boolean; user: User }> {
    return this.request<{ valid: boolean; user: User }>('/auth/verify');
  }

  // Users
  async getUsers(): Promise<{ users: User[] }> {
    return this.request<{ users: User[] }>('/users');
  }

  async getUser(id: string): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/users/${id}`);
  }

  async createUser(data: Partial<User>): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users', { method: 'POST', body: data });
  }

  async updateUser(id: string, data: Partial<User>): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/users/${id}`, { method: 'PUT', body: data });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, { method: 'DELETE' });
  }

  async getUsersByDepartment(departmentId: string): Promise<{ users: User[] }> {
    return this.request<{ users: User[] }>(`/users/department/${departmentId}`);
  }

  // Departments
  async getDepartments(): Promise<{ departments: Department[] }> {
    return this.request<{ departments: Department[] }>('/departments');
  }

  async getDepartment(id: string): Promise<{ department: Department }> {
    return this.request<{ department: Department }>(`/departments/${id}`);
  }

  async createDepartment(data: Partial<Department>): Promise<{ department: Department }> {
    return this.request<{ department: Department }>('/departments', { method: 'POST', body: data });
  }

  async updateDepartment(id: string, data: Partial<Department>): Promise<{ department: Department }> {
    return this.request<{ department: Department }>(`/departments/${id}`, { method: 'PUT', body: data });
  }

  async deleteDepartment(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/departments/${id}`, { method: 'DELETE' });
  }

  // Tasks
  async getTasks(params?: { departmentId?: string; status?: string; assigneeId?: string }): Promise<{ tasks: Task[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const endpoint = query ? `/tasks?${query}` : '/tasks';
    return this.request<{ tasks: Task[] }>(endpoint);
  }

  async getTask(id: string): Promise<{ task: Task; subtasks: unknown[] }> {
    return this.request<{ task: Task; subtasks: unknown[] }>(`/tasks/${id}`);
  }

  async createTask(data: Partial<Task>): Promise<{ task: Task }> {
    return this.request<{ task: Task }>('/tasks', { method: 'POST', body: data });
  }

  async updateTask(id: string, data: Partial<Task>): Promise<{ task: Task }> {
    return this.request<{ task: Task }>(`/tasks/${id}`, { method: 'PUT', body: data });
  }

  async updateTaskStatus(id: string, status: string): Promise<{ task: Task }> {
    return this.request<{ task: Task }>(`/tasks/${id}/status`, { method: 'PATCH', body: { status } });
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' });
  }

  async getDashboardTasks(): Promise<{ tasks: Task[] }> {
    return this.request<{ tasks: Task[] }>('/tasks/dashboard');
  }

  async getTaskStats(departmentId?: string): Promise<{ stats: TaskStats }> {
    const endpoint = departmentId ? `/tasks/stats?departmentId=${departmentId}` : '/tasks/stats';
    return this.request<{ stats: TaskStats }>(endpoint);
  }

  // Subtasks
  async getSubtasks(taskId: string): Promise<{ subtasks: unknown[] }> {
    return this.request<{ subtasks: unknown[] }>(`/subtasks/task/${taskId}`);
  }

  async createSubtask(taskId: string, title: string): Promise<{ subtask: unknown }> {
    return this.request<{ subtask: unknown }>('/subtasks', { method: 'POST', body: { taskId, title } });
  }

  async updateSubtask(id: string, data: { title?: string; completed?: boolean }): Promise<{ subtask: unknown }> {
    return this.request<{ subtask: unknown }>(`/subtasks/${id}`, { method: 'PUT', body: data });
  }

  async toggleSubtask(id: string): Promise<{ subtask: unknown }> {
    return this.request<{ subtask: unknown }>(`/subtasks/${id}/toggle`, { method: 'PATCH' });
  }

  async deleteSubtask(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/subtasks/${id}`, { method: 'DELETE' });
  }

  // Activity
  async getRecentActivities(limit = 50): Promise<{ activities: Activity[] }> {
    return this.request<{ activities: Activity[] }>(`/activity?limit=${limit}`);
  }

  async getUserActivities(userId: string): Promise<{ activities: Activity[] }> {
    return this.request<{ activities: Activity[] }>(`/activity/user/${userId}`);
  }

  // Events / Calendar
  async getEvents(params?: { type?: string; status?: string; departmentId?: string }): Promise<{ events: CalendarEvent[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const endpoint = query ? `/events?${query}` : '/events';
    return this.request<{ events: CalendarEvent[] }>(endpoint);
  }

  async getEvent(id: string): Promise<{ event: CalendarEvent }> {
    return this.request<{ event: CalendarEvent }>(`/events/${id}`);
  }

  async createEvent(data: Partial<CalendarEvent>): Promise<{ event: CalendarEvent }> {
    return this.request<{ event: CalendarEvent }>('/events', { method: 'POST', body: data });
  }

  async updateEvent(id: string, data: Partial<CalendarEvent>): Promise<{ event: CalendarEvent }> {
    return this.request<{ event: CalendarEvent }>(`/events/${id}`, { method: 'PUT', body: data });
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<{ events: CalendarEvent[] }> {
    return this.request<{ events: CalendarEvent[] }>(`/events/range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getTodayEvents(): Promise<{ events: CalendarEvent[] }> {
    return this.request<{ events: CalendarEvent[] }>('/events/today');
  }

  async getUpcomingEvents(days = 3): Promise<{ events: CalendarEvent[] }> {
    return this.request<{ events: CalendarEvent[] }>(`/events/upcoming?days=${days}`);
  }

  async completeEvent(id: string): Promise<{ event: CalendarEvent }> {
    return this.request<{ event: CalendarEvent }>(`/events/${id}/complete`, { method: 'PATCH' });
  }

  async archiveEvent(id: string): Promise<{ event: CalendarEvent }> {
    return this.request<{ event: CalendarEvent }>(`/events/${id}/archive`, { method: 'PATCH' });
  }

  async deleteEvent(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/events/${id}`, { method: 'DELETE' });
  }

  async getDashboardData(): Promise<{ data: DashboardData }> {
    return this.request<{ data: DashboardData }>('/events/dashboard');
  }

  // Organization
  async getOrganization(): Promise<{ organization?: Organization; exists: boolean }> {
    return this.request<{ organization?: Organization; exists: boolean }>('/organization');
  }

  async createOrganization(name: string, description?: string): Promise<{ organization: Organization }> {
    return this.request<{ organization: Organization }>('/organization', { method: 'POST', body: { name, description } });
  }

  async updateOrganization(name: string, description?: string): Promise<{ organization: Organization }> {
    return this.request<{ organization: Organization }>('/organization', { method: 'PUT', body: { name, description } });
  }

  async checkIsAdmin(): Promise<{ isAdmin: boolean; hasOrganization: boolean }> {
    return this.request<{ isAdmin: boolean; hasOrganization: boolean }>('/organization/check-admin');
  }

  // Organization Members
  async getOrganizationMembers(): Promise<{ members: OrganizationMember[] }> {
    return this.request<{ members: OrganizationMember[] }>('/organization/members');
  }

  async addOrganizationMember(email: string): Promise<{ member: OrganizationMember }> {
    return this.request<{ member: OrganizationMember }>('/organization/members', { method: 'POST', body: { email } });
  }

  async removeOrganizationMember(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/organization/members/${id}`, { method: 'DELETE' });
  }

  async updateOrganizationMemberRole(id: string, role: string): Promise<{ member: OrganizationMember }> {
    return this.request<{ member: OrganizationMember }>(`/organization/members/${id}`, { method: 'PUT', body: { role } });
  }

  async getOrganizationMemberCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>('/organization/members/count');
  }

  async checkUserExists(email: string): Promise<{ exists: boolean; user?: { uid: string; email: string; displayName: string } }> {
    return this.request<{ exists: boolean; user?: { uid: string; email: string; displayName: string } }>(`/organization/check-user?email=${encodeURIComponent(email)}`);
  }
}

export const api = new ApiService();
