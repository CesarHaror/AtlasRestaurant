import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform {
  constructor(private _opts?: any) {}

  transform(value: any) {
    // Accept UUIDs or numeric IDs; return as-is (string)
    // This pipe intentionally does not enforce UUID validation so legacy integer IDs work.
    return value;
  }
}
