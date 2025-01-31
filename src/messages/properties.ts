import { readFileSync } from 'fs';
import { parse as parseProperties } from 'dot-properties';

/**
 * A simple "key/value" object used to store messages.
 */
export type KeyValueObject = {
  readonly [key: string]: string;
};

/**
 * A collection of "key/value" objects for for all locales.
 */
export type KeyValueObjectCollection = {
  [key: string]: KeyValueObject;
};

/**
 * Parse a `.properties` file and return it back as a "key/value" object.
 *
 * @param filePath - The file path of the `.properties` file to parse.
 *
 * @returns The "raw" representation of a `.properties` fille in a simple "key/value" object.
 */
export function parsePropertiesFile(filePath: string): KeyValueObject {
  const fileContent = readFileSync(filePath, 'utf8');
  return parseProperties(fileContent) as KeyValueObject;
}
