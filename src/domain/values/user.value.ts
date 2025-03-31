import { UserRole } from "../entities/user.entity";

export type UserId = number;

export interface UserProps {
  id?: UserId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserValue {
  private readonly id: UserId;
  private name: string;
  private email: string;
  private password: string;
  private role: UserRole;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  getId(): UserId {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getRole(): UserRole {
    return this.role;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  update(props: Partial<Omit<UserProps, 'id' | 'createdAt'>>): void {
    if (props.name !== undefined) {
      this.name = props.name;
    }

    if (props.email !== undefined) {
      this.email = props.email;
    }

    if (props.password !== undefined) {
      this.password = props.password;
    }

    if (props.role !== undefined) {
      this.role = props.role;
    }

    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
