import { Page , Locator} from "@playwright/test";
import { BasePage } from "./base-page";

export class ExperiencePage extends BasePage{
    readonly experiencesHeading: Locator;
    readonly searchInput: Locator;

    constructor(page: Page){
        super(page);
        this.experiencesHeading = page.getByRole('heading' , {name: "Experiences"});
        this.searchInput = page.getByPlaceholder('Search experiences...');
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

}