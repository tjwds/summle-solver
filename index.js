const TARGET = 585;
// XXX hack: when there are two "start" values that are the same, add one as
//           N.0, e.g. "5.0"
const START = [4, 5, "5.0", 6, 12, 25];

// XXX Okay, this is a really fun hack; I just kind of eyeballed this until it
//     felt like the program was running the fastest.  This keeps running speeds
//     _shockingly_ low.
const DICTIONARY_LENGTH_LIMIT = 300;

const OPERATIONS = [
  (a, b) => a + b,
  (a, b) => a - b,
  (a, b) => b - a,
  (a, b) => a * b,
  (a, b) => a / b,
  (a, b) => b / a,
];
const OPERATIONS_LENGTH = OPERATIONS.length;
const OPERATION_STRINGS = ["+", "-", "-", "*", "/", "/"];

const startIsValid = (first, second) =>
  !(usedNumbers[first] & usedNumbers[second]);
const resIsValid = (num) => num > 0 && Number.isInteger(num) && num < 10_000;

let dictionary;
let usedNumbers;

const refreshDictionaries = () => {
  dictionary = {};
  usedNumbers = {};

  START.forEach((num) => (dictionary[num] = [String(num)]));
  START.forEach((num, index) => (usedNumbers[num] = 2 ** index));
};
refreshDictionaries();

// TODO this is so lazy; accommodate for operations that flip the inputs
const stringifyOperation = (a, b, operationKey, result) =>
  `${OPERATION_STRINGS[operationKey]} ${a} ${b}: ${result}`;

while (true) {
  const dictionaryKeys = Object.keys(dictionary);
  const dictionaryKeyLength = dictionaryKeys.length;

  if (dictionaryKeyLength > DICTIONARY_LENGTH_LIMIT) {
    // XXX Bad luck, it's surprisingly faster if we just start again here.
    console.log(
      `Didn't hit after ${DICTIONARY_LENGTH_LIMIT} numbers discovered; let's clear out the dictionary.`
    );
    refreshDictionaries();
    continue;
  }

  // pick a random number we have access to
  const firstKey = ~~(Math.random() * dictionaryKeyLength);
  let secondKey = firstKey; // XXX hack for loop
  while (firstKey === secondKey) {
    secondKey = ~~(Math.random() * dictionaryKeyLength);
  }

  // pick a random operation
  const operationKey = ~~(Math.random() * OPERATIONS_LENGTH);
  const operation = OPERATIONS[operationKey];

  const first = dictionaryKeys[firstKey];
  const second = dictionaryKeys[secondKey];

  if (!startIsValid(first, second)) {
    continue;
  }

  const result = operation(Number(first), Number(second));

  if (!resIsValid(result)) {
    continue;
  }

  if (result === TARGET) {
    console.log(
      [
        ...dictionary[first],
        ...dictionary[second],
        stringifyOperation(first, second, operationKey, result),
      ].join("\n")
    );
    break;
  }

  const path = [
    ...dictionary[first],
    ...dictionary[second],
    stringifyOperation(first, second, operationKey, result),
  ];

  // I _think_ this is right?
  if (path.length > 11) {
    continue;
  }

  const existingPath = dictionary[result];
  // XXX technically there will be ways to get to a number that use the same
  //     derived number twice, but _surely_ there's other ways to get there, so
  //     let's just skip that case.
  if (!existingPath) {
    dictionary[result] = [];
  } else if (existingPath.length <= path.length) {
    continue;
  }

  usedNumbers[result] = usedNumbers[first] | usedNumbers[second];
  dictionary[result] = path;
}
