# Bazoš.cz / Bazoš.sk Scraper — CZ & SK Classified Ads

Extract structured data from [Bazoš.sk](https://www.bazos.sk) and [Bazoš.cz](https://www.bazos.cz), the biggest classifieds (bazár / bazar) sites in Slovakia and Czechia — **titles, prices, locations, ZIP codes, dates, descriptions, all photos, seller names and contacts** — no coding required.

---

## 📑 Table of Contents

- [Why use this Actor](#-why-use-this-actor)
- [What you can scrape](#️-what-can-you-scrape)
- [Input parameters](#-input-parameters)
- [Usage examples](#-usage-examples)
- [Output data](#-output-data)
- [Cost](#-cost)
- [How to run](#-how-to-run)
- [FAQ](#-faq)
- [Privacy & legal](#️-privacy--legal)

---

## ✨ Why Use This Actor?

- 🇸🇰🇨🇿 **Two countries, one Actor** — flip a dropdown between `bazos.sk` and `bazos.cz`.
- 🪶 **Extremely light on resources** — pure HTTP + Cheerio, **no browser**, runs fine in **256 MB**. One request returns 20 ads.
- 💸 **Credit-safe by design** — a hard `maxItems` limit aborts the run the second your budget is hit.
- 🎯 **Flexible filtering** — keyword, category, price range, PSČ/ZIP + radius, sorting.
- 📞 **Contact mining** — phone numbers and e-mails written in the ad title/description are parsed out automatically, normalised to `+421`/`+420` format (`phone`, `phones[]`, `email`, `emails[]`). Obfuscated e-mails such as `meno (zavinac) gmail bodka com` are decoded too.
- 🖼️ **All photos** — every image from the ad gallery in full resolution (detail mode).
- 🔌 **Works everywhere** — Apify Console, CLI, API, or a daily Schedule. Export to JSON, CSV, Excel, XML.

---

## 🗂️ What Can You Scrape?

| Mode | Requests used | Fields you get |
|---|---|---|
| **List only** (`scrapeDetails = false`, default) | **1 request per 20 ads** | title, price, currency, location, ZIP, date, views, short description, main image, URL, ID, TOP flag, phone/e-mail found in the text |
| **With details** (`scrapeDetails = true`) | 1 request per ad | everything above **+ full description, all images, seller name, seller ID, masked phone prefix** |

Supported categories (SK / CZ equivalents are mapped automatically):
Auto · Motocykle · Reality · Práca · Zvieratá · Dom a záhrada · Elektro · Mobily · PC · Foto · Stroje · Detský bazár · Oblečenie · Šport · Hudba · Knihy · Nábytok · Služby · Vstupenky · Ostatné — or **Všetko / Vše**.

---

## 📥 Input Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `country` | Select | `sk` | `sk` = bazos.sk, `cz` = bazos.cz |
| `searchQuery` | String | `""` | Keyword, e.g. `iphone 13`. Empty = whole category. |
| `category` | Select | `all` | Bazoš section to search in |
| `startUrls` | Array | `[]` | Paste exact Bazoš listing or ad URLs. Overrides the filters above. |
| `priceMin` / `priceMax` | Integer | – | Price range (EUR for `.sk`, CZK for `.cz`) |
| `zipCode` | String | `""` | PSČ / ZIP used as the centre of the radius search, e.g. `82105` |
| `radiusKm` | Integer | `25` | Radius around the ZIP code |
| `sort` | Select | `newest` | `newest`, `cheapest`, `most_expensive` |
| `maxItems` | Integer | `100` | **Hard limit** — the run stops here |
| `scrapeDetails` | Boolean | `false` | Open each ad for full description, all photos and seller info |
| `maxConcurrency` | Integer | `5` | Parallel requests |
| `proxyConfiguration` | Proxy | off | Optional — Bazoš normally works without a proxy |

---

## 🚀 Usage Examples

**Cheapest iPhones in Slovakia (super cheap run):**

```json
{
  "country": "sk",
  "searchQuery": "iphone 13",
  "category": "mobil",
  "sort": "cheapest",
  "maxItems": 100
}
```

**Cars up to 5 000 € within 50 km of Bratislava, with photos and seller info:**

```json
{
  "country": "sk",
  "category": "auto",
  "priceMax": 5000,
  "zipCode": "82105",
  "radiusKm": 50,
  "scrapeDetails": true,
  "maxItems": 200
}
```

**Czech furniture, daily monitoring:**

```json
{
  "country": "cz",
  "category": "nabytok",
  "sort": "newest",
  "maxItems": 500
}
```

**Specific URLs:**

```json
{
  "country": "sk",
  "startUrls": [{ "url": "https://auto.bazos.sk/skoda/" }],
  "maxItems": 60
}
```

---

## 📤 Output Data

One dataset item per ad:

```json
{
  "id": "194883410",
  "url": "https://mobil.bazos.sk/inzerat/194883410/apple-iphone-13-256gb-100-zdravie-baterky.php",
  "title": "Apple iPhone 13 256GB 100% Zdravie baterky",
  "price": 280,
  "priceText": "280 €",
  "priceType": "fixed",
  "currency": "EUR",
  "location": "Bratislava",
  "zipCode": "821 06",
  "latitude": 48.133752,
  "longitude": 17.206232,
  "postedAt": "2026-08-30",
  "isTop": true,
  "topUntil": "2026-09-15",
  "views": 942,
  "description": "Predám komplet fungčný Apple iPhone 13 256GB...",
  "mainImage": "https://www.bazos.sk/img/1t/410/194883410.jpg",
  "images": ["https://www.bazos.sk/img/1/410/194883410.jpg", "..."],
  "imagesCount": 4,
  "category": "mobil",
  "country": "sk",
  "sellerName": "Apple",
  "sellerId": "2719268",
  "sellerRatingToken": 0,
  "phone": "+421903815185",
  "phones": ["+421903815185"],
  "phoneMasked": "094...",
  "email": null,
  "emails": [],
  "scrapedAt": "2026-08-30T11:46:26.369Z"
}
```

Export as **JSON, CSV, Excel, XML or HTML table** straight from the Apify Console, or pull it via the API.

---

## 💰 Cost

The Actor is HTTP-only, so it is about as cheap as an Apify run gets:

| Scenario | Requests | Typical usage |
|---|---|---|
| 100 ads, list only | ~5 | a few seconds, 256 MB |
| 1 000 ads, list only | ~50 | under a minute |
| 1 000 ads, with details | ~1 050 | a few minutes |

Keep `scrapeDetails` off unless you actually need the full description, photos or seller name — it is roughly **20× cheaper**.

---

## ▶️ How to Run

**Apify Console** — open the Actor, fill in the form, hit **Start**.

**Apify CLI**

```bash
apify login
apify call your-username/bazos-cz-sk-scraper --input '{"country":"sk","searchQuery":"iphone","maxItems":50}'
```

**Locally**

```bash
npm install
npx apify run -p
```

**Deploy your own copy**

```bash
apify push
```

---

## ❓ FAQ

**Do I need a proxy?**
No. Bazoš serves plain HTML. Turn on Apify Proxy only if you scrape very aggressively and start getting blocked.

**Why is `phone` sometimes empty?**
Bazoš hides the real phone number behind a *verified-account* gate, so it cannot be revealed anonymously. The Actor returns the visible masked prefix in `phoneMasked` and extracts any number the seller wrote directly into the ad text into `phone` (that covers a large share of ads).

**Can I scrape everything in a category?**
Yes — leave `searchQuery` empty and raise `maxItems`. Bazoš paginates in steps of 20 and the Actor follows its own paginator.

**How do I run it every day?**
Use Apify **Schedules**, and combine with `sort: newest` + a modest `maxItems` to only pick up fresh ads.

**Does it work for both Bazoš domains?**
Yes, `country` switches between `bazos.sk` and `bazos.cz`, including the different Czech category slugs.

---

## ⚖️ Privacy & Legal

This Actor collects only data that Bazoš publishes **publicly**, without logging in and without bypassing any authentication. Ads may contain personal data (names, phone numbers, e-mails) — if you store or process it you are the data controller and must comply with **GDPR**, including having a lawful basis and honouring data-subject requests. Do not use the output for spam or unsolicited marketing. Please scrape responsibly: keep `maxConcurrency` low and avoid unnecessary detail requests.
