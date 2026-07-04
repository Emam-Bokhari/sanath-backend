import { ListingServices } from "../listing/listing.service";
import { TSavedSearch } from "./savedSearch.interface";
import { SavedSearch } from "./savedSearch.model";

const toggleSavedSearchService = async (payload: TSavedSearch) => {
  const { userId, params } = payload;

  // Check if the search already exists for this user
  const existingSavedSearch = await SavedSearch.findOne({
    userId,
    params,
  });

  if (existingSavedSearch) {
    // If it exists, we remove it (toggle off)
    await SavedSearch.findByIdAndDelete(existingSavedSearch._id);
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
      .select("_id");

    if (userSavedSearches.length > 20) {
      const idsToDelete = userSavedSearches
        .slice(20)
        .map((search) => search._id);
      await SavedSearch.deleteMany({ _id: { $in: idsToDelete } });
    }

    return {
      message: "Search saved successfully",
      isSaved: true,
    };
  }
};

const getMySavedSearchesService = async (userId: string) => {
  const savedSearches = await SavedSearch.find({ userId })
    .sort({
      createdAt: -1,
    })
    .limit(20);

  const result: any[] = [];

  for (const savedSearch of savedSearches) {
    if (result.length >= 20) break;

    const listings = await ListingServices.searchListingsServiceFromDB(
      savedSearch.params as any,
    );

    for (const listing of listings) {
      if (result.length >= 20) break;
      result.push({
        ...listing,
        listingId: listing._id,
        _id: savedSearch._id,
      });
    }
  }

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
  return result;
};

export const SavedSearchService = {
  toggleSavedSearchService,
  getMySavedSearchesService,
  deleteSavedSearchService,
};
