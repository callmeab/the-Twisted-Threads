import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency',
  standalone: true,
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, currencySymbol = '$', decimalPlaces = 2): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    // Formats value as a clean string with a chosen symbol and decimal places
    const formattedValue = value.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
    
    return `${currencySymbol}${formattedValue}`;
  }
}
