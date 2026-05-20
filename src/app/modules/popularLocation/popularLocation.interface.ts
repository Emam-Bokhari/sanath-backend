import { Types } from "mongoose";

export type TPopularLocation = {
    name: string;
    image: string;
    listingId: Types.ObjectId | string;
    totalListing?: number;
    isDeleted: boolean;
}