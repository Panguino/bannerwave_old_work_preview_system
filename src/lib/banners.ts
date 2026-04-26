import type { BannerRecord } from '../types/banner';
import raw from '../data/banners.json';

export const banners: BannerRecord[] = raw as BannerRecord[];

export function getBannerById(id: string): BannerRecord | undefined {
	return banners.find((b) => b.id === id);
}

export function bannerEntryUrl(id: string): string {
	return `/banners/${id}/index.html`;
}

export function bannerFallbackUrl(id: string): string {
	return `/banners/${id}/fallback.jpg`;
}
