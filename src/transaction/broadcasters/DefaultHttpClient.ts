import {HttpClient} from "./HttpClient.js";
import {NodejsHttpClient} from "./NodejsHttpClient.js";

/**
 * Returns a default HttpClient implementation based on the environment that it is run on.
 */
export default function defaultHttpClient(): HttpClient {
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        // Use fetch in a browser environment
        return window
    } else if (typeof require !== 'undefined') {
        // Use Node.js https module
        // define here to prevent bundler from checking module existence when it is not used.
        let module = 'https'
        // eslint-disable-next-line
        const https = require(module)
        return new NodejsHttpClient(https)
    } else {
        throw new Error('No method available to perform HTTP request')
    }
}
