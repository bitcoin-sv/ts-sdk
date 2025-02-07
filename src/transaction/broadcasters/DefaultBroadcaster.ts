import { Broadcaster } from '../Broadcaster.js'
import ARC, { ArcConfig } from './ARC.js'

export function defaultBroadcaster(
  isTestnet: boolean = false,
  config: ArcConfig = {}
): Broadcaster {
  return new ARC(
    isTestnet ? 'https://arc-test.taal.com' : 'https://arc.taal.com',
    config
  )
}
