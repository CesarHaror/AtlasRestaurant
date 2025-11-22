"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = typeof request === 'object' && request !== null
        ? request['user']
        : undefined;
    if (!data)
        return user;
    if (typeof user === 'object' && user !== null) {
        const asRecord = user;
        return asRecord[data];
    }
    return undefined;
});
//# sourceMappingURL=current-user.decorator.js.map