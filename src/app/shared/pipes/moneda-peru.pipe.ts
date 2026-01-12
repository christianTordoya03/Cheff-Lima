import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monedaPeru'
})
export class MonedaPeruPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
