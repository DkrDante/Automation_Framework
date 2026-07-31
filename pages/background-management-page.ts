import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class BackgroundManagementPage extends BasePage {
  readonly heading: Locator;
  readonly subTitle: Locator;
  readonly addNewHdriHeading: Locator;
  readonly displayNameLabel: Locator;
  readonly displayNameInput: Locator;
  readonly chooseHdriBtn: Locator;
  readonly fileHelperText: Locator;
  readonly uploadHdriBtn: Locator;
  readonly hdriCatalogHeader: Locator;
  readonly reloadBtn: Locator;
  readonly nameColumnHeader: Locator;
  readonly fileSizeColumnHeader: Locator;
  readonly updatedByColumnHeader: Locator;
  readonly actionsColumnHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'HDRI Manager' });
    this.subTitle = page.getByText('Upload, manage, and assign global HDRI environments to enhance your 3D scenes with realistic lighting and backgrounds.');
    this.addNewHdriHeading = page.getByText('Add New HDRI', { exact: true });
    this.displayNameLabel = page.getByText('Display name', { exact: true });
    this.displayNameInput = page.getByLabel('Display name');
    this.chooseHdriBtn = page.getByRole('button', { name: 'Choose HDRI' });
    this.fileHelperText = page.getByText('Supported types: .hdr · 50 MB limit');
    this.uploadHdriBtn = page.getByRole('button', { name: 'Upload HDRI' });
    this.hdriCatalogHeader = page.getByText(/HDRI Catalog \(\d+\)/);
    this.reloadBtn = page.getByRole('button', { name: 'Reload' });
    this.nameColumnHeader = page.getByRole('columnheader', { name: 'Name' });
    this.fileSizeColumnHeader = page.getByRole('columnheader', { name: 'File Size (MB)' });
    this.updatedByColumnHeader = page.getByRole('columnheader', { name: 'Updated By' });
    this.actionsColumnHeader = page.getByRole('columnheader', { name: 'Actions' });
  }

  async open() {
    const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com/login').origin;
    await this.page.goto(`${origin}/hdri/manage`, { waitUntil: 'networkidle' });
  }
}
