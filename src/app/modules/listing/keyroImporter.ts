// import axios from 'axios';
// import { XMLParser } from 'fast-xml-parser';
// import cron from 'node-cron';
// import { Listing } from './listing.model';
// import { TListing } from './listing.interface';
// import { LISTING_STATUS, LISTING_TYPE, PROPERTY_TYPE, FEATURES } from './listing.constant';
// import { Types } from 'mongoose';
// import ApiError from '../../../errors/ApiErrors';
// import { StatusCodes } from 'http-status-codes';

// const mapKyeroToListing = (property: any, feedUrl: string): Partial<TListing> => {
//   const isRent = property.price_freq === 'month';
  
//   const typeMap: Record<string, PROPERTY_TYPE> = {
//     'villa': PROPERTY_TYPE.VILLA,
//     'detached house': PROPERTY_TYPE.DETACHED,
//     'semi-detached house': PROPERTY_TYPE.SEMI_DETACHED,
//     'terraced house': PROPERTY_TYPE.TERRACED,
//     'bungalow': PROPERTY_TYPE.BUNGLOW,
//     'flat': PROPERTY_TYPE.FLAT,
//     'apartment': PROPERTY_TYPE.APARTMENT,
//     'country house': PROPERTY_TYPE.COUNTRY_HOUSE,
//   };

//   let features: FEATURES[] = [];
//   if (property.features?.feature) {
//     const featList = Array.isArray(property.features.feature) 
//       ? property.features.feature 
//       : [property.features.feature];
    
//     features = featList
//       .map((f: string) => f.toUpperCase().trim().replace(/\s+/g, '_') as FEATURES)
//       .filter((f:any) => Object.values(FEATURES).includes(f));
//   }

//   return {
//     title: `${property.town || 'Property'} - ${property.ref || property.id}`,
//     listingType: isRent ? LISTING_TYPE.RENT : LISTING_TYPE.SALE,
//     askingPrice: Number(property.price) || 0,
//     country: (property.country || 'Spain').toUpperCase(),
//     city: property.town || '',
//     postalCode: '',

//     agentId: new Types.ObjectId("6a0a9889b05aa2670a4c3796"), // Config থেকে নেবে পরে

//     // Media
//     photos: extractPhotos(property.images),
//     videos: property.video_url ? [property.video_url] : [],
//     threeSixtyTour: property.virtual_tour_url,

//     propertyType: typeMap[property.type?.toLowerCase()] || PROPERTY_TYPE.FLAT,
//     propertyBedrooms: Number(property.beds) || 0,
//     propertyBathrooms: Number(property.baths) || 0,
//     propertySquareFoot: Number(property.surface_area?.built) || undefined,

//     features,
//     description: property.desc?.en || property.desc?.es || property.desc?.fr || 'No description available',
    
//     status: LISTING_STATUS.PUBLISHED,
//     isFeatured: property.prime === '1',

//     location: property.location?.latitude && property.location?.longitude ? {
//       type: 'Point',
//       coordinates: [
//         Number(property.location.longitude),
//         Number(property.location.latitude)
//       ],
//       address: property.location_detail || `${property.town}, ${property.province}`,
//     } : undefined,

//     // Kyero Specific Fields (খুব গুরুত্বপূর্ণ)
//     kyeroId: property.id,
//     kyeroRef: property.ref,
//     source: "kyero",
//     sourceUrl: feedUrl,
//     lastSyncedAt: new Date(),
//   };
// };

// const extractPhotos = (images: any): string[] => {
//   if (!images?.image) return [];
  
//   const imageList = Array.isArray(images.image) ? images.image : [images.image];
  
//   return imageList
//     .map((img: any) => img.url)
//     .filter(Boolean)
//     .slice(0, 20); // তোমার সাইটে max 20 রাখা যেতে পারে
// };

// // ===================== MAIN IMPORT FUNCTION =====================
// export const importKyeroFeed = async (feedUrl: string) => {
//   try {
//     console.log(`🔄 Kyero Feed Import Started: ${feedUrl}`);

//     const { data: xmlData } = await axios.get(feedUrl, { 
//       timeout: 90000,
//       headers: { 'Accept': 'application/xml, text/xml' }
//     });

//     const parser = new XMLParser({
//       ignoreAttributes: false,
//       parseAttributeValue: true,
//       trimValues: true,
//       isArray: (tagName) => ['property', 'image', 'feature'].includes(tagName),
//     });

//     const parsed = parser.parse(xmlData);
//     const properties = parsed.root?.property || [];
//     const propertyArray = Array.isArray(properties) ? properties : [properties];

//     let created = 0;
//     let updated = 0;
//     let failed = 0;

//     for (const prop of propertyArray) {
//       try {
//         if (!prop.id) continue;

//         const mappedData = mapKyeroToListing(prop, feedUrl);

//         // **এখানে আপডেট লজিক**
//         const existing = await Listing.findOne({ kyeroId: prop.id });

//         if (existing) {
//           // আপডেট করো
//           Object.assign(existing, mappedData);
//           await existing.save();
//           updated++;
//         } else {
//           // নতুন তৈরি করো
//           await Listing.create(mappedData);
//           created++;
//         }
//       } catch (err: any) {
//         failed++;
//         console.error(`❌ Failed property ${prop.id || prop.ref}:`, err.message);
//       }
//     }

//     console.log(`✅ Kyero Import Completed → Created: ${created}, Updated: ${updated}, Failed: ${failed}`);

//     return { created, updated, failed, total: propertyArray.length };

//   } catch (error: any) {
//     console.error('❌ Kyero Import Error:', error.message);
//     throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `Kyero feed import failed: ${error.message}`);
//   }
// };

// // ===================== CRON =====================
// export const startKyeroCron = (feedUrl: string) => {
//   // প্রতি ১ ঘণ্টায় (০ মিনিটে)
//   cron.schedule('0 * * * *', () => importKyeroFeed(feedUrl));
  
//   console.log('🕒 Kyero auto importer started (every hour)');
// };

// // Manual run করার জন্য
// export const runKyeroImportNow = importKyeroFeed;

import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import cron from 'node-cron';
import { Listing } from './listing.model';
import { TListing } from './listing.interface';
import { LISTING_STATUS, LISTING_TYPE, PROPERTY_TYPE, FEATURES } from './listing.constant';
import { Types } from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';

const mapKyeroToListing = (property: any, feedUrl: string): Partial<TListing> => {
  const isRent = property.price_freq === 'month';

  // Improved Property Type Mapping
  const typeMap: Record<string, PROPERTY_TYPE> = {
    'villa': PROPERTY_TYPE.VILLA,
    'detached house': PROPERTY_TYPE.DETACHED,
    'semi-detached house': PROPERTY_TYPE.SEMI_DETACHED,
    'terraced house': PROPERTY_TYPE.TERRACED,
    'bungalow': PROPERTY_TYPE.BUNGLOW,
    'flat': PROPERTY_TYPE.FLAT,
    'apartment': PROPERTY_TYPE.APARTMENT,
    'country house': PROPERTY_TYPE.COUNTRY_HOUSE,
    // আরও যোগ করতে পারো
  };

  // ==================== FEATURES ====================
  let features: string[] = [];   // string[] রাখলাম যাতে enum না মিললেও আসে

  if (property.features?.feature) {
    const featList = Array.isArray(property.features.feature) 
      ? property.features.feature 
      : [property.features.feature];

    featList.forEach((f: any) => {
      if (typeof f === 'string') {
        const upper = f.toUpperCase().trim().replace(/\s+/g, '_');
        // যদি enum এ মিলে তাহলে enum value নাও, না মিললে raw value নাও
        if (Object.values(FEATURES).includes(upper as FEATURES)) {
          features.push(upper);
        } else {
          features.push(f.trim()); // raw feature রাখো
        }
      }
    });
  }

  return {
    title: `${property.town || 'Property'} - ${property.ref || property.id}`,
    listingType: isRent ? LISTING_TYPE.RENT : LISTING_TYPE.SALE,
    askingPrice: Number(property.price) || 0,
    country: (property.country || 'Spain').toUpperCase(),
    city: property.town || '',
    postalCode: property.postcode || '',

    agentId: new Types.ObjectId("6a0a9889b05aa2670a4c3796"), // পরে .env থেকে নিবে

    // Media
    photos: extractPhotos(property.images),
    videos: property.video_url ? [property.video_url] : [],
    threeSixtyTour: property.virtual_tour_url,

    propertyType: typeMap[property.type?.toLowerCase()] || PROPERTY_TYPE.FLAT,
    propertyBedrooms: Number(property.beds) || 0,
    propertyBathrooms: Number(property.baths) || 0,
    propertySquareFoot: Number(property.surface_area?.built) || undefined,

    features,   // ← এখন সব features আসবে
    description: property.desc?.en || property.desc?.es || 'No description available',

    status: LISTING_STATUS.PUBLISHED,
    isFeatured: property.prime === '1' || property.prime === 1,

    location: property.location?.latitude && property.location?.longitude ? {
      type: 'Point',
      coordinates: [
        Number(property.location.longitude),
        Number(property.location.latitude)
      ],
      address: property.location_detail || `${property.town}, ${property.province}`,
    } : undefined,

    kyeroId: property.id,
    kyeroRef: property.ref,
    source: "kyero",
    sourceUrl: feedUrl,
    lastSyncedAt: new Date(),
  };
};

const extractPhotos = (images: any): string[] => {
  if (!images?.image) return [];

  const imageList = Array.isArray(images.image) ? images.image : [images.image];

  return imageList
    .map((img: any) => img.url || img)
    .filter(Boolean)
    .slice(0, 20);
};

// ===================== MAIN IMPORT =====================
export const importKyeroFeed = async (feedUrl: string) => {
  try {
    console.log(`🔄 Kyero Feed Import Started: ${feedUrl}`);

    const { data: xmlData } = await axios.get(feedUrl, { 
      timeout: 90000,
      headers: { 'Accept': 'application/xml, text/xml' }
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true,
      trimValues: true,
      isArray: (tagName) => ['property', 'image', 'feature'].includes(tagName),
    });

    const parsed = parser.parse(xmlData);
    const properties = parsed.root?.property || parsed.property || [];
    const propertyArray = Array.isArray(properties) ? properties : [properties];

    let created = 0;
    let updated = 0;
    let failed = 0;
    const errors: any[] = [];

    for (const prop of propertyArray) {
      try {
        if (!prop.id) {
          throw new Error("Missing property id");
        }

        const mappedData = mapKyeroToListing(prop, feedUrl);

        const existing = await Listing.findOne({ kyeroId: prop.id });

        if (existing) {
          Object.assign(existing, mappedData);
          await existing.save();
          updated++;
        } else {
          await Listing.create(mappedData);
          created++;
        }
      } catch (err: any) {
        failed++;
        errors.push({
          kyeroId: prop.id,
          error: err.message
        });
        console.error(`❌ Failed ${prop.id}:`, err.message);
      }
    }

    const result = { created, updated, failed, total: propertyArray.length, errors };
    console.log(`✅ Kyero Import Completed`, result);

    return result;

  } catch (error: any) {
    console.error('❌ Kyero Import Error:', error.message);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const startKyeroCron = (feedUrl: string) => {
  cron.schedule('*/1 * * * *', () => importKyeroFeed(feedUrl));
  console.log('🕒 Kyero auto importer started (every minute)');
};

export const runKyeroImportNow = importKyeroFeed;