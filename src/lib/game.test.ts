import assert from "node:assert";
import { crownsOf, type DeptProgress } from "./game";

function testCrownsOf() {
  assert.strictEqual(crownsOf(undefined), 0);
  assert.strictEqual(crownsOf(null!), 0);
  assert.strictEqual(crownsOf({}), 0);
  assert.strictEqual(crownsOf({ quiz: 2 }), 1);
  assert.strictEqual(crownsOf({ quiz: 4 }), 1);
  assert.strictEqual(crownsOf({ quiz: 1 }), 0);
  assert.strictEqual(crownsOf({ memory: true }), 1);
  assert.strictEqual(crownsOf({ tap: true }), 1);
  assert.strictEqual(crownsOf({ order: true }), 1);
  assert.strictEqual(crownsOf({ quiz: 2, memory: true, tap: true, order: true }), 4);
  assert.strictEqual(crownsOf({ quiz: 2, memory: true }), 2);
  console.log("✓ crownsOf tests passed");
}

function testProgressType() {
  const p: DeptProgress = { quiz: 3, memory: true, tap: false, order: true };
  assert.strictEqual(crownsOf(p), 3);
  console.log("✓ DeptProgress type test passed");
}

testCrownsOf();
testProgressType();
console.log("All tests passed!");
