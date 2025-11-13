import { User } from '../models/types';

// Mock users for demo
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@isp.com',
    role: 'admin' as const,
    fullName: 'Administrador Sistema',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    username: 'tecnico',
    password: 'tecnico123',
    email: 'tecnico@isp.com',
    role: 'technician' as const,
    fullName: 'Juan Pérez - Técnico NOC',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    username: 'soporte',
    password: 'soporte123',
    email: 'soporte@isp.com',
    role: 'support' as const,
    fullName: 'María González - Soporte',
    createdAt: new Date('2024-02-01'),
  },
];

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'isp_auth_token';
  private readonly USER_KEY = 'isp_user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = MOCK_USERS.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Generate mock JWT token
    const token = `mock_jwt_${user.id}_${Date.now()}`;

    // Store in localStorage
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      createdAt: user.createdAt,
    }));

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      return {
        ...user,
        createdAt: new Date(user.createdAt),
      };
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getStoredUser();
  }
}

export const authService = new AuthService();
