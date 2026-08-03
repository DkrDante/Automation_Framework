import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class MaterialManagementPage extends BasePage {
  readonly heading: Locator;
  readonly subTitle: Locator;
  readonly addNewBtn: Locator;
  readonly materialsHeader: Locator;
  readonly reloadBtn: Locator;
  readonly solidColourOption: Locator;
  readonly addSolidColourHeading: Locator;
  readonly nameInput: Locator;
  readonly colorInput: Locator;
  readonly uploadSolidColourBtn: Locator;
  readonly saveChangesBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Material Management' });
    this.subTitle = page.getByText('Upload, organize, and manage PBR (Physically-Based Rendering) materials to customize the look and feel of your 3D models.');
    this.addNewBtn = page.getByRole('button', { name: 'Add New' });
    this.materialsHeader = page.getByText(/Materials \(\d+\)/);
    this.reloadBtn = page.getByRole('button', { name: 'Reload' });
    this.solidColourOption = page.getByText('Solid Colour', { exact: true });
    this.addSolidColourHeading = page.getByRole('heading', { name: 'Add New Solid Colour' });
    this.nameInput = page.getByPlaceholder('e.g. Cherry Red, Ocean Blue');
    this.colorInput = page.locator('input[type="color"]');
    this.uploadSolidColourBtn = page.getByRole('button', { name: 'Upload Solid Colour' });
    this.saveChangesBtn = page.getByRole('button', { name: 'Save Changes' });
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await super.goto(`${origin}/material-presets/manage`);
    // Materials list (and the Reload/Add New buttons alongside it) render asynchronously
    // after the shell — wait once here so assertions aren't racing that load under concurrent workers.
    await this.materialsHeader.waitFor({ state: 'visible', timeout: 30000 });
  }

  /** The material card whose name label matches `displayName` exactly. */
  materialCard(displayName: string): Locator {
    return this.page.locator('div.text-center').filter({
      has: this.page.getByText(displayName, { exact: true }),
    });
  }

  uploadSuccessMessage(): Locator {
    return this.page.getByText('Uploaded successfully!');
  }

  /** Heading shown while editing an existing solid colour material. */
  editHeading(displayName: string): Locator {
    return this.page.getByRole('heading', { name: `Edit Solid Colour — ${displayName}` });
  }

  /**
   * Submit the edit form and wait for the save to actually land.
   *
   * "Save Changes" is not a single update request — the app DELETEs the existing
   * preset and POSTs a replacement (the material's id changes in the process), then
   * refetches the list. The form only closes once that whole chain resolves, which
   * regularly outruns a 5s assertion timeout when workers are competing for the live
   * backend. Waiting on the POST means callers assert against a settled page.
   */
  async saveChanges() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/material-presets') && response.request().method() === 'POST'
    );
    await this.saveChangesBtn.click();
    return responsePromise;
  }

  /** Row-scoped "Edit texture" icon button — opens the edit form pre-filled with current values. */
  editBtn(displayName: string): Locator {
    return this.materialCard(displayName).getByRole('button', { name: 'Edit texture' });
  }

  /** Row-scoped "Delete texture" icon button — triggers a native browser confirm() dialog. */
  deleteBtn(displayName: string): Locator {
    return this.materialCard(displayName).getByRole('button', { name: 'Delete texture' });
  }
}
