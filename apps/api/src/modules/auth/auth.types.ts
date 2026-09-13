export type SafeUser = {
  id: number;
  email: string;
  name: string | null;
  role: "Participant" | "Admin";
  isActive: boolean;
};

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      sessionId?: number;
    }
  }
}
