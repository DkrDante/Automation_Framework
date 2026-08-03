import { test, expect } from '../../helpers/auth-fixtures';
import { ExperiencePage } from '../../pages/experiences-page';
import { ExperienceViewerPage } from '../../pages/experience-viewer-page';

test('explore: hunt for public share link mechanism', async ({ page, context }) => {
  test.setTimeout(180_000);

  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  const experiencePage = new ExperiencePage(page);
  await experiencePage.open();

  const titles = await experiencePage.visibleCardTitles();
  console.log('CARD TITLES:', titles);
  const name = titles[0];
  console.log('Using experience:', name);

  const card = experiencePage.card(name);
  const cardHtml = await card.innerHTML();
  console.log('=== CARD HTML (first 3000 chars) ===');
  console.log(cardHtml.slice(0, 3000));

  // Look for any share/link icon/button on the card itself
  const shareCandidatesOnCard = card.locator(
    'button, a, [aria-label], [title], svg'
  );
  const countOnCard = await shareCandidatesOnCard.count();
  console.log('Elements (button/a/aria-label/title/svg) on card:', countOnCard);
  for (let i = 0; i < countOnCard; i++) {
    const el = shareCandidatesOnCard.nth(i);
    const tag = await el.evaluate((n) => n.tagName);
    const aria = await el.getAttribute('aria-label');
    const title = await el.getAttribute('title');
    const text = (await el.textContent())?.trim().slice(0, 40);
    if (aria || title || (text && text.length > 0)) {
      console.log(`  [card] tag=${tag} aria-label=${aria} title=${title} text="${text}"`);
    }
  }

  // ---- Try Edit page ----
  console.log('=== Opening Edit page ===');
  await card.getByRole('button', { name: 'Edit' }).click();
  await page.waitForTimeout(3000);
  console.log('EDIT URL:', page.url());

  const editButtons = page.locator('button, a, [aria-label], [title]');
  const editCount = await editButtons.count();
  console.log('Total interactive elements on Edit page:', editCount);
  for (let i = 0; i < editCount; i++) {
    const el = editButtons.nth(i);
    const aria = await el.getAttribute('aria-label').catch(() => null);
    const title = await el.getAttribute('title').catch(() => null);
    const text = (await el.textContent().catch(() => ''))?.trim().slice(0, 50);
    const hay = `${aria ?? ''} ${title ?? ''} ${text ?? ''}`.toLowerCase();
    if (hay.includes('share') || hay.includes('link') || hay.includes('copy') || hay.includes('public')) {
      const tag = await el.evaluate((n) => n.tagName);
      console.log(`  [edit-MATCH] tag=${tag} aria-label=${aria} title=${title} text="${text}"`);
    }
  }
  // Dump full list too (smaller signal) if nothing matched
  console.log('=== Edit page: ALL buttons/links with visible text ===');
  for (let i = 0; i < editCount; i++) {
    const el = editButtons.nth(i);
    const text = (await el.textContent().catch(() => ''))?.trim();
    if (text && text.length > 0 && text.length < 60) {
      console.log(`  [edit-all] "${text}"`);
    }
  }

  // Go back to experiences list to try the internal preview viewer
  console.log('=== Opening internal preview viewer via View button ===');
  await experiencePage.open();
  const card2 = experiencePage.card(name);
  const [viewerPage] = await Promise.all([
    context.waitForEvent('page').catch(() => null),
    experiencePage.viewExperience(name),
  ]);

  const targetPage = viewerPage ?? page;
  await targetPage.waitForTimeout(3000);
  console.log('VIEWER URL:', targetPage.url());

  const viewer = new ExperienceViewerPage(targetPage);
  await viewer.waitForModelToLoad(60000).catch((e) => console.log('waitForModelToLoad failed:', e.message));

  // Dump the whole toolbar area DOM for manual inspection
  const bodyHtml = await targetPage.evaluate(() => document.body.innerHTML);
  console.log('=== VIEWER BODY HTML LENGTH ===', bodyHtml.length);

  // Search for share/link/copy related elements anywhere in the viewer
  const viewerCandidates = targetPage.locator('button, a, [aria-label], [title], [class*="share" i], [class*="link" i]');
  const viewerCount = await viewerCandidates.count();
  console.log('Viewer interactive elements count:', viewerCount);
  for (let i = 0; i < viewerCount; i++) {
    const el = viewerCandidates.nth(i);
    const aria = await el.getAttribute('aria-label').catch(() => null);
    const title = await el.getAttribute('title').catch(() => null);
    const cls = await el.getAttribute('class').catch(() => null);
    const text = (await el.textContent().catch(() => ''))?.trim().slice(0, 50);
    const hay = `${aria ?? ''} ${title ?? ''} ${cls ?? ''} ${text ?? ''}`.toLowerCase();
    if (hay.includes('share') || hay.includes('link') || hay.includes('copy')) {
      const tag = await el.evaluate((n) => n.tagName);
      console.log(`  [viewer-MATCH] tag=${tag} aria-label=${aria} title=${title} class=${cls} text="${text}"`);
    }
  }

  // Also print any elements near .brand-logo-container / .watermark-badge
  const badge = targetPage.locator('.watermark-badge, .brand-logo-container');
  const badgeCount = await badge.count();
  console.log('watermark-badge/brand-logo-container count:', badgeCount);
  if (badgeCount > 0) {
    const parentHtml = await badge.first().evaluate((n) => n.parentElement?.outerHTML ?? n.outerHTML);
    console.log('=== Parent of badge/logo container (first 4000 chars) ===');
    console.log(parentHtml.slice(0, 4000));
  }
});
