import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unidadMedida'
})
export class UnidadMedidaPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
