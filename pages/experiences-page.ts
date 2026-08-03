import { Page } from '@playwright/test';
import { CatalogPage, CatalogFixture } from './catalog-page';
import experiencesData from '../fixtures/experiences.json';

export class ExperiencePage extends CatalogPage {
  constructor(page: Page) {
    super(page, experiencesData as CatalogFixture);
  }

  async viewExperience(name: string) {
    await this.card(name).getByRole('button', { name: 'View' }).click();
  }
}
