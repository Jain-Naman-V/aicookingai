const assert = require("assert");

// Replicate core logic functions to test in isolation
function isIngredientInPantry(ing, pantryList) {
  const clean = (str) => str.toLowerCase().replace(/[(),.-]/g, ' ').replace(/\s+/g, ' ').trim();
  const singularize = (str) => str.replace(/s\b/g, '').replace(/es\b/g, '');
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const cr = clean(ing);
  const crSingular = singularize(cr);
  
  return pantryList.some(p => {
    const cp = clean(p);
    const cpSingular = singularize(cp);
    
    if (cr === cp || crSingular === cpSingular) return true;
    
    if (cr.includes(cp) || cp.includes(cr) || crSingular.includes(cpSingular) || cpSingular.includes(crSingular)) {
      return true;
    }
    
    try {
      const regexP = new RegExp('\\b' + escapeRegExp(cpSingular) + '\\b');
      const regexR = new RegExp('\\b' + escapeRegExp(crSingular) + '\\b');
      return regexP.test(crSingular) || regexR.test(cpSingular);
    } catch (e) {
      return false;
    }
  });
}

// Color helpers for terminal output
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;

let passedCount = 0;
let failedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`${green("✓")} ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`${red("✗")} ${name}`);
    console.error(`  Error: ${err.message}`);
    failedCount++;
  }
}

console.log("Running ChefFlow AI CLI Test Suite...\n");

runTest("Pantry match exact", () => {
  assert.strictEqual(isIngredientInPantry("tomato", ["tomato", "onion"]), true);
});

runTest("Pantry match case-insensitive", () => {
  assert.strictEqual(isIngredientInPantry("Tomato", ["tomato", "onion"]), true);
});

runTest("Pantry match plural/singular boundary", () => {
  assert.strictEqual(isIngredientInPantry("fresh organic tomatoes", ["tomato"]), true);
});

runTest("Pantry match partial string", () => {
  assert.strictEqual(isIngredientInPantry("bell pepper", ["red bell pepper"]), true);
});

runTest("Pantry mismatch", () => {
  assert.strictEqual(isIngredientInPantry("chicken", ["tomato", "onion"]), false);
});

// Mock budget bounds validation
const validateBudgetMock = (val) => !isNaN(val) && val >= 10 && val <= 10000;

runTest("Budget validation valid min", () => {
  assert.strictEqual(validateBudgetMock(10), true);
});

runTest("Budget validation valid max", () => {
  assert.strictEqual(validateBudgetMock(10000), true);
});

runTest("Budget validation invalid below min", () => {
  assert.strictEqual(validateBudgetMock(5), false);
});

runTest("Budget validation invalid above max", () => {
  assert.strictEqual(validateBudgetMock(15000), false);
});

// Mock people bounds validation
const validatePeopleMock = (val) => !isNaN(val) && val >= 1 && val <= 20;

runTest("People count valid min", () => {
  assert.strictEqual(validatePeopleMock(1), true);
});

runTest("People count valid max", () => {
  assert.strictEqual(validatePeopleMock(20), true);
});

runTest("People count invalid zero", () => {
  assert.strictEqual(validatePeopleMock(0), false);
});

console.log(`\nTest Run Completed: ${green(`${passedCount} passed`)}, ${failedCount > 0 ? red(`${failedCount} failed`) : "0 failed"}`);

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
