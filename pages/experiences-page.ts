import { Page , Locator} from "@playwright/test";
import { BasePage } from "./base-page";

export class ExperiencePage extends BasePage{
    readonly experiencesHeading: Locator;
    readonly searchInput: Locator;
    // None of the 3 filter <select>s expose an aria-label/name — positional order
    // (category, sort, status) is the only thing to key off of.
    readonly categoryFilter: Locator;
    readonly sortFilter: Locator;
    readonly statusFilter: Locator;

    constructor(page: Page){
        super(page);
        this.experiencesHeading = page.getByRole('heading' , {name: "Experiences"});
        this.searchInput = page.getByPlaceholder('Search experiences...');
        this.categoryFilter = page.locator('select').nth(0);
        this.sortFilter = page.locator('select').nth(1);
        this.statusFilter = page.locator('select').nth(2);
    }

    async open(){
        const origin = new URL(process.env.BASE_URL ?? 'https://try.satorixr.com').origin;
        await super.goto(`${origin}/experiences`);

        await this.experiencesHeading.waitFor({ state: 'visible' });
    }

    async search(query: string){
        await this.searchInput.fill(query);
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

    async sortBy(label: string){
        await this.sortFilter.selectOption({ label });
    }

    async filterByStatus(label: string){
        await this.statusFilter.selectOption({ label });
    }

    async visibleCardTitles(): Promise<string[]> {
        const titles = await this.page.locator('h3').allTextContents();
        return titles.map(t => t.trim());
    }

}