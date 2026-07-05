const assert = require('assert');
const { parseFilterListToDNRRules } = require('../scripts/build-filters.js');

const sampleText = `
[Adblock Plus 2.0]
! Title: EasyList
! Last modified: 19 Aug 2024
||ad.doubleclick.net^$script,image
@@||whitelist.com^
##.ad-banner
#@#.ad-banner-exception
||baddomain.com^
`;

const rules = parseFilterListToDNRRules(sampleText, 1);

assert.strictEqual(rules.length, 3, 'Should parse exactly 3 rules');

// Rule 1
assert.strictEqual(rules[0].id, 1);
assert.strictEqual(rules[0].priority, 1);
assert.strictEqual(rules[0].action.type, 'block');
assert.strictEqual(rules[0].condition.urlFilter, '||ad.doubleclick.net^');
assert.deepStrictEqual(rules[0].condition.resourceTypes, ['script', 'image']);

// Rule 2
assert.strictEqual(rules[1].id, 2);
assert.strictEqual(rules[1].priority, 2);
assert.strictEqual(rules[1].action.type, 'allow');
assert.strictEqual(rules[1].condition.urlFilter, '||whitelist.com^');
assert.strictEqual(rules[1].condition.resourceTypes, undefined);

// Rule 3
assert.strictEqual(rules[2].id, 3);
assert.strictEqual(rules[2].priority, 1);
assert.strictEqual(rules[2].action.type, 'block');
assert.strictEqual(rules[2].condition.urlFilter, '||baddomain.com^');

console.log('All tests passed!');
