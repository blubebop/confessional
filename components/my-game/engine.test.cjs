// Run: node components/my-game/engine.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const file = require.resolve('./engine.ts');
const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loaded = new Module(file, module);
loaded._compile(compiled, file);
const e = loaded.exports;
let boards = 0;
for (const sins of e.RISKS) {
  const seen = new Set();
  const total = e.combinations(16, sins);
  const occupancy = Array(16).fill(0);
  for (let rank = 0; rank < total; rank++) {
    const board = e.boardFromRank(rank, sins);
    assert.equal(board.length, sins);
    assert.equal(new Set(board).size, sins);
    for (const id of board) { assert.ok(id >= 0 && id < 16); occupancy[id]++; }
    seen.add(board.join(','));
    const word = '0x' + rank.toString(16).padStart(64, '0');
    assert.deepEqual(e.boardFromDemoWord(word, sins), board);
    boards++;
  }
  assert.equal(seen.size, total);
  assert.ok(occupancy.every((n) => n === total * sins / 16));
  let previous = 0;
  const factors = [];
  for (let r = 1; r <= 16 - sins; r++) {
    let probability = 1;
    for (let i = 0; i < r; i++) probability *= (16 - sins - i) / (16 - i);
    assert.ok(Math.abs(e.survivalProbability(sins, r) - probability) < 1e-12);
    const factor = e.fairDemoFactor(sins, r);
    assert.ok(factor > previous);
    assert.ok(factor / 10000 <= 1 / probability + 1e-8);
    assert.ok(Math.abs(factor / 10000 - 1 / probability) < .00010001);
    previous = factor; factors.push(factor);
  }
  assert.equal(factors.at(-1), total * 10000);
  const round = e.createRound('123', '0x' + '391'.padStart(64, '0'), 5, sins, factors);
  assert.throws(() => e.cashOut(round));
  const safe = Array.from({ length: 16 }, (_, i) => i).filter((i) => !round.sinPanelIds.includes(i));
  const first = e.revealPanel(round, safe[0]);
  assert.throws(() => e.revealPanel(first, safe[0]));
  assert.throws(() => e.revealPanel(round, -1));
  assert.throws(() => e.revealPanel(round, 16));
  const win = e.cashOut(first);
  assert.equal(win.outcome, 'cashout');
  assert.equal(win.finalPayoutFactor, factors[0]);
  assert.throws(() => e.cashOut(win));
  assert.throws(() => e.revealPanel(win, safe[1]));
  const lost = e.revealPanel(first, round.sinPanelIds[0]);
  assert.equal(lost.outcome, 'sin'); assert.equal(lost.finalPayoutFactor, 0);
  let complete = round;
  for (const id of safe) complete = e.revealPanel(complete, id);
  assert.equal(complete.outcome, 'complete'); assert.equal(complete.finalPayoutFactor, factors.at(-1));
  for (const saved of [win, lost, complete]) {
    const before = JSON.stringify(saved);
    for (let n = 0; n <= saved.selections.length; n++) {
      const frame = e.replayFrame(saved, n);
      assert.deepEqual(frame.selections, saved.selections.slice(0, n));
      assert.equal(frame.finalPayoutFactor, saved.selections[n - 1]?.payoutFactor ?? 0);
    }
    assert.equal(JSON.stringify(saved), before);
  }
  assert.equal(round.selections.length, 0, 'Original immutable round must be unchanged');
}
for (const invalid of [0, 1, 3, 16, NaN]) assert.throws(() => e.boardFromRank(0, invalid));
assert.throws(() => e.boardFromDemoWord('garbage', 4));
assert.throws(() => e.createRound('1', '0x' + '0'.repeat(64), NaN, 4, []));
assert.deepEqual(e.initialState(), e.initialState());
assert.equal(e.initialState().round, null);
assert.equal(e.initialState().previousRound, null);
assert.equal(e.formatBlessing(32647), '3.26x');
console.info(`PASS: ${boards} unique boards, every risk and reveal payout, loss, cashout, completion, immutable replay, input guards.`);
