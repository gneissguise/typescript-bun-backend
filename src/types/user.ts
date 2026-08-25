export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt'>;
