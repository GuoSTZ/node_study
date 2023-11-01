export interface SessionErrorOptions {
  name?: string;
}

export default class SessionError extends Error {
  constructor(message: string, options?: SessionErrorOptions) {
    super(message);
    this.name = options?.name || "";
  }
}