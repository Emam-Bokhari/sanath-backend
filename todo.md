<!-- 
1. ajker kono price reduced korle shaita  Reduced Today hobe 
2. r jadi price ager reduced hoi tahule Price Reduced
3. Added Today
4. Added Yesterday
5. Added in Last 7 Days
6. sold dite parbe agent
7. Back on Market
8. Recently Relisted
“New” Badge automatic হবে

এটা গুরুত্বপূর্ণ।

Agent manually:

New = true

করবে না।

Property প্রথমবার publish হলে system নিজে:

NEW

badge দিবে।
Added Today

System property-এর original published date দেখে automatically determine করবে।

যদি আজ publish হয়:

Added Today
Added Yesterday

যদি আগের calendar day-তে publish হয়:

Added Yesterday
Added in Last 7 Days

যদি property প্রথমবার publish হওয়ার সময়:

গত 7 দিনের মধ্যে

হয়, তাহলে:

Added in Last 7 Days

দেখাবে।

এগুলো agent manually select করতে পারবে না।
Price Reduction System

এটা requirement-এর সবচেয়ে গুরুত্বপূর্ণ অংশগুলোর একটি।

ধরো property-এর initial price:

£500,000

Agent পরে price করল:

£475,000

System তখন history রাখবে:

Previous Price: £500,000
New Price: £475,000
Changed At: Date + Time
Changed By: Agent
Reduced Today

যদি আজ price কমানো হয়:

£500,000
↓
£475,000

তাহলে automatically:

💰 Reduced Today

দেখাবে।

Agent manually:

Reduced Today = true

করতে পারবে না।
Price Reduced

“Reduced Today” period শেষ হওয়ার পরেও কিছু সময়:

📉 Price Reduced

দেখানো যাবে।

এই duration admin configurable করতে পারবে।

যেমন:

Reduced Today → 1 day
Price Reduced → 30 days

এটা example; exact duration পরে configure করা যাবে।
Sold STC / SSTC

Agent property-কে:

Sold Subject to Contract

বা:

SSTC

করতে পারবে।

তখন property completely delete হবে না।

Search result-এ থাকতে পারে, কিন্তু:

SOLD STC

badge দেখাবে।

এবং আর normal available property হিসেবে দেখানো যাবে না।
 -->


 ১. আজ পাবলিশ হলে (Added Today + NEW)
পরিস্থিতি: অ্যাডমিন আজ প্রপার্টিটি অ্যাপ্রুভ করেছে (firstPublishedAt আজকের তারিখ)।

json
{
  "_id": "66b1a20c3ef09a1234567801",
  "title": "Luxury 2 Bed Flat in Central London",
  "listingType": "SALE",
  "askingPrice": 650000,
  "originalPrice": 650000,
  "status": "PUBLISHED",
  "marketStatus": "AVAILABLE",
  "firstPublishedAt": "2026-09-05T08:30:00.000Z",
  "lastPublishedAt": "2026-09-05T08:30:00.000Z",
  "primaryBadge": {
    "code": "ADDED_TODAY",
    "label": "Added Today"
  },
  "badges": [
    {
      "code": "ADDED_TODAY",
      "label": "Added Today"
    },
    {
      "code": "NEW",
      "label": "NEW"
    }
  ],
  "shareLink": "https://sanath.co.uk/listing/66b1a20c3ef09a1234567801"
}
২. গতকাল পাবলিশ হলে (Added Yesterday + NEW)
পরিস্থিতি: প্রপার্টিটি গতকালকের ক্যালেন্ডার দিনে পাবলিশ হয়েছে।

json
{
  "_id": "66b1a20c3ef09a1234567802",
  "title": "Modern Detached House with Garden",
  "listingType": "SALE",
  "askingPrice": 420000,
  "originalPrice": 420000,
  "status": "PUBLISHED",
  "marketStatus": "AVAILABLE",
  "firstPublishedAt": "2026-09-04T14:15:00.000Z",
  "primaryBadge": {
    "code": "ADDED_YESTERDAY",
    "label": "Added Yesterday"
  },
  "badges": [
    {
      "code": "ADDED_YESTERDAY",
      "label": "Added Yesterday"
    },
    {
      "code": "NEW",
      "label": "NEW"
    }
  ]
}
৩. গত ৭ দিনের মধ্যে পাবলিশ হলে (Added in Last 7 Days + NEW)
পরিস্থিতি: প্রপার্টি ৪ দিন আগে পাবলিশ হয়েছে (আজ বা গতকাল নয়, কিন্তু গত ৭ দিনের মধ্যে)।

json
{
  "_id": "66b1a20c3ef09a1234567803",
  "title": "3 Bedroom Semi-Detached House in Manchester",
  "listingType": "SALE",
  "askingPrice": 310000,
  "status": "PUBLISHED",
  "marketStatus": "AVAILABLE",
  "firstPublishedAt": "2026-09-01T11:00:00.000Z",
  "primaryBadge": {
    "code": "ADDED_LAST_7_DAYS",
    "label": "Added in Last 7 Days"
  },
  "badges": [
    {
      "code": "ADDED_LAST_7_DAYS",
      "label": "Added in Last 7 Days"
    },
    {
      "code": "NEW",
      "label": "NEW"
    }
  ]
}
৪. আজ প্রাইজ কমালে (Reduced Today + priceHistory)
পরিস্থিতি: প্রপার্টির পূর্বের দাম ছিল £500,000; আজ এজেন্ট দাম কমিয়ে £475,000 করেছে। সিস্টেম স্বয়ংক্রিয়ভাবে priceHistory লগ রেখেছে এবং Reduced Today ব্যাজ দিয়েছে।

json
{
  "_id": "66b1a20c3ef09a1234567804",
  "title": "Stunning 4 Bed Family Home",
  "askingPrice": 475000,
  "previousPrice": 500000,
  "originalPrice": 500000,
  "lastPriceReducedAt": "2026-09-05T09:45:00.000Z",
  "firstPublishedAt": "2026-08-20T10:00:00.000Z",
  "marketStatus": "AVAILABLE",
  "status": "PUBLISHED",
  "priceHistory": [
    {
      "previousPrice": 500000,
      "newPrice": 475000,
      "difference": 25000,
      "percentageReduced": 5,
      "changedAt": "2026-09-05T09:45:00.000Z",
      "changedBy": "66b1123456789abcdef01234"
    }
  ],
  "primaryBadge": {
    "code": "REDUCED_TODAY",
    "label": "Reduced Today"
  },
  "badges": [
    {
      "code": "REDUCED_TODAY",
      "label": "Reduced Today"
    }
  ]
}
৫. প্রাইজ কমানোর ১ দিন পর (Price Reduced)
পরিস্থিতি: দাম কমানো হয়েছিল ৬ দিন আগে। "Reduced Today" পার হয়ে গেছে, কিন্তু অ্যাডমিন নির্ধারিত ৩০ দিনের মধ্যে থাকায় Price Reduced দেখাচ্ছে।

json
{
  "_id": "66b1a20c3ef09a1234567805",
  "title": "Victorian Terraced House",
  "askingPrice": 380000,
  "previousPrice": 400000,
  "lastPriceReducedAt": "2026-08-30T16:20:00.000Z",
  "marketStatus": "AVAILABLE",
  "status": "PUBLISHED",
  "priceHistory": [
    {
      "previousPrice": 400000,
      "newPrice": 380000,
      "difference": 20000,
      "percentageReduced": 5,
      "changedAt": "2026-08-30T16:20:00.000Z",
      "changedBy": "66b1123456789abcdef01234"
    }
  ],
  "primaryBadge": {
    "code": "PRICE_REDUCED",
    "label": "Price Reduced"
  },
  "badges": [
    {
      "code": "PRICE_REDUCED",
      "label": "Price Reduced"
    }
  ]
}
৬. এজেন্ট যখন SSTC করে (SOLD STC)
পরিস্থিতি: এজেন্ট প্রপার্টিটিকে "Sold Subject to Contract" মার্ক করেছে। প্রপার্টি ডিলিট হয়নি, সার্চে দেখতে পাবে কিন্তু SOLD STC ব্যাজ থাকবে (সর্বোচ্চ প্রায়োরিটি)।

json
{
  "_id": "66b1a20c3ef09a1234567806",
  "title": "Contemporary Penthouse with Skyline Views",
  "askingPrice": 850000,
  "status": "PUBLISHED",
  "marketStatus": "SOLD_STC",
  "firstPublishedAt": "2026-09-05T08:00:00.000Z",
  "primaryBadge": {
    "code": "SOLD_STC",
    "label": "SOLD STC"
  },
  "badges": [
    {
      "code": "SOLD_STC",
      "label": "SOLD STC"
    },
    {
      "code": "ADDED_TODAY",
      "label": "Added Today"
    },
    {
      "code": "NEW",
      "label": "NEW"
    }
  ]
}
৭. ডিল ক্যান্সেল হয়ে আবার মার্কেটে ফিরে আসলে (Back on Market)
পরিস্থিতি: প্রপার্টি আগে SOLD_STC ছিল, কিন্তু বায়ারের লোন বা চুক্তি বাতিল হওয়ায় এজেন্ট এটিকে পুনরায় AVAILABLE করেছে। সিস্টেম স্বয়ংক্রিয়ভাবে BACK_ON_MARKET ব্যাজ সক্রিয় করেছে।

json
{
  "_id": "66b1a20c3ef09a1234567807",
  "title": "Suburban 3 Bed Semi-Detached House",
  "askingPrice": 350000,
  "status": "PUBLISHED",
  "marketStatus": "BACK_ON_MARKET",
  "backOnMarketAt": "2026-09-05T10:10:00.000Z",
  "primaryBadge": {
    "code": "BACK_ON_MARKET",
    "label": "Back on Market"
  },
  "badges": [
    {
      "code": "BACK_ON_MARKET",
      "label": "Back on Market"
    }
  ]
}
৮. এজেন্ট কীভাবে মার্কেট স্ট্যাটাস আপডেট করবে? (API Call)
রিকোয়েস্ট:
Method: PATCH
URL: /api/v1/listings/my/market-status/66b1a20c3ef09a1234567806
Headers: Authorization: Bearer <agent_jwt_token>
Request Body:
json
{
  "marketStatus": "SOLD_STC"
}
(সম্ভাব্য মান: "AVAILABLE", "SOLD_STC", "SOLD", "BACK_ON_MARKET", "RECENTLY_RELISTED")

রেসপন্স:
json
{
  "success": true,
  "statusCode": 200,
  "message": "Listing market status updated to SOLD_STC successfully",
  "data": {
    "_id": "66b1a20c3ef09a1234567806",
    "title": "Contemporary Penthouse with Skyline Views",
    "marketStatus": "SOLD_STC"
  }
}
৯. অ্যাডমিন সেটিংস কনফিগারেশন (API Call)
অ্যাডমিন প্যানেল থেকে ব্যাজের মেয়াদ (যেমন: Price Reduced কত দিন থাকবে) পরিবর্তন করার ডেটা:

রিকোয়েস্ট:
Method: POST / PATCH
URL: /api/v1/settings
Request Body:
json
{
  "currency": "GBP",
  "paymentNumbers": [
    {
      "label": "UK Bank Transfer",
      "number": "+44 7700 900077"
    }
  ],
  "priceReducedDurationDays": 30,
  "newListingDurationDays": 7
}
রেসপন্স:
json
{
  "success": true,
  "statusCode": 200,
  "message": "Settings updated successfully",
  "data": {
    "_id": "66b0987654321fedcba09876",
    "currency": "GBP",
    "priceReducedDurationDays": 30,
    "newListingDurationDays": 7
  }
}
সংক্ষেপে ফ্রন্টএন্ড ডেভেলপারদের জন্য সুবিধা:
কার্ডের কোণায় একটি ব্যাজ দেখাতে: সরাসরি listing.primaryBadge.label ব্যবহার করবে।
ডিটেইলস পেজে সব ব্যাজ দেখাতে: listing.badges অ্যারে লুপ করবে।
কোনো ডেট বা প্রাইস ক্যালকুলেশন ফ্রন্টএন্ডে করতে হবে না।
10:22 AM
New ta koto din thakbe?
aita kivabe implement kora hosie?
10:24 AM
১. "NEW" ব্যাজ কত দিন থাকবে?
ডিফল্টভাবে ৭ দিন (7 Calendar Days) থাকবে।

প্রপার্টি পাবলিশ হওয়ার দিন থেকে শুরু করে পরবর্তী ৭ দিন পর্যন্ত সিস্টেমে NEW ব্যাজটি স্বয়ংক্রিয়ভাবে থাকবে।
৮ম দিন শুরু হলেই NEW ব্যাজটি একা একাই বন্ধ/অদৃশ্য হয়ে যাবে।
এছাড়া এটি অ্যাডমিন কনফিগারেবল—আমরা Settings মডেলে newListingDurationDays: 7 রেখেছি। অ্যাডমিন প্যানেল থেকে অ্যাডমিন চাইলে এটিকে যেকোনো সময় বাড়িয়ে ১০ দিন, ১৪ দিন বা কমিয়ে ৩ দিন করতে পারবে।
২. এটি কীভাবে ইমপ্লিমেন্ট করা হয়েছে?
এটি সম্পূর্ণ রিয়েল-টাইম (Dynamic Calculation) পদ্ধতিতে ইমপ্লিমেন্ট করা হয়েছে। এর জন্য ডাটাবেসে কোনো ভারী Cron Job বা ব্যাকগ্রাউন্ড স্ক্রিপ্ট চালানোর প্রয়োজন হয় না।

নিচে বাস্তবায়নের ৩টি মূল ধাপ রয়েছে:

ধাপ ১: আসল পাবলিশের তারিখ ট্র্যাক করা (firstPublishedAt)
এজেন্ট প্রপার্টিটি ১০ দিন আগে ড্রাফট করে রাখতে পারে, কিন্তু অ্যাডমিন হয়তো আজ অ্যাপ্রুভ করেছে। তাই ড্রাফটের তারিখ (createdAt) নয়, বরং অ্যাডমিন যখন প্রথমবার অ্যাপ্রুভ করে status: PUBLISHED করেছে, তখন আমরা firstPublishedAt = new Date() স্ট্যাম্প করে রেখেছি:

typescript
// listing.service.ts
if (status === LISTING_STATUS.PUBLISHED) {
  if (!listing.firstPublishedAt) {
    listing.firstPublishedAt = new Date(); // প্রথমবার পাবলিশ হওয়ার সঠিক সময়
    listing.originalPrice = listing.askingPrice;
  }
}
ধাপ ২: ক্যালেন্ডার দিনের পার্থক্য বের করা (getCalendarDaysDiff)


listing.badge.utils.ts
-এ আমরা ইউটিলিটি ফাংশন তৈরি করেছি যা বর্তমান তারিখ (now) এবং firstPublishedAt-এর মধ্যকার ক্যালেন্ডার দিনের পার্থক্য হিসাব করে:

typescript
export const getCalendarDaysDiff = (earlier: Date, later: Date): number => {
  const d1 = new Date(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
  const d2 = new Date(later.getFullYear(), later.getMonth(), later.getDate());
  const diffMs = d2.getTime() - d1.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};
ধাপ ৩: ব্যাজ অ্যাসাইন করার লজিক


listing.badge.utils.ts
-এর ভেতরে দিন অনুযায়ী ব্যাজ দেওয়া হয়:

typescript
const publishedDate = listing.firstPublishedAt ? new Date(listing.firstPublishedAt) : null;
const newListingDays = config?.newListingDays ?? 7; // ডিফল্ট ৭ দিন
if (publishedDate) {
  // ১. আজ পাবলিশ হলে:
  if (isSameCalendarDay(publishedDate, now)) {
    badges.push({ code: "ADDED_TODAY", label: "Added Today" });
    badges.push({ code: "NEW", label: "NEW" });
  } 
  // ২. গতকাল পাবলিশ হলে:
  else if (isCalendarYesterday(publishedDate, now)) {
    badges.push({ code: "ADDED_YESTERDAY", label: "Added Yesterday" });
    badges.push({ code: "NEW", label: "NEW" });
  } 
  // ৩. ২ থেকে ৭ দিনের মধ্যে হলে:
  else {
    const daysSincePublished = getCalendarDaysDiff(publishedDate, now);
    if (daysSincePublished <= newListingDays) {
      badges.push({ code: "ADDED_LAST_7_DAYS", label: "Added in Last 7 Days" });
      badges.push({ code: "NEW", label: "NEW" });
    }
  }
}
টাইমলাইন কেমন হবে:
সময়কাল	প্রদর্শিত ব্যাজসমূহ (badges)	প্রাইমারি ব্যাজ (primaryBadge)
Day 0 (আজকে)	["ADDED_TODAY", "NEW"]	Added Today
Day 1 (গতকালকে)	["ADDED_YESTERDAY", "NEW"]	Added Yesterday
Day 2 থেকে Day 7	["ADDED_LAST_7_DAYS", "NEW"]	Added in Last 7 Days
Day 8 থেকে শুরু করে পরবর্তী সময়ে	[] (New বা Added ব্যাজ স্বয়ংক্রিয়ভাবে আর থাকবে না)	null (অন্য ব্যাজ যেমন Price Reduced বা Featured থাকলে সেটি দেখাবে)
এর সুবিধা:
এজেন্ট কোনো কারচুপি করতে পারবে না: এজেন্ট নিজে New = true করতে পারে না।
অটোমেটিক রিমুভ: ৭ দিন পার হলে ব্যাকএন্ডের কাউকে ম্যানুয়ালি ডিলিট করতে হবে না, ৮ নম্বর দিনে রিকোয়েস্ট আসলেই সিস্টেম দেখবে daysSincePublished > 7, তাই আর ব্যাজ পাঠাবে না।