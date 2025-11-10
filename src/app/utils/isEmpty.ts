/*
 * Useful for checking if an object is empty.
 *  ## Example Uses: 01 (Object)
 * const obj = {};
 * console.log(isEmpty(obj)); // true
 *
 * ## Example Uses: 02 (Array)
 * const arr = [];
 * console.log(isEmpty(arr)); // true
 *
 * ## Example Uses: 03 (String)
 * const str = "";
 * console.log(isEmpty(str)); // true
 *
 * ## Example Uses: 04 (Number)
 * const num = 0;
 * console.log(isEmpty(num)); // false
 * */

export const isEmpty = (value: unknown): boolean => {
  if (value === null) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};
