import { InputObj } from '../types/api';

/**
 * Returns true only for null, undefined, or empty string so that falsy values
 * like 0 and false are treated as real input values.
 *
 * @param value - form input value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isEmptyInputValue = (value: any): boolean => {
  return value === null || value === undefined || value === '';
};

/**
 * Validates form input values against the process input definitions.
 * Returns a map of input name to error message; empty if all inputs are valid.
 *
 * @param inputs - process input definitions
 * @param formInputs - current form input values
 */
export const validateProcessInputs = (
  inputs: InputObj | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formInputs: Record<string, any>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!inputs) {
    return errors;
  }

  Object.entries(inputs).forEach(([key, input]) => {
    const value = formInputs[key];
    const isEmpty = isEmptyInputValue(value);

    // Make sure required fields are not empty
    if (!input?.optional && isEmpty) {
      errors[key] = `Valid value required.`;
    }

    // Validate process inputs against their types defined in the process definition
    if (!isEmpty) {
      switch (input.type?.toLowerCase()) {
        case 'number':
          if (isNaN(Number(value))) {
            errors[key] = `Incorrect type: expected number`;
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors[key] = `Incorrect type: expected boolean`;
          }
          break;
        case 'text':
          if (typeof value !== 'string') {
            errors[key] = `Incorrect type: expected string`;
          }
          break;
        default:
          break;
      }
    }
  });

  return errors;
};

/**
 * Returns the initial form value for a process input based on its default.
 * Inputs without a default (including required booleans) start as null so the
 * user must explicitly provide a value rather than silently submitting false.
 *
 * @param input - process input definition
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getInputDefaultValue = (input: InputObj[string]): any => {
  if (input.default === undefined || input.default === null || input.default === '') {
    return null;
  }
  switch (input.type?.toLowerCase()) {
    case 'boolean':
      return String(input.default).toLowerCase() === 'true';
    case 'number':
      return Number(input.default);
    default:
      return String(input.default);
  }
};

export type BooleanOption = 'true' | 'false' | 'null';

export const BOOLEAN_OPTIONS: BooleanOption[] = ['true', 'false', 'null'];

/**
 * Maps a boolean form value to its dropdown option. Anything that is not a
 * real boolean (null, undefined, strings, etc.) is shown as 'null'.
 *
 * @param value - form input value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const booleanToOption = (value: any): BooleanOption => {
  return typeof value === 'boolean' ? (String(value) as BooleanOption) : 'null';
};

/**
 * Maps a selected dropdown option back to a boolean form value.
 *
 * @param option - selected dropdown option
 */
export const optionToBoolean = (option: string): boolean | null => {
  if (option === 'true') {
    return true;
  }
  if (option === 'false') {
    return false;
  }
  return null;
};
