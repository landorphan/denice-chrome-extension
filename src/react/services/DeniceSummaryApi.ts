import { PageData, SummarizedDocument } from "../model/documents";

export class DeniceSummaryApi {
    private apiHost: string;

    constructor() {
        this.apiHost = process.env.API_HOST || 'http://localhost:3000'; // Fallback in case environment variable is not set
    }

    // Function to send a page for summarization
    async summarizePage(pageData: PageData): Promise<SummarizedDocument> {
        const response = await fetch(`${this.apiHost}/api/denice/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pageData),
            credentials: 'include',  // Include credentials in the request
        });

        const result = await response.json() as SummarizedDocument;

        console.log('Document:', result);
        if (response.ok && result.summary) {
            return result;
        } else {
            throw new Error('Failed to summarize the page.');
        }
    }

    // Function to save the summary
    async saveSummary(summary: SummarizedDocument): Promise<string> {
        const response = await fetch(`${this.apiHost}/api/denice/summarize/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(summary),
            credentials: 'include',  // Include credentials in the request
        });

        const result = await response.json();
        if (response.ok && result.message) {
            return result.message;
        } else {
            throw new Error(result.error || 'Failed to save the summary.');
        }
    }

    // Function to search summaries
    async searchSummaries(query: string): Promise<any[]> {
        const response = await fetch(`${this.apiHost}/api/denice/summarize/find`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
            credentials: 'include',  // Include credentials in the request
        });

        const result = await response.json();
        if (response.ok && result.results) {
            return result.results;
        } else {
            throw new Error(result.error || 'Failed to search summaries.');
        }
    }
}
