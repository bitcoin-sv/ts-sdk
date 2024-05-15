/**
 * An interface for HTTP client used by ARC to make HTTP requests.
 */
export interface HttpClient {
    /**
     * Makes a request to the server.
     * @param url The URL to make the request to.
     * @param options The request configuration.
     */
    fetch(url: string, options: HttpClientRequestOptions): Promise<HttpClientResponse>
}

/**
 * An interface for configuration of the request to be passed to the fetch method.
 */
export interface HttpClientRequestOptions {
    /** A string to set request's method. */
    method?: string;
    /** An object literal set request's headers. */
    headers?: Record<string, string>;
    /** An object or null to set request's body. */
    body?: string | null;
}

/**
 * An interface for the response returned by the fetch method.
 */
export interface HttpClientResponse {
    /** The status code of the response. */
    statusCode?: number;
    /** A flag indicating whether the request ends with success status or not. */
    ok?: boolean;
    json(): Promise<any>;
}
