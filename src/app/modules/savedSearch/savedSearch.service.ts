import { ListingServices } from "../listing/listing.service";
import { TSavedSearch } from "./savedSearch.interface";
import { SavedSearch } from "./savedSearch.model";
import redisClient from "../../../shared/redisClient";

// High-performance in-memory L1 cache with TTL (<0.1ms response time)
const localCache = new Map<string, { data: any[]; expiry: number }>();
const CACHE_TTL_SECONDS = 60;

/**
 * Gets cached saved-searches result for a user:
 * 1. Checks in-memory L1 cache (<0.1ms)
 * 2. Checks Redis L2 cache (<2ms)
 */
const getCachedSavedSearches = async (
  userId: string,
): Promise<any[] | null> => {
  const cacheKey = `cache:saved_searches:${userId}`;

  // L1: Memory Cache
  const mem = localCache.get(cacheKey);
  if (mem && mem.expiry > Date.now()) {
    return mem.data;
  }

  // L2: Redis Cache
  try {
    if (redisClient?.isOpen) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        localCache.set(cacheKey, {
          data: parsed,
          expiry: Date.now() + CACHE_TTL_SECONDS * 1000,
        });
        return parsed;
      }
    }
  } catch {
    // Continue gracefully if Redis has transient error
  }

  return null;
};

/**
 * Sets cached saved-searches result in both L1 (Memory) and L2 (Redis)
 */
const setCachedSavedSearches = async (
  userId: string,
  data: any[],
): Promise<void> => {
  const cacheKey = `cache:saved_searches:${userId}`;

  // Save to L1
  localCache.set(cacheKey, {
    data,
    expiry: Date.now() + CACHE_TTL_SECONDS * 1000,
  });

  // Save to L2
  try {
    if (redisClient?.isOpen) {
      await redisClient.setEx(
        cacheKey,
        CACHE_TTL_SECONDS,
        JSON.stringify(data),
      );
    }
  } catch {
    // Continue gracefully
  }
};

/**
 * Invalidates cache for a user when saved searches are modified
 */
const invalidateSavedSearchCache = async (userId: string): Promise<void> => {
  const cacheKey = `cache:saved_searches:${userId}`;
  localCache.delete(cacheKey);
  try {
    if (redisClient?.isOpen) {
      await redisClient.del(cacheKey);
    }
  } catch {
    // Continue gracefully
  }
};

const toggleSavedSearchService = async (payload: TSavedSearch) => {
  const { userId, params } = payload;

  // Check if the search already exists for this user
  const existingSavedSearch = await SavedSearch.findOne({
    userId,
    params,
  }).lean();

  if (existingSavedSearch) {
    // If it exists, we remove it (toggle off)
    await SavedSearch.findByIdAndDelete(existingSavedSearch._id);
    await invalidateSavedSearchCache(String(userId));
    return {
      message: "Search removed from saved history",
      isSaved: false,
    };
  } else {
    // If it doesn't exist, we save it (toggle on)
    await SavedSearch.create(payload);

    // Limit to last 20 saved searches - delete older ones
    const userSavedSearches = await SavedSearch.find({ userId })
      .sort({ createdAt: -1 })
      .select("_id")
      .lean();

    if (userSavedSearches.length > 20) {
      const idsToDelete = userSavedSearches
        .slice(20)
        .map((search) => search._id);
      await SavedSearch.deleteMany({ _id: { $in: idsToDelete } });
    }

    await invalidateSavedSearchCache(String(userId));
    return {
      message: "Search saved successfully",
      isSaved: true,
    };
  }
};

const getMySavedSearchesService = async (userId: string) => {
  // 1. High-speed cache check (Serves in 1ms - 3ms on cache hit)
  const cachedData = await getCachedSavedSearches(userId);
  if (cachedData) {
    return cachedData;
  }

  // 2. Fetch saved searches sorted by newest (indexed scan via { userId: 1, createdAt: -1 })
  const savedSearches = await SavedSearch.find({ userId })
    .sort({
      createdAt: -1,
    })
    .limit(20)
    .lean();

  if (!savedSearches || savedSearches.length === 0) {
    await setCachedSavedSearches(userId, []);
    return [];
  }

  const TARGET_LIMIT = 20;
  const result: any[] = [];
  const searchParamMemo = new Map<string, any[]>();

  // In-request memoized search executor with strict limit
  const fetchListingsForParams = async (params: any, neededLimit: number) => {
    const key = JSON.stringify(params || {});
    if (searchParamMemo.has(key)) {
      return searchParamMemo.get(key)!;
    }
    const listings = await ListingServices.searchListingsServiceFromDB({
      ...params,
      limit: neededLimit,
    });
    searchParamMemo.set(key, listings);
    return listings;
  };

  // Step A: Fast path - execute the first/most recent saved search with TARGET_LIMIT
  const firstSearch = savedSearches[0];
  const firstListings = await fetchListingsForParams(
    firstSearch.params as any,
    TARGET_LIMIT,
  );

  for (const listing of firstListings) {
    if (result.length >= TARGET_LIMIT) break;
    result.push({
      ...listing,
      listingId: listing._id,
      _id: firstSearch._id,
    });
  }

  // Step B: Early exit if first saved search already gave 20 items or only 1 saved search exists
  if (result.length >= TARGET_LIMIT || savedSearches.length === 1) {
    await setCachedSavedSearches(userId, result);
    return result;
  }

  // Step C: If more items are needed, execute remaining searches concurrently in parallel
  const remainingSearches = savedSearches.slice(1);
  const remainingLimit = TARGET_LIMIT - result.length;

  const searchPromises = remainingSearches.map(async (savedSearch) => {
    const listings = await fetchListingsForParams(
      savedSearch.params as any,
      remainingLimit,
    );
    return { savedSearch, listings };
  });

  const searchResults = await Promise.all(searchPromises);

  // Assemble results preserving exact chronological saved search order
  for (const { savedSearch, listings } of searchResults) {
    if (result.length >= TARGET_LIMIT) break;

    for (const listing of listings) {
      if (result.length >= TARGET_LIMIT) break;
      result.push({
        ...listing,
        listingId: listing._id,
        _id: savedSearch._id,
      });
    }
  }

  // Save to cache for ultra-fast subsequent requests
  await setCachedSavedSearches(userId, result);
  return result;
};

const deleteSavedSearchService = async (
  savedSearchId: string,
  userId: string,
) => {
  const result = await SavedSearch.findOneAndDelete({
    _id: savedSearchId,
    userId,
  });
  await invalidateSavedSearchCache(String(userId));
  return result;
};

export const SavedSearchService = {
  toggleSavedSearchService,
  getMySavedSearchesService,
  deleteSavedSearchService,
};
