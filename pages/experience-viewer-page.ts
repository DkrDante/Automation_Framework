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

    async waitForModelToLoad() {
        // The loader shows up a few seconds after navigation, not immediately —
        // don't let its absence at t=0 be mistaken for "already finished loading".
        await this.loadingIndicator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

        // The overlay can go hidden and reappear across more than one loading phase
        // (initial load, then textures/hotspots) — require it to stay hidden for a
        // full second before treating the model as actually ready, or a screenshot
        // taken right in that gap ends up mid-load.
        const deadline = Date.now() + 45000;
        while (Date.now() < deadline) {
            await this.loadingIndicator.waitFor({ state: 'hidden', timeout: deadline - Date.now() });
            await this.page.waitForTimeout(1000);
            if (!(await this.loadingIndicator.isVisible())) break;
        }

        await this.canvas.waitFor({ state: 'visible' });
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
