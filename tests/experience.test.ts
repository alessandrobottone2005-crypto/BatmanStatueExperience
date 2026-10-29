import { test } from "node:test";
import assert from "node:assert/strict";
import {
  experienceReducer as reduce,
  initialExperience as initial,
  phaseFromHash,
} from "../src/lib/experience";
import {
  canApplyPromo,
  EMPTY_FORM,
  orderTotal,
  validateCheckout,
} from "../src/lib/checkout";
test("confirmation cannot be opened without a valid checkout", () => {
  assert.equal(
    reduce(initial, { type: "navigate", phase: "thankyou" }).phase,
    "showreel",
  );
  assert.equal(
    reduce(initial, { type: "purchase", order: { quantity: 1, total: 760 } })
      .phase,
    "intro",
  );
  const checkout = reduce(initial, { type: "navigate", phase: "checkout" });
  for (const order of [
    { quantity: 0, total: 760 },
    { quantity: 1, total: 0 },
    { quantity: 6, total: 1000 },
    { quantity: 1, total: NaN },
  ])
    assert.equal(
      reduce(checkout, { type: "purchase", order }).phase,
      "checkout",
    );
  assert.equal(
    reduce(checkout, { type: "purchase", order: { quantity: 1, total: 760 } })
      .phase,
    "thankyou",
  );
});
test("full mission, bonus prerequisites and speedrun require five clues", () => {
  let s = reduce(initial, { type: "tutorial" });
  s = reduce(s, { type: "start" });
  assert.equal(reduce(s, { type: "win", time: 40 }).phase, "batcomputer");
  s = reduce(s, { type: "progress", count: 2 });
  s = reduce(s, { type: "next" });
  assert.equal(s.phase, "transition1");
  s = reduce(s, { type: "next" });
  assert.equal(s.phase, "armeria");
  s = reduce(s, { type: "progress", count: 3 });
  s = reduce(s, { type: "next" });
  s = reduce(s, { type: "next" });
  assert.equal(s.phase, "batmobile");
  s = reduce(s, { type: "progress", count: 5 });
  const win = reduce(s, { type: "win", time: 89 });
  assert.equal(win.status, "succeeded");
  assert.equal(win.speedrun, true);
  assert.equal(reduce(s, { type: "win", time: 90 }).speedrun, false);
});
test("failure exit clears failure and cannot silently earn rewards", () => {
  let s = reduce(reduce(initial, { type: "tutorial" }), { type: "start" });
  s = reduce(s, { type: "fail" });
  assert.equal(reduce(s, { type: "next" }), s);
  s = reduce(s, { type: "navigate", phase: "showreel" });
  assert.equal(s.status, "idle");
  assert.equal(s.speedrun, false);
  assert.deepEqual(reduce(s, { type: "reset" }), {
    ...initial,
    run: s.run + 1,
  });
});
test("hash routes are restricted to public screens", () => {
  assert.equal(phaseFromHash("#statua"), "showreel");
  assert.equal(phaseFromHash("#checkout"), "checkout");
  assert.equal(phaseFromHash("#armeria"), "intro");
});
test("promo is a session reward and totals remain consistent", () => {
  assert.equal(canApplyPromo("SPEEDRUN15", false), false);
  assert.equal(canApplyPromo(" speedrun15 ", true), true);
  assert.equal(orderTotal(1, false), 760);
  assert.equal(orderTotal(2, true), 1250);
});
test("form validates normalized digits, expiry, phone and conditional billing", () => {
  const valid = {
    ...EMPTY_FORM,
    fullName: "Mario Demo",
    email: "mario@example.com",
    phone: "3330000000",
    address: "Via Demo",
    civico: "87",
    cap: "00100",
    city: "Roma",
    provincia: "RM",
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "12/30",
    cardOwner: "Mario Demo",
    cardCvv: "123",
  };
  const now = new Date(2026, 9, 29);
  assert.deepEqual(validateCheckout(valid, false, now), {});
  const bad = validateCheckout(
    {
      ...valid,
      cardNumber: "1               ",
      cardExpiry: "01/00",
      phone: "abc",
    },
    false,
    now,
  );
  assert.ok(bad.cardNumber && bad.cardExpiry && bad.phone);
  assert.ok(validateCheckout(valid, true, now).billingAddress);
  assert.deepEqual(
    validateCheckout({ ...valid, cardExpiry: "10/26" }, false, now),
    {},
  );
});
