import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.switchToHttp().getRequest();
    const user =
      typeof request === 'object' && request !== null
        ? (request as Record<string, unknown>)['user']
        : undefined;
    if (!data) return user;
    if (typeof user === 'object' && user !== null) {
      const asRecord = user as Record<string, unknown>;
      return asRecord[data];
    }
    return undefined;
  },
);
