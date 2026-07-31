import { test, expect } from '../../helpers/auth-fixtures';
import { ExperiencePage } from '../../pages/experiences-page';
import { ExperienceViewerPage } from '../../pages/experience-viewer-page';

test.describe('Experiences', { tag: ['@temp'] }, () => {


  test('Level 4 - Scrolling over the model zooms the view', async ({ page }, testInfo) => {
    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.search('uno');
    await experiencePage.viewExperience('Uno Experience');

    const viewerPage = new ExperienceViewerPage(page);
    await viewerPage.waitForModelToLoad();

    // No window.camera is exposed by the app, so verify via the rendered frame
    // rather than a camera property: zooming must change what's on screen.
    const before = await viewerPage.captureFrame();
    await testInfo.attach('before-zoom', { body: before, contentType: 'image/png' });

    await viewerPage.zoom();

    const after = await viewerPage.captureFrame();
    await testInfo.attach('after-zoom', { body: after, contentType: 'image/png' });

    expect(before.equals(after)).toBe(false);
  });

  test('Level 4b - Scrolling over the model zooms the view (Playwright snapshot)', async ({ page }, testInfo) => {
    const experiencePage = new ExperiencePage(page);
    await experiencePage.open();
    await experiencePage.search('uno');
    await experiencePage.viewExperience('Uno Experience');

    const viewerPage = new ExperienceViewerPage(page);
    await viewerPage.waitForModelToLoad();

    await testInfo.attach('baseline', { path: testInfo.snapshotPath('uno-experience-default.png'), contentType: 'image/png' });
    await testInfo.attach('captured-before-zoom', { body: await viewerPage.captureFrame(), contentType: 'image/png' });

    // Baseline snapshot of the un-zoomed view, committed to the repo. Playwright
    // diffs against this pixel-by-pixel and attaches actual/expected/diff images
    // to the report on mismatch — no manual buffer compare or attach() needed.
    await expect(viewerPage.canvas).toHaveScreenshot('uno-experience-default.png');

    await viewerPage.zoom();

    await testInfo.attach('captured-after-zoom', { body: await viewerPage.captureFrame(), contentType: 'image/png' });

    // Zooming must visibly diverge from that same baseline.
    await expect(viewerPage.canvas).not.toHaveScreenshot('uno-experience-default.png');
  });
});
