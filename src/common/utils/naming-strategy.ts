import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

export class CamelCaseNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  joinColumnName(relationName: string, referencedColumnName: string): string {
    // Use camelCase for join column names
    return (
      relationName +
      referencedColumnName.charAt(0).toUpperCase() +
      referencedColumnName.slice(1)
    );
  }

  // joinTableColumnName(
  //   tableName: string,
  //   propertyName: string,
  //   columnName: string,
  // ): string {
  //   // Use camelCase for join table column names
  //   return (
  //     propertyName + columnName.charAt(0).toUpperCase() + columnName.slice(1)
  //   );
  // }

  relationName(propertyName: string): string {
    // Keep relation names in camelCase
    return propertyName;
  }
}
