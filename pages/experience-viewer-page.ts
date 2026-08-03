import { Page, Locator } from "@playwright/test";
import { BasePage } from "./base-page";

export class ExperienceViewerPage extends BasePage {
    readonly canvas: Locator;
    readonly loadingIndicator: Locator;

    constructor(page: Page) {
        super(page);
        // #webgl-canvas is a hidden 1x1 helper canvas three.js keeps around internally.
        this.canvas = page.locator('canvas[data-engine]:not(#webgl-canvas)');
        this.loadingIndicator = page.getByText('Loading experience...');
    }

    // Keep this comfortably below the spec's test timeout, or the wait gets killed
    // mid-flight and you get a confusing "test timeout" instead of a real diagnosis.
    async waitForModelToLoad(timeoutMs: number = 60000) {
        const deadline = Date.now() + timeoutMs;
        const remaining = () => Math.max(0, deadline - Date.now());

        // The loader shows up a few seconds after navigation, not immediately —
        // don't let its absence at t=0 be mistaken for "already finished loading".
        await this.loadingIndicator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await this.loadingIndicator.waitFor({ state: 'hidden', timeout: remaining() });
        await this.canvas.waitFor({ state: 'visible', timeout: remaining() });

        // The overlay disappearing does NOT mean the scene finished painting: this
        // app applies the experience's background last, so there's a window where
        // the canvas is stably showing an unstyled grey scene. Soft-wait for it —
        // not every experience necessarily has a gradient background, so a miss
        // here shouldn't fail the test, it just falls through to the frame check.
        await this.page
            .waitForFunction(
                () => {
                    const c = document.querySelector('canvas[data-engine]:not(#webgl-canvas)');
                    return !!c && (c.getAttribute('style') ?? '').includes('gradient');
                },
                undefined,
                { timeout: Math.min(10000, remaining()) }
            )
            .catch(() => {});

        // The authoritative signal: the rendered frame itself has stopped changing.
        // This subsumes overlay flicker, late textures, and camera settling in one
        // check, and is what the screenshot assertions actually depend on.
        await this.waitForStableFrame(deadline);
    }

    // Playwright's own toHaveScreenshot stability check only compares two frames
    // ~100ms apart, which a slow progressive load can easily satisfy mid-render.
    private async waitForStableFrame(deadline: number, requiredMatches: number = 3, intervalMs: number = 500) {
        let previous: Buffer | null = null;
        let matches = 0;

        while (Date.now() < deadline) {
            const frame = await this.captureFrame();
            matches = previous?.equals(frame) ? matches + 1 : 0;
            previous = frame;

            if (matches >= requiredMatches) return;
            await this.page.waitForTimeout(intervalMs);
        }

        throw new Error(
            `3D scene never produced ${requiredMatches} consecutive identical frames before the deadline — it is still rendering or animating.`
        );
    }

    // No window.camera / zoom control is exposed by the app, so zoom/rotate are
    // driven the same way a user would (wheel, drag) and verified via rendered
    // canvas frames rather than a camera property.
    async zoom(deltaY: number = -300, times: number = 5) {
        const box = await this.canvas.boundingBox();
        if (!box) throw new Error('Canvas is not visible');
        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        for (let i = 0; i < times; i++) {
            await this.page.mouse.wheel(0, deltaY);
        }
    }

    async rotate(dx: number, dy: number = 0) {
        const box = await this.canvas.boundingBox();
        if (!box) throw new Error('Canvas is not visible');
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        await this.page.mouse.move(cx, cy);
        await this.page.mouse.down();
        await this.page.mouse.move(cx + dx, cy + dy, { steps: 20 });
        await this.page.mouse.up();
    }

    async captureFrame() {
        return this.canvas.screenshot();
    }
}
