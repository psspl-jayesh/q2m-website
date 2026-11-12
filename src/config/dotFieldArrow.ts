/**
 * Home hero dot field: which dots are blue. Edit single dots here; the animation code (src/components/DotField.tsx) reads it.
 *
 * ARROW is the Q2M logo arrow mark, one character per dot (1 = blue, 0 = empty), copied dot for dot from the logo
 * (the owner's reference image and public/images/shared/q2m-icon.svg give the same 45 dots, 9 x 9).
 * It sits in the 13 x 13 field at row ROW, column COL (upper right, pointing up-right). 1 logo dot = 1 field dot.
 */
export const FIELD_SIZE = 13

export const ARROW = [
  '000011111',
  '000111111',
  '001111111',
  '011111111',
  '111111111',
  '000011110',
  '000011100',
  '000011000',
  '000010000',
] as const

/** Top-left corner of the arrow inside the field (0-based). 13 - 9 = 4 puts its right edge on the field's right edge. */
export const ROW = 0
export const COL = 4

/** True when the field dot at (row, col) is part of the arrow. */
export function inArrow(r: number, c: number): boolean {
  return ARROW[r - ROW]?.[c - COL] === '1'
}
