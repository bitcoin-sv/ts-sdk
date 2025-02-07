import { Broadcaster } from "../Broadcaster";
import ARC, { ArcConfig } from "./ARC";

export function defaultBroadcaster(
  isTestnet: boolean = false,
  config: ArcConfig = {}
): Broadcaster {
  return new ARC(
    isTestnet ? "https://arc-test.taal.com" : "https://arc.taal.com",
    config
  );
}
