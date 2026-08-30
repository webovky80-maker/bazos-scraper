# 🇸🇰🇨🇿 Bazoš Scraper – Ads, Prices & Seller Contacts from Bazos.sk & Bazos.cz

Extract classified ads from [Bazoš.sk](https://www.bazos.sk) and [Bazoš.cz](https://www.bazos.cz) — Slovakia's and Czechia's most popular free classifieds sites. Get **titles, prices, descriptions, locations, photos, and seller contacts** (phone & e-mail) for any keyword or category, no coding required.

---

## 📑 Table of Contents

- [Why use this Actor](#-why-use-bazoš-scraper)
- [Input parameters](#-input-parameters)
- [Usage examples](#-usage-examples)
- [Output data](#-output-data)
- [Cost](#-cost)
- [How to run](#-how-to-run)
- [FAQ](#-faq)
- [Privacy & legal](#️-privacy--legal)

---

## ✨ Why Use Bazoš Scraper?

- CZ/SK **Both countries, one Actor** — switch between Bazos.sk and Bazos.cz with a single input field, categories are automatically mapped to each site's own naming.
- 🎯 **Real search filters** — keyword, category, min/max price, ZIP code + radius, and sort order, just like the site itself.
- 📞 **Seller contact extraction** — phone numbers and e-mails are pulled and de-obfuscated automatically, even when sellers write them as "meno (zavináč) gmail bodka com".
- 🖼️ **Full ad details on demand** — description, all photos, view count, seller name, and GPS coordinates when you enable detail scraping.
- 💸 **Cheap by default** — listing-only mode costs almost nothing; detail scraping is optional and only runs when you turn it on.
- 🛡️ **Credit-safe** — a hard `maxItems` limit stops the run before it can overspend.
- 🔌 **Works everywhere** — Apify Console, CLI, REST API, JS/Python client, or a Schedule for daily monitoring of new listings.

---

## 📥 Input Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `country` | Select | `sk` | Which site to scrape: `sk` (Bazos.sk) or `cz` (Bazos.cz) |
| `searchQuery` | String | `""` | What to search for, e.g. `iphone 13`. Leave empty to list the whole category |
| `category` | Select | `all` | Section to search in — `all` searches every section |
| `startUrls` | Array | `[]` | Paste Bazoš listing or ad URLs directly. Overrides the filters above |
| `priceMin` | Integer | — | Minimum price (EUR on .sk, CZK on .cz) |
| `priceMax` | Integer | — | Maximum price (EUR on .sk, CZK on .cz) |
| `zipCode` | String | `""` | Postal code used as the centre of a radius search, e.g. `82105` |
| `radiusKm` | Integer | `25` | Distance from the ZIP code — only used when `zipCode` is set |
| `sort` | Select | `newest` | Order of results: newest, cheapest, most expensive |
| `maxItems` | Integer | `100` | Hard cap on saved results — your main credit-protection setting 🛡️ |
| `scrapeDetails` | Boolean | `false` | Off = fast, listing data only. On = adds phone, e-mail, seller name, view count, and all photos |
| `maxConcurrency` | Integer | `5` | Parallel requests |
| `proxyConfiguration` | Object | off | Optional Apify Proxy — only needed if you get blocked |

> 💡 Nothing is required — just pick a country and category and go.

---

## 📖 Usage Examples

### 1. 📱 Cheapest run — just headlines

```json
{
  "country": "sk",
  "category": "mobil",
  "searchQuery": "iphone 13",
  "maxItems": 100
}
```

### 2. 📞 Full ad details with seller contacts, near a ZIP code

```json
{
  "country": "cz",
  "category": "auto",
  "zipCode": "10000",
  "radiusKm": 50,
  "maxItems": 50,
  "scrapeDetails": true
}
```

### 3. 💰 Price-filtered search, cheapest first

```json
{
  "country": "sk",
  "searchQuery": "notebook",
  "priceMin": 100,
  "priceMax": 500,
  "sort": "cheapest",
  "maxItems": 200
}
```

### 4. 🔗 Scrape a specific ad or listing URL directly

```json
{
  "startUrls": ["https://mobil.bazos.sk/inzerat/12345678/iphone-15-pro.php"],
  "scrapeDetails": true
}
```

---

## 📤 Output Data

Results land in your Apify Dataset and can be exported as **JSON, CSV, Excel, XML, or HTML**.

Each ad includes: `title`, `description`, `price`, `priceText`, `priceType`, `currency`, `location`, `zipCode`, `latitude`/`longitude`, `postedAt`, `isTop`, `views`, `category`, `mainImage`, `images`, `imagesCount`, `sellerName`, `phone`, `phones`, `email`, `emails`, `url`, and `scrapedAt`.

> 📞 Contact fields (`phone`, `email`, and their arrays) are only fully populated when `scrapeDetails` is turned on.

---

## 💸 Cost

Cost mainly depends on `maxItems` and whether `scrapeDetails` is on.

| Mode | 100 results | 1,000 results |
|---|---|---|
| ⚡ Headlines only | seconds | ~1 min |
| 📞 Full details + contacts | ~10–30 s | ~1–3 min |

**Tips to keep costs low:**
1. 🛡️ Always set `maxItems`.
2. ⚡ Leave `scrapeDetails` off if you only need titles, prices, and locations.
3. 🔀 Keep `maxConcurrency` around 5 — Bazoš doesn't need aggressive parallelism.
4. 🌍 Use `zipCode` + `radiusKm` to narrow results to a region instead of scraping everything.

---

## 🚀 How to Run

1. Open the Actor in the [Apify Console](https://console.apify.com).
2. Pick a `country`, `category`, and optional `searchQuery`.
3. Click **Start** ▶️.
4. Download your results from the **Dataset** tab.

It also works from the Apify CLI, the REST API, the JS/Python client, or on a Schedule — for example, a daily run to catch new listings for a keyword you're watching.

---

## 🔧 Troubleshooting

| Problem | Likely fix |
|---|---|
| 📭 Empty dataset | Category/keyword too narrow — try `category: "all"` or a broader keyword |
| 📞 No phone/e-mail | Seller didn't include one, or `scrapeDetails` is off — turn it on |
| 🚫 Errors / timeouts | Enable `proxyConfiguration` and lower `maxConcurrency` |
| 🐌 Slow run | Lower `maxItems` or disable `scrapeDetails` |

---

## ❓ FAQ

**Does this work for both Slovakia and Czechia?**
Yes — set `country` to `sk` for Bazos.sk or `cz` for Bazos.cz. Categories, currency, and phone number formatting are all handled automatically for each.

**Can I search by location?**
Yes — set `zipCode` and `radiusKm` to only get ads near a specific area.

**Can I get seller phone numbers and e-mails?**
Yes, when the seller included them in the ad — turn on `scrapeDetails` to extract and de-obfuscate them automatically.

**Can I monitor new listings for a keyword?**
Yes — schedule a daily run with your `searchQuery` and a `sort: "newest"` to catch new ads as they're posted.

**Is this legal?**
Only publicly available ad data is collected. Contact details (phone numbers, e-mails) count as personal data under GDPR — how you use them afterward is your responsibility.

---

## ⚖️ Privacy & Legal

- ✅ Only scrapes **publicly available** ad data.
- ✅ Respects Bazoš's robots.txt and terms of service.
- ⚠️ Extracted seller contact details may be personal data under GDPR — make sure you have a valid reason to process them.
- ℹ️ This Actor is just an automation tool; how you use the extracted data is your own responsibility.

---

> **Keywords:** Bazoš scraper, Bazos.sk scraper, Bazos.cz scraper, Slovak classifieds scraper, Czech classifieds scraper, scrape Bazoš ads, Bazoš seller contacts, classifieds data Slovakia, classifieds data Czech Republic, second-hand marketplace scraper.

**Happy scraping! 🚀**
