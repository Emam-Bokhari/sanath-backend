export const FIELD_MAP = {
  EXTERNALID: "externalId",
  TITLE: "title",
  PRICE: "price",
  LISTINGTYPE: "listingType",
  COUNTRY: "country",
  CITY: "city",
  POSTALCODE: "postalCode",
  ADDRESS: "address",
  LAT: "lat",
  LNG: "lng",
  BEDROOMS: "bedrooms",
  BATHROOMS: "bathrooms",
  SQUAREFOOT: "squareFoot",
  PROPERTYTYPE: "propertyType",
  TENURE: "tenure",
  COUNCILTAXBAND: "councilTaxBand",
  EPCLABEL: "epcLabel",
  EPCSCORE: "epcScore",
  PHOTOS: "photos",
  VIDEOS: "videos",
  FLOORPLANS: "floorPlans",
  BROCHURE: "brochure",
  THREESIXTYTOUR: "threeSixtyTour",
  FEATURES: "features",
  DESCRIPTION: "description",
} as const;

export const parseBLMContent = (
  content: string,
): Array<Record<string, string>> => {
  if (!content) return [];

  // Split by row separator ~
  const rawRows = content.split("~");

  // Clean up rows: trim and filter out completely empty rows
  const cleanRows = rawRows.map((r) => r.trim()).filter((r) => r.length > 0);

  if (cleanRows.length === 0) return [];

  // First row is the header
  const headerRow = cleanRows[0];
  const headers = headerRow.split("^").map((h) => h.trim().toUpperCase());

  const results: Array<Record<string, string>> = [];

  for (let i = 1; i < cleanRows.length; i++) {
    const row = cleanRows[i];
    const fields = row.split("^").map((f) => f.trim());

    const rowObject: Record<string, string> = {};
    // Map headers to fields
    headers.forEach((header, index) => {
      if (header) {
        rowObject[header] = fields[index] !== undefined ? fields[index] : "";
      }
    });

    results.push(rowObject);
  }

  return results;
};

export const splitMultiValueField = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};