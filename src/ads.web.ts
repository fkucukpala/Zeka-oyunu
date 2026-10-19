// Google Mobile Ads web'i desteklemez; web derlemesinde reklamlar kapalıdır.
import { bumpFinishedCount } from './storage';

export async function initAds(): Promise<void> {}

export function setAdsRemoved(_value: boolean): void {}

export async function showAdAfterPuzzle(): Promise<void> {
  await bumpFinishedCount();
}

export function isRewardedReady(): boolean {
  return false;
}

export function onRewardedReadyChange(_listener: (ready: boolean) => void): () => void {
  return () => {};
}

export async function showRewarded(): Promise<boolean> {
  return false;
}
