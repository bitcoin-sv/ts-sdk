import WhatsOnChain from './WhatsOnChain'
import ChainTracker from '../ChainTracker'

export function defaultChainTracker (): ChainTracker {
  return new WhatsOnChain()
}
