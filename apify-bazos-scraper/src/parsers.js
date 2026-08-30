import { CURRENCY } from './constants.js';
import { adIdFromUrl } from './urls.js';

const clean = (t) => (t ?? '').replace(/\s+/g, ' ').trim();

/** "  12 790 €" -> 12790 ; "Dohodou" -> null */
export function parsePrice(raw) {
    const text = clean(raw);
    const digits = text.replace(/[^\d]/g, '');
    if (!digits) return { price: null, priceText: text || null };
    return { price: Number(digits), priceText: text };
}

/** "[30.8. 2026]" -> "2026-08-30" */
export function parseDate(raw) {
    const m = clean(raw).match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
    if (!m) return null;
    const [, d, mo, y] = m;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Parse one `.inzeraty` block from a listing page. */
export function parseListItem($, el, country, baseUrl) {
    const $el = $(el);
    const $link = $el.find('.inzeratynadpis h2.nadpis a, .inzeratynadpis .nadpis a').first();
    const href = $link.attr('href');
    if (!href) return null;

    const url = new URL(href, baseUrl ?? `https://www.bazos.${country}`).toString();
    const { price, priceText } = parsePrice($el.find('.inzeratycena').first().text());

    const lokHtml = $el.find('.inzeratylok').first().html() ?? '';
    const [locRaw, zipRaw] = lokHtml.split(/<br\s*\/?>/i);
    const zipCode = clean($('<div>').html(zipRaw ?? '').text()) || null;

    return {
        id: adIdFromUrl(url),
        url,
        title: clean($link.text()),
        price,
        priceText,
        priceType: priceType(priceText),
        currency: CURRENCY[country],
        location: clean($('<div>').html(locRaw ?? '').text()) || null,
        zipCode,
        latitude: null,
        longitude: null,
        postedAt: parseDate($el.find('.velikost10').first().text()),
        isTop: $el.find('.ztop').length > 0,
        topUntil: parseDate($el.find('.ztop').attr('title') ?? ''),
        views: Number(clean($el.find('.inzeratyview').first().text()).replace(/[^\d]/g, '')) || null,
        description: clean($el.find('.popis').first().text()) || null,
        ...extractContacts(`${clean($link.text())} ${$el.find('.popis').first().text()}`, country),
        mainImage: $el.find('img.obrazek').first().attr('src') ?? null,
        images: [],
        imagesCount: null,
        category: categoryFromUrl(url),
        country,
        sellerName: null,
        sellerId: null,
        sellerRatingToken: null,
        phoneMasked: null,
        scrapedAt: new Date().toISOString(),
    };
}


/** Enrich a list item with data only present on the ad detail page. */
export function parseDetail($, base, pageUrl) {
    const url = base.url ?? pageUrl;
    const country = base.country ?? (url?.includes('bazos.cz') ? 'cz' : 'sk');
    const html = $.html().replace(/&#0?39;|&apos;/g, "'").replace(/&amp;/g, '&');

    const images = [];
    $('.carousel .carousel-cell img').each((_, img) => {
        const src = $(img).attr('data-flickity-lazyload') || $(img).attr('src');
        if (src && !images.includes(src)) images.push(src);
    });

    const description = clean($('.popisdetail').first().text()) || base.description;

    // Seller name comes from odeslatakci('rating', ratingCount, userId, 'Name')
    const rating = html.match(/odeslatakci\('rating','(\d+)','(\d+)','([^']*)'\)/);

    // Bazoš hides the full phone behind a verified-account gate; we keep the
    // visible masked prefix and additionally mine the ad text for contacts.
    const phoneMasked = clean($('.teldetail').first().text()).split(' ')[0] || null;
    const contacts = extractContacts(`${clean($('h1.nadpisdetail').first().text())} ${description ?? ''}`, country);

    // Header: " - TOP - [30.8. 2026]"
    const $head = $('.inzeratydetnadpis .velikost10').first();
    const isTop = $head.find('.ztop').length > 0 || base.isTop || false;
    const topUntil = parseDate($head.find('.ztop').attr('title') ?? '');
    const postedAt = parseDate($head.text().match(/\[([^\]]+)\]/)?.[1] ?? '') ?? base.postedAt ?? null;

    // Info table: Lokalita (zip + city + GPS), Videlo, Cena
    const $info = $('.teldetail').closest('table');
    const mapHref = $info.find('a[href*="google.com/maps"]').first().attr('href') ?? '';
    const gps = mapHref.match(/place\/(-?[\d.]+),(-?[\d.]+)/);
    const zipCode = clean($info.find('a[href*="google.com/maps"]').first().text()) || base.zipCode || null;
    const location = clean($info.find('a[href*="/inzeraty/"]').first().text()) || base.location || null;

    let views = base.views ?? null;
    const viewsMatch = html.match(/(?:Videlo|Vid\u011blo|Viden\u00e9|Zobrazeno):?\s*<\/td>\s*<td[^>]*>(?:\s*<br\s*\/?>)*\s*([\d\s]+)/i);
    if (viewsMatch) views = Number(viewsMatch[1].replace(/\D/g, '')) || views;

    const { price, priceText } = parsePrice($('.popisdetail').parent().find('span[translate="no"]').last().text());
    const finalPriceText = base.priceText ?? priceText;

    return {
        ...base,
        id: base.id ?? adIdFromUrl(url ?? ''),
        url,
        country,
        title: clean($('h1.nadpisdetail').first().text()) || base.title || null,
        description,
        images,
        imagesCount: images.length,
        mainImage: base.mainImage ?? images[0] ?? null,
        price: base.price ?? price,
        priceText: finalPriceText,
        priceType: priceType(finalPriceText),
        currency: CURRENCY[country],
        location,
        zipCode,
        latitude: gps ? Number(gps[1]) : null,
        longitude: gps ? Number(gps[2]) : null,
        postedAt,
        isTop,
        topUntil,
        views,
        category: base.category ?? categoryFromUrl(url ?? ''),
        sellerName: rating ? clean(rating[3].replace(/\+/g, ' ')) || null : null,
        sellerId: rating?.[2] ?? null,
        sellerRatingToken: rating?.[1] ?? null,
        email: contacts.email,
        emails: contacts.emails,
        phone: contacts.phone,
        phones: contacts.phones,
        phoneMasked,
        scrapedAt: base.scrapedAt ?? new Date().toISOString(),
    };
}

/** Bazoš subdomain = category slug. */
export function categoryFromUrl(url) {
    try {
        const sub = new URL(url).hostname.split('.')[0];
        return sub === 'www' ? null : sub;
    } catch {
        return null;
    }
}

/** "Dohodou" / "V texte" / "Zadarmo" / fixed number. */
export function priceType(text) {
    const t = (text ?? '').toLowerCase();
    if (!t) return null;
    if (/dohod/.test(t)) return 'agreement';
    if (/text/.test(t)) return 'in_text';
    if (/zadarmo|zdarma|darujem|daruji/.test(t)) return 'free';
    if (/\d/.test(t)) return 'fixed';
    return 'other';
}


/**
 * Pull phone numbers / e-mails out of free ad text.
 * Handles common obfuscation: "zavinac", "(at)", "bodka/tecka", spaced or
 * dotted digits, missing leading zero, +420/+421 prefixes.
 */
export function extractContacts(text, country) {
    const t = clean(text);
    if (!t) return { phone: null, phones: [], email: null, emails: [] };

    // De-obfuscate e-mails: "meno (zavinac) gmail bodka com"
    const deob = t
        .replace(/\s*[({\[]?\s*(?:zavin[a\u00e1][c\u010d]|zavinac|\(at\)|\[at\]|\sat\s)\s*[)}\]]?\s*/gi, '@')
        .replace(/\s*[({\[]?\s*(?:bodka|te[c\u010d]ka|\(dot\)|\[dot\])\s*[)}\]]?\s*/gi, '.');

    const emails = [];
    for (const m of deob.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}/gi)) {
        const e = m[0].toLowerCase().replace(/[.,;]+$/, '');
        if (!/bazos\.|example\./i.test(e) && !emails.includes(e)) emails.push(e);
    }

    // Phones: +421/+420/00421/0 prefixed, or bare 9-digit CZ/SK numbers.
    const cc = country === 'cz' ? '420' : '421';
    const phones = [];
    const flat = t.replace(/[.\-/()]/g, ' ');
    for (const m of flat.matchAll(/(?:(?:\+|00)\s?42[01]\s?|0)?\d{3}\s?\d{3}\s?\d{3}(?!\d)/g)) {
        const raw = m[0];
        let d = raw.replace(/\D/g, '');
        if (d.startsWith('00')) d = d.slice(2);
        if (d.length === 12 && /^42[01]/.test(d)) d = d.slice(3);
        if (d.length === 10 && d.startsWith('0')) d = d.slice(1);
        if (d.length !== 9 || !/^[679]/.test(d)) continue;
        const prefix = /42[01]/.test(raw.replace(/\D/g, '').slice(0, 4)) ? raw.replace(/\D/g, '').match(/42[01]/)[0] : cc;
        const value = `+${prefix}${d}`;
        if (!phones.includes(value)) phones.push(value);
    }

    return {
        phone: phones[0] ?? null,
        phones,
        email: emails[0] ?? null,
        emails,
    };
}
