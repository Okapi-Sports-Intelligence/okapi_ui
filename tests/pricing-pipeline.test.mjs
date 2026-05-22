import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readJson(path) {
  const file = await readFile(join(root, path), "utf8");
  return JSON.parse(file);
}

async function loadConfig() {
  const [leagues, groups, bundles, pricing] = await Promise.all([
    readJson("src/config/product/leagues.json"),
    readJson("src/config/product/competition-groups.json"),
    readJson("src/config/product/bundles.json"),
    readJson("src/config/product/pricing.json"),
  ]);

  return { leagues, groups, bundles, pricing };
}

function getProductName(productKey) {
  if (productKey === "workbook") {
    return "Competition Intelligence Workbook";
  }

  if (productKey === "teamAnalysis") {
    return "Team Analysis Package";
  }

  return "Intelligence Pack";
}

function calculateQuoteFromConfig(config, items) {
  const leagueByKey = new Map(
    config.leagues.map((league) => [league.key, league]),
  );
  const groupByKey = new Map(config.groups.map((group) => [group.key, group]));
  const bundleByKey = new Map(
    config.bundles.map((bundle) => [bundle.key, bundle]),
  );
  const uniqueItems = Array.from(
    new Map(
      items.map((item) => [
        item.itemType === "bundle"
          ? `bundle:${item.bundleKey}:${item.productKey}`
          : `league:${item.leagueKey}:${item.productKey}`,
        item,
      ]),
    ).values(),
  );
  const seenLeagueKeys = new Set();
  const seenBundleKeys = new Set();
  const bundleCoveredLeagueKeys = new Map();

  for (const item of uniqueItems) {
    if (item.itemType !== "bundle") {
      continue;
    }

    assert.equal(
      seenBundleKeys.has(item.bundleKey),
      false,
      `Duplicate bundle key: ${item.bundleKey}`,
    );
    seenBundleKeys.add(item.bundleKey);

    const bundle = bundleByKey.get(item.bundleKey);
    assert.ok(bundle, `Unknown bundle key: ${item.bundleKey}`);

    for (const leagueKey of bundle.leagueKeys) {
      bundleCoveredLeagueKeys.set(leagueKey, item.bundleKey);
    }
  }

  const lineItems = uniqueItems.map((item) => {
    if (item.itemType === "bundle") {
      const { bundleKey, productKey } = item;
      const bundle = bundleByKey.get(bundleKey);
      assert.ok(bundle, `Unknown bundle key: ${bundleKey}`);
      const product = bundle.products[productKey];
      assert.ok(product, `No product configured: ${productKey}`);

      return {
        itemType: "bundle",
        bundleKey,
        displayName: bundle.name,
        productKey,
        productName: getProductName(productKey),
        coverageLeagueKeys: bundle.leagueKeys,
        coverageCount: bundle.competitionCount,
        unresolvedCoverageCount: bundle.unresolvedComponents.length,
        reviewFlag: bundle.reviewFlag,
        unitAmountCents: product.priceCents,
      };
    }

    const { leagueKey, productKey } = item;
    assert.equal(
      seenLeagueKeys.has(leagueKey),
      false,
      `Duplicate league key: ${leagueKey}`,
    );
    seenLeagueKeys.add(leagueKey);
    assert.equal(
      bundleCoveredLeagueKeys.has(leagueKey),
      false,
      `League covered by bundle: ${leagueKey}`,
    );
    const league = leagueByKey.get(leagueKey);
    assert.ok(league, `Unknown league key: ${leagueKey}`);

    const price = config.pricing[leagueKey];
    assert.ok(price, `No price configured for league key: ${leagueKey}`);
    const product = price.products[productKey];
    assert.ok(product, `No product configured: ${productKey}`);

    const group = groupByKey.get(price.groupKey);
    assert.ok(group, `Unknown group key: ${price.groupKey}`);

    return {
      itemType: "league",
      leagueKey,
      displayName: league.label,
      productKey,
      productName: getProductName(productKey),
      groupKey: group.key,
      groupLabel: group.label,
      unitAmountCents: product.priceCents,
    };
  });

  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.unitAmountCents,
    0,
  );

  return {
    currency: "usd",
    selectedCount: lineItems.length,
    subtotalCents,
    totalCents: subtotalCents,
    lineItems,
  };
}

test("product pricing config is internally consistent", async () => {
  const config = await loadConfig();
  const leagueKeys = new Set(config.leagues.map((league) => league.key));
  const groupKeys = new Set(config.groups.map((group) => group.key));
  const bundleKeys = new Set(config.bundles.map((bundle) => bundle.key));

  assert.equal(leagueKeys.size, config.leagues.length);
  assert.equal(groupKeys.size, config.groups.length);
  assert.equal(bundleKeys.size, config.bundles.length);

  for (const group of config.groups) {
    for (const leagueKey of group.leagues) {
      assert.ok(leagueKeys.has(leagueKey), `${group.key}: ${leagueKey}`);
    }
  }

  for (const [leagueKey, price] of Object.entries(config.pricing)) {
    assert.ok(leagueKeys.has(leagueKey), leagueKey);
    assert.ok(groupKeys.has(price.groupKey), `${leagueKey}: ${price.groupKey}`);
    assert.ok(Number.isInteger(price.products.workbook.priceCents), leagueKey);
    assert.ok(price.products.workbook.priceCents > 0, leagueKey);
    assert.ok(
      Number.isInteger(price.products.intelligencePack.priceCents),
      leagueKey,
    );
    assert.ok(price.products.intelligencePack.priceCents > 0, leagueKey);
    assert.ok(
      price.products.intelligencePack.priceCents >=
        price.products.workbook.priceCents,
      leagueKey,
    );
    assert.ok(Number.isInteger(price.products.teamAnalysis.priceCents), leagueKey);
    assert.ok(price.products.teamAnalysis.priceCents > 0, leagueKey);
    assert.ok(
      Number.isInteger(price.products.fullTeamReport.priceCents),
      leagueKey,
    );
    assert.ok(price.products.fullTeamReport.priceCents > 0, leagueKey);
    assert.ok(
      price.products.fullTeamReport.priceCents >=
        price.products.teamAnalysis.priceCents,
      leagueKey,
    );
    assert.ok(
      Number.isInteger(price.products.playerScoutingReport.priceCents),
      leagueKey,
    );
    assert.ok(price.products.playerScoutingReport.priceCents > 0, leagueKey);
    assert.ok(
      price.products.playerScoutingReport.priceCents >=
        price.products.intelligencePack.priceCents,
      leagueKey,
    );
  }

  for (const bundle of config.bundles) {
    for (const leagueKey of bundle.leagueKeys) {
      assert.ok(leagueKeys.has(leagueKey), `${bundle.key}: ${leagueKey}`);
    }

    assert.ok(Number.isInteger(bundle.products.workbook.priceCents), bundle.key);
    assert.ok(bundle.products.workbook.priceCents > 0, bundle.key);
    assert.ok(
      Number.isInteger(bundle.products.intelligencePack.priceCents),
      bundle.key,
    );
    assert.ok(bundle.products.intelligencePack.priceCents > 0, bundle.key);
    assert.ok(
      bundle.products.intelligencePack.priceCents >=
        bundle.products.workbook.priceCents,
      bundle.key,
    );
    assert.ok(Number.isInteger(bundle.products.teamAnalysis.priceCents), bundle.key);
    assert.ok(bundle.products.teamAnalysis.priceCents > 0, bundle.key);
  }

  const cupsBundle = config.bundles.find((bundle) => bundle.key === "CUP-PO");
  assert.ok(cupsBundle);
  assert.equal(cupsBundle.reviewFlag, "Review missing competition prices");
});

test("quote contract sums selected workbook products without discounts", async () => {
  const config = await loadConfig();
  const quote = calculateQuoteFromConfig(config, [
    { leagueKey: "mls", productKey: "workbook" },
    { leagueKey: "liga_mx", productKey: "workbook" },
  ]);

  assert.equal(quote.currency, "usd");
  assert.equal(quote.selectedCount, 2);
  assert.equal(quote.subtotalCents, 29800);
  assert.equal(quote.totalCents, 29800);
  assert.equal(Object.hasOwn(quote, "discountCents"), false);
  assert.deepEqual(
    quote.lineItems.map((item) => item.leagueKey),
    ["mls", "liga_mx"],
  );
});

test("quote contract de-duplicates selected league keys", async () => {
  const config = await loadConfig();
  const quote = calculateQuoteFromConfig(config, [
    { leagueKey: "mls", productKey: "workbook" },
    { leagueKey: "mls", productKey: "workbook" },
  ]);

  assert.equal(quote.selectedCount, 1);
  assert.equal(quote.subtotalCents, 14900);
  assert.equal(quote.totalCents, 14900);
});

test("quote contract prices intelligence packs and mixed carts", async () => {
  const config = await loadConfig();
  const packQuote = calculateQuoteFromConfig(config, [
    { leagueKey: "mls", productKey: "intelligencePack" },
  ]);
  const mixedQuote = calculateQuoteFromConfig(config, [
    { leagueKey: "mls", productKey: "workbook" },
    { leagueKey: "liga_mx", productKey: "intelligencePack" },
  ]);

  assert.equal(packQuote.subtotalCents, 29900);
  assert.equal(packQuote.lineItems[0].productName, "Intelligence Pack");
  assert.equal(mixedQuote.subtotalCents, 44800);
});

test("quote contract prices team analysis packages", async () => {
  const config = await loadConfig();
  const quote = calculateQuoteFromConfig(config, [
    { leagueKey: "mls", productKey: "teamAnalysis" },
  ]);

  assert.equal(quote.subtotalCents, 79900);
  assert.equal(quote.lineItems[0].productName, "Team Analysis Package");
});

test("quote contract prices bundles and mixed bundle carts", async () => {
  const config = await loadConfig();
  const workbookQuote = calculateQuoteFromConfig(config, [
    { itemType: "bundle", bundleKey: "MLS-CORE", productKey: "workbook" },
  ]);
  const packQuote = calculateQuoteFromConfig(config, [
    {
      itemType: "bundle",
      bundleKey: "MLS-CORE",
      productKey: "intelligencePack",
    },
  ]);
  const mixedQuote = calculateQuoteFromConfig(config, [
    { itemType: "bundle", bundleKey: "CONCACAF-VAL", productKey: "workbook" },
    { leagueKey: "mls", productKey: "workbook" },
  ]);

  assert.equal(workbookQuote.subtotalCents, 119900);
  assert.equal(packQuote.subtotalCents, 219900);
  assert.equal(mixedQuote.subtotalCents, 64800);
  assert.equal(workbookQuote.lineItems[0].itemType, "bundle");
  assert.equal(workbookQuote.lineItems[0].coverageCount, 57);
});

test("quote contract rejects unknown and unpriced league keys", async () => {
  const config = await loadConfig();

  assert.throws(
    () =>
      calculateQuoteFromConfig(config, [
        { leagueKey: "not_a_league", productKey: "workbook" },
      ]),
    /Unknown league key/,
  );

  assert.throws(
    () =>
      calculateQuoteFromConfig(config, [
        { leagueKey: "afc_u17_asian_cup", productKey: "workbook" },
      ]),
    /No price configured/,
  );

  assert.throws(
    () =>
      calculateQuoteFromConfig(config, [
        { itemType: "bundle", bundleKey: "not_a_bundle", productKey: "workbook" },
      ]),
    /Unknown bundle key/,
  );

  assert.throws(
    () =>
      calculateQuoteFromConfig(config, [
        { leagueKey: "mls", productKey: "madeUpProduct" },
      ]),
    /No product configured/,
  );
});
