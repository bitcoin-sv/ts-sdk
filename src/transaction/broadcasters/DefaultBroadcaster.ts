import { Broadcaster } from '../Broadcaster.js'
import ARC from './ARC.js'

export function defaultBroadcaster (): Broadcaster {
  return new ARC('https://arc.taal.com')
}
