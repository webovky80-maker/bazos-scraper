import { CATEGORIES, SORT } from './constants.js';

/**
 * Build a Bazoš listing URL.
 *
 * Bazoš uses two shapes:
 *  - all categories -> https://www.bazos.sk/search.php?rubriky=www&...
 *  - one category   -> https://mobil.bazos.sk/?hledat=...&crz=20
 * (www.bazos.sk/search.php?rubriky=mobil just 301s to the second shape.)
 */
export function buildSearchUrl({ country, category, searchQuery, priceMin, priceMax, zipCode, radiusKm, sort }, offset = 0) {
    const slug = CATEGORIES[country]?.[category] ?? null;

    const params = new URLSearchParams();
    params.set('hledat', searchQuery ?? '');
    params.set('hlokalita', zipCode ?? '');
    params.set('humkreis', zipCode ? String(radiusKm ?? 25) : '0');
    params.set('cenaod', priceMin != null ? String(priceMin) : '');
    params.set('cenado', priceMax != null ? String(priceMax) : '');
    params.set('order', SORT[sort] ?? '');
    params.set('crz', String(offset));

    if (!slug) {
        params.set('rubriky', 'www');
        return `https://www.bazos.${country}/search.php?${params.toString()}`;
    }
    params.delete('crz');
    const path = offset > 0 ? `/${offset}/` : '/';
    return `https://${slug}.bazos.${country}${path}?${params.toString()}`;
}

export function isDetailUrl(url) {
    return /\/inzerat\/\d+\//.test(url);
}

export function adIdFromUrl(url) {
    return url.match(/\/inzerat\/(\d+)\//)?.[1] ?? null;
}

/** Offset encoded in a Bazoš pagination link (path `/40/` or `crz=40`). */
export function offsetFromUrl(url) {
    const u = new URL(url, 'https://www.bazos.sk');
    const crz = u.searchParams.get('crz');
    if (crz != null && crz !== '') return Number(crz) || 0;
    return Number(u.pathname.match(/^\/(\d+)\/?$/)?.[1] ?? 0) || 0;
}
