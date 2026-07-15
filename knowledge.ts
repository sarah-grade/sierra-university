// Copyright Sierra

import {
    type ArticleBatch,
    fetch,
    type FetchKnowledgeInput,
    info,
    NewCrawledKnowledgeBase,
    type Scraper,
    type ExtractedContent,
    logging,
} from "@sierra/agent";
import parse from "node-html-parser";
import TurndownService from "@sierra/turndown";
import type { RidbFacility, RidbFacilitiesResponse } from "./ridb-types";

const RIDB_API_KEY = "REPLACE_WITH_YOUR_RECREATION_GOV_API_KEY";
const RIDB_PAGE_SIZE = 25;
const RIDB_MAX_FACILITIES = 100;

const htmlToMarkdown = new TurndownService({ headingStyle: "atx", linkStyle: "inlined" });

/*
 * If you want to use the Recreation.gov API for real, you need to get an API key.
 * You can get one by signing up for a developer account at https://ridb.recreation.gov/developers/
 * Then just swap it out for `RIDB_API_KEY` above.
 */
function* fetchRecreationGovFacilities(input: FetchKnowledgeInput): Generator<ArticleBatch> {
    let offset = 0;
    while (offset < RIDB_MAX_FACILITIES) {
        const limit = Math.min(RIDB_PAGE_SIZE, RIDB_MAX_FACILITIES - offset);
        const url = `https://ridb.recreation.gov/api/v1/facilities?limit=${limit}&offset=${offset}`;
        const response = fetch.jsonSync<RidbFacilitiesResponse>(url, {
            headers: { apikey: RIDB_API_KEY, accept: "application/json" },
        });

        if (response.status !== 200 || !response.body) {
            info(`Recreation.gov request failed at offset ${offset} (status ${response.status})`);
            return;
        }

        const facilities = response.body.RECDATA;
        if (facilities.length === 0) {
            info("No more facilities to fetch");
            return;
        }

        yield {
            error: null,
            articles: facilities.map(facility => ({
                title: `${facility.FacilityName} (${facility.FacilityTypeDescription})`,
                sourceUrl: `https://www.recreation.gov/camping/campgrounds/${facility.FacilityID}`,
                body: generateFacilityArticleBody(facility),
            })),
        };

        offset += facilities.length;
    }
    info(`Fetched ${offset} facilities (capped at ${RIDB_MAX_FACILITIES})`);
}

function generateFacilityArticleBody(facility: RidbFacility): string {
    const lines: string[] = [`# ${facility.FacilityName}`];

    const facts: string[] = [];
    if (facility.FacilityTypeDescription) {
        facts.push(`**Type:** ${facility.FacilityTypeDescription}`);
    }
    facts.push(`**Reservable:** ${facility.Reservable ? "Yes" : "No"}`);
    if (facility.FacilityPhone) {
        facts.push(`**Phone:** ${facility.FacilityPhone}`);
    }
    if (facility.FacilityEmail) {
        facts.push(`**Email:** ${facility.FacilityEmail}`);
    }
    if (facility.FacilityLatitude !== 0 || facility.FacilityLongitude !== 0) {
        facts.push(`**Coordinates:** ${facility.FacilityLatitude}, ${facility.FacilityLongitude}`);
    }
    if (facility.FacilityAdaAccess) {
        facts.push(`**ADA Access:** ${facility.FacilityAdaAccess}`);
    }
    if (facility.StayLimit) {
        facts.push(`**Stay Limit:** ${facility.StayLimit}`);
    }
    if (facility.FacilityReservationURL) {
        facts.push(`**Reservation URL:** ${facility.FacilityReservationURL}`);
    }
    if (facility.Keywords) {
        facts.push(`**Keywords:** ${facility.Keywords}`);
    }
    if (facts.length > 0) {
        lines.push(facts.join("\n\n"));
    }

    if (facility.FacilityDescription) {
        lines.push(`## Description\n${htmlToMarkdown.turndown(facility.FacilityDescription)}`);
    }
    if (facility.FacilityDirections) {
        lines.push(`## Directions\n${htmlToMarkdown.turndown(facility.FacilityDirections)}`);
    }
    if (facility.FacilityAccessibilityText) {
        lines.push(
            `## Accessibility\n${htmlToMarkdown.turndown(facility.FacilityAccessibilityText)}`
        );
    }
    if (facility.FacilityUseFeeDescription) {
        lines.push(`## Fees\n${htmlToMarkdown.turndown(facility.FacilityUseFeeDescription)}`);
    }

    return lines.join("\n\n");
}

class SierraOutfittersFaqScraper implements Scraper {
    targetPage = "https://gosierra.biz/api/v1/faq";

    commonHeaders() {
        return {
            "user-agent": "Mozilla/5.0 (compatible; SierraCrawler/1.0)",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        };
    }

    rootLinks() {
        return [this.targetPage];
    }

    extractContent(url: string, body: string): ExtractedContent {
        logging.info(`Extracting FAQ content from Sierra Outfitters page: ${url}`);

        const root = parse(body);
        const turndown = new TurndownService({
            headingStyle: "atx",
            linkStyle: "inlined",
        });
        turndown.remove(["script", "style", "noscript", "nav", "footer"]);

        const articles: ExtractedContent["articles"] = [];
        const categories = root.querySelectorAll(".category");

        for (const category of categories) {
            const sectionName = category.querySelector("h2")?.textContent.trim() ?? "General";

            const details = category.querySelectorAll("details");
            for (const detail of details) {
                const question = detail.querySelector("summary")?.textContent.trim() ?? "";
                const answerHtml =
                    detail.querySelector(".answer")?.innerHTML ??
                    detail.innerHTML.replace(detail.querySelector("summary")?.outerHTML ?? "", "");

                if (!question || !answerHtml) {
                    continue;
                }

                const answerMarkdown = turndown.turndown(answerHtml);
                const anchor = question
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
                articles.push({
                    title: question,
                    sourceUrl: `${url}#${anchor}`,
                    body: `**Category:** ${sectionName}\n\n${answerMarkdown}`,
                });
            }
        }

        return { articles, links: [] };
    }
}

const knowledgeBases = [
    {
        name: "Recreation.gov Facilities",
        fetchKnowledge: fetchRecreationGovFacilities,
    },
    NewCrawledKnowledgeBase("Sierra Outfitters FAQ", new SierraOutfittersFaqScraper(), {
        useBrowser: false,
        retries: 2,
        concurrency: 1,
        maxErrorRate: 0.1,
    }),
];

export default knowledgeBases;
