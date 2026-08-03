import { Page , Locator} from "@playwright/test";
import { BasePage } from "./base-page";

export class ExperiencePage extends BasePage{
    readonly experiencesHeading: Locator;
    readonly experiencesSubheading: Locator;
    readonly createExperienceButton: Locator;
    readonly searchInput: Locator;
    readonly categoryFilter: Locator;
    readonly sortFilter: Locator;
    readonly statusFilter: Locator;
    readonly clearFiltersButton: Locator;
    readonly cardGrid: Locator;
    readonly cards: Locator;
    readonly cardTitles: Locator;
    readonly emptyStateHeading: Locator;
    readonly emptyStateHint: Locator;

    constructor(page: Page){
        super(page);
        this.experiencesHeading = page.getByRole('heading' , {name: "Experiences"});
        this.experiencesSubheading = this.experiencesHeading.locator('xpath=following-sibling::p[1]');
        this.createExperienceButton = page.getByRole('link', { name: 'Create Experience' });
        this.searchInput = page.getByPlaceholder('Search experiences...');
        this.categoryFilter = page.locator('select').nth(0);
        this.sortFilter = page.locator('select').nth(1);
        this.statusFilter = page.locator('select').nth(2);
        this.clearFiltersButton = page.getByRole('button', { name: 'Clear filters' });
        this.cardGrid = page.locator('div.grid');
        this.cards = this.cardGrid.locator(':scope > div');
        this.cardTitles = this.cardGrid.locator('h3');
        this.emptyStateHeading = page.getByRole('heading', { name: 'No matching experiences' });
        this.emptyStateHint = page.getByText('Try adjusting your search or filters');
    }

    async open(){
        const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com').origin;
        await super.goto(`${origin}/experiences`);

        await this.experiencesHeading.waitFor({ state: 'visible' });
        await this.cardTitles.first().waitFor({ state: 'visible', timeout: 30000 });
    }

    async search(query: string){
        await this.searchInput.fill(query);
    }

    async clearSearch(){
        await this.searchInput.fill('');
    }

    experienceCard(name: string): Locator {
        return this.page.locator('h3', { hasText: name }).locator('..');
    }

    async viewExperience(name: string){
        await this.experienceCard(name).getByRole('button', { name: 'View' }).click();
    }

    async filterByCategory(label: string){
        await this.categoryFilter.selectOption({ label });
    }

    async filterByCategorySlug(slug: string){
        await this.categoryFilter.selectOption(slug);
    }

    async sortBy(label: string){
        await this.sortFilter.selectOption({ label });
    }

    async filterByStatus(label: string){
        await this.statusFilter.selectOption({ label });
    }

    async visibleCardTitles(): Promise<string[]> {
        const titles = await this.cardTitles.allTextContents();
        return titles.map(t => t.trim());
    }

    private async optionLabels(select: Locator, onlyDisabled = false): Promise<string[]> {
        return select.locator('option').evaluateAll(
            (options, disabledOnly) =>
                (options as HTMLOptionElement[])
                    .filter(o => !disabledOnly || o.disabled)
                    .map(o => (o.textContent ?? '').trim()),
            onlyDisabled
        );
    }

    sortOptionLabels(){ return this.optionLabels(this.sortFilter); }
    disabledSortOptionLabels(){ return this.optionLabels(this.sortFilter, true); }
    statusOptionLabels(){ return this.optionLabels(this.statusFilter); }
}
