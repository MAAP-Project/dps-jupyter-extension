import { test, expect } from '@playwright/test';
import { InputObj } from '../src/types/api';
import { isEmptyInputValue, validateProcessInputs } from '../src/utils/validation';

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
