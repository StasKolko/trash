type AppErrorParams = {
  kind: string;
  message: string;
  cause?: unknown;
  context?: Record<string, unknown> | undefined;
};

class AppError extends Error {
  public readonly kind: string;
  public readonly context?: Record<string, unknown> | undefined;

  public constructor(params: AppErrorParams) {
    super(params.message, { cause: params.cause });
    this.name = this.constructor.name;
    this.kind = params.kind;
    this.context = params.context;
  }
}

export type { AppErrorParams };
export { AppError };
