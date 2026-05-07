import { FavoriteProperty } from "./favoriteProperty.model";

const checkFavoritePropertyStatus = async (
  userId: string,
  listingId: string,
) => {
  const favorite = await FavoriteProperty.exists({
    userId,
    listingId,
  });

  return {
    isFavorite: !!favorite,
  };
};

export const FavoritePropertyServices = {
  checkFavoritePropertyStatus,
};