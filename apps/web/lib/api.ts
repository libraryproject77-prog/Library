const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fxec_token') || 'student-token';
      const activeUser = localStorage.getItem('fxec_user');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (activeUser) {
        try {
          const userObj = JSON.parse(activeUser);
          if (userObj.id) {
            headers['x-user-id'] = userObj.id;
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'API request failed');
      }
      return data;
    } catch (err: any) {
      console.error(`[API Error: ${endpoint}]`, err);
      throw err;
    }
  }

  // Auth
  public async register(payload: {
    name: string;
    email: string;
    password?: string;
    role: string;
    rollNumber?: string;
    staffId?: string;
    department?: string;
  }) {
    try {
      const data: any = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (e) {
      console.warn('[API] Backend register request skipped or offline:', e);
      return { success: true };
    }
  }

  public async login(email: string, role?: string) {
    const data: any = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('fxec_token', data.token);
      localStorage.setItem('fxec_user', JSON.stringify(data.user));
    }
    return data;
  }

  public async getMe() {
    return this.request<{ success: boolean; user: any }>('/auth/me');
  }

  public logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fxec_token');
      localStorage.removeItem('fxec_user');
    }
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Books
  public async getBooks(params?: { search?: string; categoryId?: string; availability?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.availability) query.append('availability', params.availability);
    return this.request<any>(`/books?${query.toString()}`);
  }

  public async getBookById(id: string) {
    return this.request<any>(`/books/${id}`);
  }

  public async createBook(payload: any) {
    return this.request<any>('/books', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateBook(id: string, payload: any) {
    return this.request<any>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async deleteBook(id: string) {
    return this.request<any>(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  public async getCategories() {
    return this.request<any>('/books/categories');
  }

  // Copies
  public async addCopy(payload: { bookId: string; copyNumber: string; conditionNotes?: string }) {
    return this.request<any>('/copies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateCopyStatus(id: string, payload: { status: string; conditionNotes?: string }) {
    return this.request<any>(`/copies/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Reservations
  public async getReservations(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<any>(`/reservations${query}`);
  }

  public async getMyReservations() {
    return this.request<any>('/reservations/my');
  }

  public async approveReservation(id: string) {
    return this.request<any>(`/reservations/${id}/approve`, {
      method: 'PATCH',
    });
  }

  public async rejectReservation(id: string, reason: string) {
    return this.request<any>(`/reservations/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  public async cancelReservation(id: string) {
    return this.request<any>(`/reservations/${id}/cancel`, {
      method: 'PATCH',
    });
  }

  public async requestReservation(copyId: string, durationHours: number = 24) {
    return this.request<any>('/reservations/request', {
      method: 'POST',
      body: JSON.stringify({ copyId, durationHours }),
    });
  }

  // Borrowing
  public async getTransactions(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<any>(`/borrowing${query}`);
  }

  public async getMyBorrowings() {
    return this.request<any>('/borrowing/my');
  }

  public async issueBook(payload: { copyId: string; userId: string; days: number }) {
    return this.request<any>('/borrowing/issue', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async returnBook(id: string, payload: { condition: string; waiveFine: boolean }) {
    return this.request<any>(`/borrowing/return/${id}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Members
  public async getMembers(params?: { role?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.search) query.append('search', params.search);
    return this.request<any>(`/members?${query.toString()}`);
  }

  public async getMemberById(id: string) {
    return this.request<any>(`/members/${id}`);
  }

  public async toggleMemberStatus(id: string) {
    return this.request<any>(`/members/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // Reports
  public async getStats() {
    return this.request<any>('/reports/stats');
  }

  public async getInventoryReport() {
    return this.request<any>('/reports/inventory');
  }

  public async getBorrowingReport() {
    return this.request<any>('/reports/borrowing');
  }

  public async getOverdueReport() {
    return this.request<any>('/reports/overdue');
  }

  // Notifications
  public async getNotifications() {
    return this.request<any>('/notifications');
  }

  public async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  public async getAnnouncements() {
    return this.request<any>('/notifications/announcements');
  }

  public async createAnnouncement(payload: { title: string; content: string; priority: string }) {
    return this.request<any>('/notifications/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiClient();
