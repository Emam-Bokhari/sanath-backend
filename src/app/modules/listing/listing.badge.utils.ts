import { LISTING_STATUS, MARKET_STATUS } from "./listing.constant";
import { TBadge } from "./listing.interface";

type TInternalBadge = TBadge & {
  priority: number;
};

export type TBadgeConfig = {
  priceReducedDays?: number;
  newListingDays?: number;
};

/**
 * Checks if two dates fall on the exact same calendar day (in UTC/local context)
 */
export const isSameCalendarDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Checks if targetDate is the calendar day immediately preceding currentDate
 */
export const isCalendarYesterday = (
  targetDate: Date,
  currentDate: Date,
): boolean => {
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  return isSameCalendarDay(targetDate, yesterday);
};

/**
 * Returns the calendar day difference between two dates
 */
export const getCalendarDaysDiff = (earlier: Date, later: Date): number => {
  const d1 = new Date(
    earlier.getFullYear(),
    earlier.getMonth(),
    earlier.getDate(),
  );
  const d2 = new Date(later.getFullYear(), later.getMonth(), later.getDate());
  const diffMs = d2.getTime() - d1.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

/**
 * Computes all applicable badges and determines the single highest-priority primary badge
 */
export const calculateListingBadges = (
  listing: any,
  config?: TBadgeConfig,
): {
  primaryBadge: TBadge | null;
  badges: TBadge[];
} => {
  const internalBadges: TInternalBadge[] = [];
  const now = new Date();
  const priceReducedDays = config?.priceReducedDays ?? 30;
  const newListingDays = config?.newListingDays ?? 7;

  // 1. Market Status Badges (Highest Priority)
  if (listing.marketStatus === MARKET_STATUS.SOLD_STC) {
    internalBadges.push({
      code: "SOLD_STC",
      label: "SOLD STC",
      priority: 1,
    });
  } else if (
    listing.status === LISTING_STATUS.SOLD ||
    listing.marketStatus === MARKET_STATUS.SOLD
  ) {
    internalBadges.push({
      code: "SOLD",
      label: "SOLD",
      priority: 1,
    });
  } else if (listing.marketStatus === MARKET_STATUS.BACK_ON_MARKET) {
    internalBadges.push({
      code: "BACK_ON_MARKET",
      label: "Back on Market",
      priority: 3,
    });
  } else if (listing.marketStatus === MARKET_STATUS.RECENTLY_RELISTED) {
    internalBadges.push({
      code: "RECENTLY_RELISTED",
      label: "Recently Relisted",
      priority: 3,
    });
  }

  // 2. Price Reduction Badges (High Priority)
  if (listing.lastPriceReducedAt) {
    const reducedAt = new Date(listing.lastPriceReducedAt);
    if (isSameCalendarDay(reducedAt, now)) {
      internalBadges.push({
        code: "REDUCED_TODAY",
        label: "Reduced Today",
        priority: 2,
      });
    } else {
      const daysSinceReduced = getCalendarDaysDiff(reducedAt, now);
      if (daysSinceReduced <= priceReducedDays) {
        internalBadges.push({
          code: "PRICE_REDUCED",
          label: "Price Reduced",
          priority: 4,
        });
      }
    }
  }

  // 3. Date / Publication Badges (Automatic based on firstPublishedAt or createdAt)
  const publishedDate = listing.firstPublishedAt
    ? new Date(listing.firstPublishedAt)
    : listing.status === LISTING_STATUS.PUBLISHED && listing.createdAt
      ? new Date(listing.createdAt)
      : null;

  if (publishedDate) {
    if (isSameCalendarDay(publishedDate, now)) {
      internalBadges.push({
        code: "ADDED_TODAY",
        label: "Added Today",
        priority: 5,
      });
      internalBadges.push({
        code: "NEW",
        label: "NEW",
        priority: 6,
      });
    } else if (isCalendarYesterday(publishedDate, now)) {
      internalBadges.push({
        code: "ADDED_YESTERDAY",
        label: "Added Yesterday",
        priority: 5,
      });
      internalBadges.push({
        code: "NEW",
        label: "NEW",
        priority: 6,
      });
    } else {
      const daysSincePublished = getCalendarDaysDiff(publishedDate, now);
      if (daysSincePublished <= newListingDays) {
        internalBadges.push({
          code: "ADDED_LAST_7_DAYS",
          label: "Added in Last 7 Days",
          priority: 5,
        });
        internalBadges.push({
          code: "NEW",
          label: "NEW",
          priority: 6,
        });
      }
    }
  }

  // 4. Featured Badge (Codebase Existing)
  if (listing.isFeatured) {
    internalBadges.push({
      code: "FEATURED",
      label: "Featured",
      priority: 7,
    });
  }

  // Sort by priority (ascending: 1 is top priority)
  internalBadges.sort((a, b) => a.priority - b.priority);

  // Clean badges without priority field
  const cleanBadges: TBadge[] = internalBadges.map(({ code, label }) => ({
    code,
    label,
  }));

  return {
    primaryBadge: cleanBadges.length > 0 ? cleanBadges[0] : null,
    badges: cleanBadges,
  };
};
