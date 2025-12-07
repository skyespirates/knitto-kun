import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
}

export interface OTP extends RowDataPacket {
  id: number;
  otp_code: string;
  expires_at: Date;
  created_at: Date;
  used: boolean;
}

export interface Counter extends RowDataPacket {
  name: string;
  current: number;
}

export interface RequestPerHour extends RowDataPacket {
  hour: string;
  total_request: number;
}

export interface TokenPayload {
  id: number;
  email: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export interface Balance extends RowDataPacket {
  balance: number;
}
