"use client";

import { useSyncExternalStore } from "react";

// The value never changes after mount, so nothing ever needs to notify.
const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * False while rendering on the server and during the first client render, true
 * afterwards.
 *
 * This is how the site tells the difference between "no script yet" and "script
 * running", which several components need in order to degrade properly: the map
 * makes every square tabbable until it can take over with a roving tab index,
 * and the dateline stays blank until it can read the reader's own clock.
 *
 * useSyncExternalStore rather than a state flag set in an effect, because it
 * gives the correct server value without a second render pass.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, onClient, onServer);
}
