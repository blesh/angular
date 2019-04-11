/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

const u = undefined;

function plural(n: number): number {
  if (n === 1) return 1;
  return 5;
}

export default [
  'el-CY', [['πμ', 'μμ'], ['π.μ.', 'μ.μ.'], u], u,
  [
    ['Κ', 'ɵɵ', 'Τ', 'Τ', 'Π', 'Π', 'Σ'],
    ['Κυρ', 'ɵɵευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'],
    [
      'Κυριακή', 'ɵɵευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη',
      'Παρασκευή', 'Σάββατο'
    ],
    ['Κυ', 'ɵɵε', 'Τρ', 'Τε', 'Πέ', 'Πα', 'Σά']
  ],
  u,
  [
    ['Ι', 'Φ', 'Μ', 'Α', 'Μ', 'Ι', 'Ι', 'Α', 'Σ', 'Ο', 'Ν', 'ɵɵ'],
    [
      'Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ',
      'Οκτ', 'Νοε', 'ɵɵεκ'
    ],
    [
      'Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου',
      'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου',
      'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'ɵɵεκεμβρίου'
    ]
  ],
  [
    ['Ι', 'Φ', 'Μ', 'Α', 'Μ', 'Ι', 'Ι', 'Α', 'Σ', 'Ο', 'Ν', 'ɵɵ'],
    [
      'Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ',
      'Οκτ', 'Νοέ', 'ɵɵεκ'
    ],
    [
      'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
      'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
      'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'ɵɵεκέμβριος'
    ]
  ],
  [['π.Χ.', 'μ.Χ.'], u, ['προ Χριστού', 'μετά Χριστόν']], 1, [6, 0],
  ['d/M/yy', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
  ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'], ['{1}, {0}', u, '{1} - {0}', u],
  [',', '.', ';', '%', '+', '-', 'e', '×', '‰', '∞', 'NaN', ':'],
  ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], '€', 'Ευρώ',
  {'GRD': ['ɵɵρχ'], 'JPY': ['JP¥', '¥'], 'THB': ['฿']}, plural
];
