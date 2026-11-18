import { test, expect } from '@playwright/test';
import { InputObj } from '../src/types/api';
import {
  BOOLEAN_OPTIONS,
  booleanToOption,
  getInputDefaultValue,
  optionToBoolean,
  isEmptyInputValue,
  validateProcessInputs,
} from '../src/utils/validation';

const makeInput = (type: string, optional = false): InputObj[string] => ({
  name: 'input',
  description: '',
  type,
  placeholder: '',
  optional,
});

test.describe('isEmptyInputValue', () => {
  test('treats null, undefined, and empty string as empty', () => {
    expect(isEmptyInputValue(null)).toBe(true);
    expect(isEmptyInputValue(undefined)).toBe(true);
    expect(isEmptyInputValue('')).toBe(true);
  });

  test('does not treat falsy values like 0 and false as empty', () => {
    expect(isEmptyInputValue(0)).toBe(false);
    expect(isEmptyInputValue('0')).toBe(false);
    expect(isEmptyInputValue(false)).toBe(false);
  });
});

test.describe('validateProcessInputs', () => {
  test('returns no errors when there are no input definitions', () => {
    expect(validateProcessInputs(undefined, {})).toEqual({});
  });

  test('accepts 0 for a required number input', () => {
    const inputs: InputObj = { count: makeInput('number') };
    expect(validateProcessInputs(inputs, { count: 0 })).toEqual({});
  });

  test('accepts "0" for a required text input', () => {
    const inputs: InputObj = { label: makeInput('text') };
    expect(validateProcessInputs(inputs, { label: '0' })).toEqual({});
  });

  test('accepts false for a required boolean input', () => {
    const inputs: InputObj = { flag: makeInput('boolean') };
    expect(validateProcessInputs(inputs, { flag: false })).toEqual({});
  });

  test('flags required inputs that are null, undefined, or empty', () => {
    const inputs: InputObj = {
      a: makeInput('number'),
      b: makeInput('text'),
      c: makeInput('text'),
    };
    expect(validateProcessInputs(inputs, { a: null, c: '' })).toEqual({
      a: 'Valid value required.',
      b: 'Valid value required.',
      c: 'Valid value required.',
    });
  });

  test('allows optional inputs to be empty', () => {
    const inputs: InputObj = { count: makeInput('number', true) };
    expect(validateProcessInputs(inputs, { count: null })).toEqual({});
  });

  test('still type-checks falsy values', () => {
    const inputs: InputObj = {
      count: makeInput('text'),
      flag: makeInput('boolean'),
    };
    expect(validateProcessInputs(inputs, { count: 0, flag: 0 })).toEqual({
      count: 'Incorrect type: expected string',
      flag: 'Incorrect type: expected boolean',
    });
  });

  test('flags non-numeric values for number inputs', () => {
    const inputs: InputObj = { count: makeInput('number') };
    expect(validateProcessInputs(inputs, { count: 'abc' })).toEqual({
      count: 'Incorrect type: expected number',
    });
  });
});

test.describe('getInputDefaultValue', () => {
  test('defaults a required boolean with no default to null', () => {
    expect(getInputDefaultValue(makeInput('boolean'))).toBeNull();
    expect(getInputDefaultValue({ ...makeInput('boolean'), default: undefined })).toBeNull();
  });

  test('a required boolean with no default fails validation until set', () => {
    const inputs = { flag: makeInput('boolean') };
    const formInputs = { flag: getInputDefaultValue(inputs.flag) };
    expect(validateProcessInputs(inputs, formInputs)).toEqual({ flag: 'Valid value required.' });
    expect(validateProcessInputs(inputs, { flag: false })).toEqual({});
  });

  test('defaults an optional boolean with no default to null', () => {
    expect(getInputDefaultValue(makeInput('boolean', true))).toBeNull();
  });

  test('casts boolean defaults, including false', () => {
    expect(getInputDefaultValue({ ...makeInput('boolean'), default: true })).toBe(true);
    expect(getInputDefaultValue({ ...makeInput('boolean'), default: 'True' })).toBe(true);
    expect(getInputDefaultValue({ ...makeInput('boolean'), default: false })).toBe(false);
    expect(getInputDefaultValue({ ...makeInput('boolean'), default: 'false' })).toBe(false);
  });

  test('casts number and text defaults', () => {
    expect(getInputDefaultValue({ ...makeInput('number'), default: '0' })).toBe(0);
    expect(getInputDefaultValue({ ...makeInput('text'), default: 5 })).toBe('5');
    expect(getInputDefaultValue(makeInput('text'))).toBeNull();
  });
});

test.describe('boolean dropdown', () => {
  test('offers true, false, and null options', () => {
    expect(BOOLEAN_OPTIONS).toEqual(['true', 'false', 'null']);
  });

  test('booleanToOption maps booleans to their option', () => {
    expect(booleanToOption(true)).toBe('true');
    expect(booleanToOption(false)).toBe('false');
  });

  test('booleanToOption shows null for unset or non-boolean values', () => {
    expect(booleanToOption(null)).toBe('null');
    expect(booleanToOption(undefined)).toBe('null');
    expect(booleanToOption('')).toBe('null');
    expect(booleanToOption('true')).toBe('null');
    expect(booleanToOption(0)).toBe('null');
  });

  test('optionToBoolean maps options back to form values', () => {
    expect(optionToBoolean('true')).toBe(true);
    expect(optionToBoolean('false')).toBe(false);
    expect(optionToBoolean('null')).toBeNull();
    expect(optionToBoolean('')).toBeNull();
  });

  test('every option round-trips through the form value', () => {
    BOOLEAN_OPTIONS.forEach((option) => {
      expect(booleanToOption(optionToBoolean(option))).toBe(option);
    });
  });

  test('a required boolean with no default shows null in the dropdown', () => {
    expect(booleanToOption(getInputDefaultValue(makeInput('boolean')))).toBe('null');
  });

  test('a boolean default of false shows false in the dropdown', () => {
    const input = { ...makeInput('boolean'), default: false };
    expect(booleanToOption(getInputDefaultValue(input))).toBe('false');
  });

  test('selecting null for a required boolean fails validation', () => {
    const inputs = { flag: makeInput('boolean') };
    expect(validateProcessInputs(inputs, { flag: optionToBoolean('null') })).toEqual({
      flag: 'Valid value required.',
    });
  });

  test('selecting null for an optional boolean passes validation', () => {
    const inputs = { flag: makeInput('boolean', true) };
    expect(validateProcessInputs(inputs, { flag: optionToBoolean('null') })).toEqual({});
  });

  test('selecting false for a required boolean passes validation', () => {
    const inputs = { flag: makeInput('boolean') };
    expect(validateProcessInputs(inputs, { flag: optionToBoolean('false') })).toEqual({});
  });
});
