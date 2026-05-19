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

    // Limit to last 20 saved searches
    const userSavedSearches = await SavedSearch.find({ userId }).sort({
      createdAt: -1,
    });

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
    const listings = await ListingServices.searchListingsServiceFromDB(
      savedSearch.params as any,
    );

    listings.forEach((listing: any) => {
      result.push({
        ...listing,
        listingId: listing._id,
        _id: savedSearch._id,
      });
    });
  }

  return result;
};

const deleteSavedSearchService = async (
  savedSearchId: string,
  userId: string,
) => {
  const result = await SavedSearch.findOneAndUpdate(
    { _id: savedSearchId, userId },
    { isDeleted: true },
    { new: true },
  );
  return result;
};

export const SavedSearchService = {
  toggleSavedSearchService,
  getMySavedSearchesService,
  deleteSavedSearchService,
};
