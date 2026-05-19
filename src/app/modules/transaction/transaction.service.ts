import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";
import QueryBuilder from "../../builder/queryBuilder";
import { Types } from "mongoose";

const getAllTransactionsFromDB = async (query: Record<string, unknown>) => {
    const { searchTerm, ...queryData } = query;

    let userIds: Types.ObjectId[] = [];
    let trxSearchQuery: any = {};

    if (searchTerm) {
        // Search users by name or email
        const users = await User.find({
            $or: [
                { name: { $regex: searchTerm, $options: "i" } },
                { email: { $regex: searchTerm, $options: "i" } },
            ],
        }).select("_id");

        userIds = users.map((user) => user._id as Types.ObjectId);

        // Build the search query for Subscription
        trxSearchQuery = {
            $or: [
                { userId: { $in: userIds } },
                { trxId: { $regex: searchTerm, $options: "i" } },
                { subscriptionId: { $regex: searchTerm, $options: "i" } },
            ],
        };
    }

    const transactionQuery = new QueryBuilder(
        Subscription.find(trxSearchQuery)
            .populate("userId", "name email profileImage")
            .populate("planId"),
        queryData
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await transactionQuery.modelQuery;
    const meta = await transactionQuery.countTotal();

    return {
        meta,
        result,
    };
};

const getTransactionByIdFromDB = async (transactionId: string) => {
    const result = await Subscription.findById(transactionId)
        .populate("userId", "name email profileImage")
        .populate("planId");

    if (!result) {
        throw new Error("Transaction not found");
    }
    
    return result;
};

export const TransactionService = {
    getAllTransactionsFromDB,
    getTransactionByIdFromDB,
};
