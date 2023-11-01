export interface UserErrorOptions {
  name?: string;
}

export default class UserError extends Error {
  constructor(message: string, options?: UserErrorOptions) {
    super(message);
    this.name = options?.name || "";
  }
}