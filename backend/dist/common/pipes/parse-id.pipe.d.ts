import { PipeTransform } from '@nestjs/common';
export declare class ParseIdPipe implements PipeTransform {
    private _opts?;
    constructor(_opts?: Record<string, unknown> | undefined);
    transform(value: unknown): unknown;
}
