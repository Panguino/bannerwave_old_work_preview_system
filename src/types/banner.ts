export type BannerStatus = 'pending' | 'ready' | 'broken';

export type BannerSource = 'desktop' | 'animere' | 'manual' | string;

export interface BannerRecord {
	id: string;
	name: string;
	width: number;
	height: number;
	keywords: string[];
	suggestedKeywords?: string[];
	status: BannerStatus;
	source?: BannerSource;
	notes?: string;
	/** When true, `public/banners/<id>/fallback.jpg` is expected to exist */
	hasFallback?: boolean;
}
