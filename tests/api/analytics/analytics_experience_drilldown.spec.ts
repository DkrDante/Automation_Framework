import { test, expect } from '../../../helpers/api-fixtures';
import drilldownData from '../../../fixtures/analytics_experience_drilldown.json';

let targetExperienceId: string;
let dashboardResponse: any;
let eventsResponse: any;
let summaryResponse: any;

test.beforeAll(async ({ dashboardApi }) => {
    const filtersResponse = await dashboardApi.getAnalyticsFilters();
    const targetExperience = filtersResponse.data.experiences.find(
        (exp: any) => exp.name.trim() === drilldownData.target_experience_name
    );
    targetExperienceId = targetExperience?.id;

    dashboardResponse = await dashboardApi.getAnalyticsDashboard(targetExperienceId);
    eventsResponse = await dashboardApi.getAnalyticsEvents(targetExperienceId);
    summaryResponse = await dashboardApi.getAnalyticsSummary(targetExperienceId);
});

test.describe('Analytics Experience Drilldown API', { tag: ['@api', '@regression'] }, () => {
    test('target experience is present in filter options', () => {
        expect(targetExperienceId).toBeTruthy();
    });

    test('dashboard_filters_echo_selected_experience_id', () => {
        expect(dashboardResponse.data.filters.experienceId).toBe(targetExperienceId);
    });

    test('dashboard_experiences_section_scoped_to_one_experience', () => {
        expect(dashboardResponse.data.experiences.totalExperiences).toBe(1);
    });

    test('dashboard_most_viewed_experiences_all_match_selected_experience', () => {
        const list = dashboardResponse.data.experiences.mostViewedExperiences;
        for (const exp of list) {
            expect(exp.experienceId).toBe(targetExperienceId);
        }
    });

    test('events_filters_applied_echo_selected_experience_id', () => {
        expect(eventsResponse.data.filters.applied.experienceId).toBe(targetExperienceId);
    });

    test('events_total_matches_events_array_length', () => {
        expect(eventsResponse.data.total).toBe(eventsResponse.data.events.length);
    });

    test('events_all_events_belong_to_selected_experience', () => {
        for (const event of eventsResponse.data.events) {
            expect(event.experienceId).toBe(targetExperienceId);
        }
    });

    test('summary_scoped_to_single_unique_experience', () => {
        expect(summaryResponse.data.summary.uniqueExperiences).toBe(1);
    });

    test('summary_experience_views_key_matches_selected_experience_id', () => {
        const views = summaryResponse.data.summary.experienceViews;
        expect(Object.keys(views)).toEqual([targetExperienceId]);
    });
});
