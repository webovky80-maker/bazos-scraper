import { Actor } from 'apify';
import { CheerioCrawler, log } from 'crawlee';

import { LABELS } from './constants.js';
import { buildSearchUrl, isDetailUrl, offsetFromUrl } from './urls.js';
import { parseListItem, parseDetail } from './parsers.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const {
    country = 'sk',
    searchQuery = '',
    category = 'all',
    startUrls = [],
    priceMin,
    priceMax,
    zipCode = '',
    radiusKm = 25,
    sort = 'newest',
    maxItems = 100,
    scrapeDetails = false,
    maxConcurrency = 5,
    proxyConfiguration: proxyInput,
} = input;

if (!['sk', 'cz'].includes(country)) throw new Error('`country` must be "sk" or "cz".');

const proxyConfiguration = await Actor.createProxyConfiguration(proxyInput);

const searchConfig = { country, category, searchQuery, priceMin, priceMax, zipCode, radiusKm, sort };

// ---- seed requests -------------------------------------------------------
const requests = [];
if (Array.isArray(startUrls) && startUrls.length) {
    for (const item of startUrls) {
        const url = typeof item === 'string' ? item : item.url;
        if (!url) continue;
        requests.push({
            url,
            label: isDetailUrl(url) ? LABELS.DETAIL : LABELS.LIST,
            userData: { offset: 0 },
        });
    }
} else {
    requests.push({ url: buildSearchUrl(searchConfig, 0), label: LABELS.LIST, userData: { offset: 0 } });
}

// ---- shared state --------------------------------------------------------
let saved = 0;
const seen = new Set();
const dataset = await Actor.openDataset();

const budgetReached = () => saved >= maxItems;

async function save(item, crawler) {
    if (budgetReached()) return;
    if (item.id && seen.has(item.id)) return;
    if (item.id) seen.add(item.id);
    await dataset.pushData(item);
    saved += 1;
    if (budgetReached()) {
        log.info(`Reached maxItems (${maxItems}) - stopping the crawl.`);
        await crawler.autoscaledPool?.abort();
    }
}

// ---- crawler -------------------------------------------------------------
const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxConcurrency,
    maxRequestRetries: 3,
    requestHandlerTimeoutSecs: 45,
    // Never download images / css - only the HTML we parse.
    additionalMimeTypes: [],
    preNavigationHooks: [
        async (_ctx, gotOptions) => {
            gotOptions.headers = {
                ...gotOptions.headers,
                'accept-language': country === 'cz' ? 'cs-CZ,cs;q=0.9' : 'sk-SK,sk;q=0.9',
            };
        },
    ],

    async requestHandler({ request, $, crawler: c }) {
        if (budgetReached()) return;
        const { label } = request;

        // ----- listing page -----
        if (label === LABELS.LIST) {
            const blocks = $('.inzeraty.inzeratyflex').toArray();
            const items = blocks
                .map((el) => parseListItem($, el, country, request.loadedUrl ?? request.url))
                .filter((it) => it && it.id && !seen.has(it.id));

            log.info(`List ${request.url} -> ${items.length} ads (saved ${saved}/${maxItems})`);

            if (scrapeDetails) {
                const room = maxItems - saved;
                await c.addRequests(
                    items.slice(0, room).map((it) => ({
                        url: it.url,
                        label: LABELS.DETAIL,
                        userData: { base: it },
                    })),
                );
            } else {
                for (const it of items) {
                    if (budgetReached()) break;
                    await save(it, c);
                }
            }

            // ----- pagination: follow Bazoš's own paginator -----
            const offset = request.userData.offset ?? 0;
            if (!scrapeDetails && budgetReached()) return;

            const pageBase = request.loadedUrl ?? request.url;
            let next = null;
            $('.strankovani a').each((_, a) => {
                const href = $(a).attr('href');
                if (!href) return;
                const abs = new URL(href, pageBase).toString();
                const off = offsetFromUrl(abs);
                if (off > offset && (next === null || off < next.off)) next = { url: abs, off };
            });

            if (next) {
                await c.addRequests([{ url: next.url, label: LABELS.LIST, userData: { offset: next.off } }]);
            }
            return;
        }

        // ----- detail page -----
        const base = request.userData.base ?? { country, url: request.loadedUrl ?? request.url };
        const item = parseDetail($, base, request.loadedUrl ?? request.url);

        await save(item, c);

    },

    failedRequestHandler({ request }, error) {
        log.warning(`Request failed 3x: ${request.url} (${error.message})`);
    },
});

function nextPageFromUrl(url, offset) {
    const u = new URL(url);
    u.searchParams.set('crz', String(offset));
    return u.toString();
}

log.info(`Starting Bazoš.${country} scraper - category "${category}", query "${searchQuery || '(any)'}", limit ${maxItems}.`);
await crawler.run(requests);
log.info(`Done. Saved ${saved} ads.`);

await Actor.exit();
