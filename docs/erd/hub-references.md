# Hub Entity References

This document lists all entities and fields that reference hub entities across the sanath-backend codebase.

## Hub: `User` (15 referencing entities, 21 reference fields)

| Module | Referencing Entity | Field Path | Kind |
| :--- | :--- | :--- | :--- |
| `agentFeed` | `AgentFeed` | `agentId` | single ref |
| `chat` | `Chat` | `deletedBy` | array of refs |
| `chat` | `Chat` | `participants` | array of refs |
| `chat` | `Chat` | `readBy` | array of refs |
| `contact` | `Contact` | `userId` | single ref |
| `enquery` | `Enquery` | `agentId` | single ref |
| `enquery` | `Enquery` | `userId` | single ref |
| `favoriteProperty` | `FavoriteProperty` | `userId` | single ref |
| `fcmToken` | `DeviceToken` | `userId` | single ref |
| `listing` | `Listing` | `agentId` | single ref |
| `listing` | `Listing` | `viewedBy` | array of refs |
| `listing` | `Listing_PriceHistory` | `changedBy` | single ref |
| `message` | `Message` | `pinnedBy` | single ref |
| `message` | `Message` | `sender` | single ref |
| `notification` | `Notification` | `receiver` | single ref |
| `notification` | `Notification` | `sender` | single ref |
| `notificationPreference` | `NotificationPreference` | `userId` | one-to-one (unique) |
| `resetToken` | `Token` | `user` | single ref |
| `savedSearch` | `SavedSearch` | `userId` | single ref |
| `subscription` | `Subscription` | `userId` | single ref |
| `support` | `Support` | `userId` | single ref |

