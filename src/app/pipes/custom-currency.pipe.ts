import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency',
  standalone: true,
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, prefix = 'PKR', decimalPlaces = 0): string {
    if (value === null || value === undefined) {
      return '';
    }

    const formattedValue = value.toLocaleString('en-PK', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });

    return `${prefix} ${formattedValue}`;
  }
}
