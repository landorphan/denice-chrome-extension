export interface PageData {
    _id: string;
    hash: string;
    url: string;
    content: string;
}

export interface SummaryResponse {
    title: string;
    summary: string;
    categories: string[];
}

export interface SummarizedDocument {
    _id: string;
    url: string;
    content: string;
    title: string;
    summary: string;
    categories: string[];
}
