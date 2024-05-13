import { HttpClient } from "../../primitives/utils.js"
import ChainTracker from "../ChainTracker.js"

export default class WoC implements ChainTracker {
    URL: string
    apiKey: string

    constructor(network: string, apiKey?: string) {
        this.URL = `https://api.whatsonchain.com/v1/bsv/${network}`
        return this
    }

    async isValidRootForHeight(root: string, height: number): Promise<boolean> {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        }
        const http = new HttpClient()
        const { data } = await http.request(`${this.URL}/block/${height}/header`, requestOptions)
        return data.merkleroot === root
    }
}