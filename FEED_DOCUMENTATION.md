# XML Feed Documentation

This document describes how to format your XML feed for importing properties into our platform.

## Demo Feed
You can test using our demo feed available at:
```
http://your-server-url/demo-feed.xml
```
(Replace `your-server-url` with your actual server address, e.g., `http://localhost:3000`)

## Feed Format

Your XML feed should follow this structure:

```xml
<properties>
  <property>
    <!-- Required Fields -->
    <externalId>unique-property-id</externalId>
    <title>Property Title</title>
    <price>250000</price>
    <listingType>SALE</listingType>

    <!-- Location -->
    <location>
      <country>Bangladesh</country>
      <city>Dhaka</city>
      <postalCode>1212</postalCode>
      <address>Full Address Here</address>
      <lat>23.8103</lat>
      <lng>90.4125</lng>
    </location>

    <!-- Property Details -->
    <details>
      <bedrooms>3</bedrooms>
      <bathrooms>2</bathrooms>
      <squareFoot>1500</squareFoot>
      <propertyType>APARTMENT</propertyType>
      <tenure>FREEHOLD</tenure>
      <councilTaxBand>B</councilTaxBand>
    </details>

    <!-- Media -->
    <media>
      <photos>
        <photo>https://example.com/photo1.jpg</photo>
        <photo>https://example.com/photo2.jpg</photo>
      </photos>
      <videos>
        <video>https://example.com/video1.mp4</video>
      </videos>
    </media>

    <!-- Features -->
    <features>
      <feature>Swimming Pool</feature>
      <feature>Garden</feature>
    </features>

    <!-- Description -->
    <description>Detailed property description here...</description>
  </property>
</properties>
```

## Field Descriptions

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `externalId` | String | Unique ID for the property (must be unique per feed) |
| `title` | String | Property title |
| `price` | Number | Asking price |
| `listingType` | String | Either `SALE` or `RENT` |

### Optional Fields

#### Location
| Field | Type | Description |
|-------|------|-------------|
| `country` | String | Country name |
| `city` | String | City name |
| `postalCode` | String | Postal/ZIP code |
| `address` | String | Full property address |
| `lat` | Number | Latitude |
| `lng` | Number | Longitude |

#### Property Details
| Field | Type | Description |
|-------|------|-------------|
| `bedrooms` | Number | Number of bedrooms |
| `bathrooms` | Number | Number of bathrooms |
| `squareFoot` | Number | Property area in square feet |
| `propertyType` | String | Property type (e.g., APARTMENT, VILLA, STUDIO) |
| `tenure` | String | Tenure type (e.g., FREEHOLD, LEASEHOLD) |
| `councilTaxBand` | String | Council tax band |

#### Media
| Field | Type | Description |
|-------|------|-------------|
| `photos` | Array | List of photo URLs |
| `videos` | Array | List of video URLs |

#### Other
| Field | Type | Description |
|-------|------|-------------|
| `features` | Array | List of property features |
| `description` | String | Detailed property description |

## How to Use

1. **Create your XML feed** following the format above
2. **Host your XML feed** on a publicly accessible URL
3. **Add the feed** via our agent dashboard or API:
   ```
   POST /api/v1/agent-feeds
   {
     "feedUrl": "https://your-site.com/your-feed.xml",
     "name": "My Property Feed"
   }
   ```
4. **Sync your feed** (automatically hourly or manually via API)

## Testing
Use our demo feed to test: `http://your-server-url/demo-feed.xml`

## Important Notes
- All properties must have a unique `externalId`
- Deleted properties in your feed will be soft-deleted in our system
- Updates to existing properties will be reflected in our system
