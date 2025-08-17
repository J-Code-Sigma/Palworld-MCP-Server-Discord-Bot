export interface Script {
    name: string;
    description: string;
    execute: () => void;
}

export interface AIResponse {
    response: string;
    confidence: number;
}