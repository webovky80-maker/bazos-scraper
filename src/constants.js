/** Category slug (= Bazoš subdomain) per country. */
export const CATEGORIES = {
    sk: {
        all: null,
        auto: 'auto',
        motocykle: 'motocykle',
        reality: 'reality',
        praca: 'praca',
        zvierata: 'zvierata',
        dom: 'dom',
        elektro: 'elektro',
        mobil: 'mobil',
        pc: 'pc',
        foto: 'foto',
        stroje: 'stroje',
        deti: 'deti',
        oblecenie: 'oblecenie',
        sport: 'sport',
        hudba: 'hudba',
        knihy: 'knihy',
        nabytok: 'nabytok',
        sluzby: 'sluzby',
        vstupenky: 'vstupenky',
        ostatne: 'ostatne',
    },
    cz: {
        all: null,
        auto: 'auto',
        motocykle: 'motorky',
        reality: 'reality',
        praca: 'prace',
        zvierata: 'zvirata',
        dom: 'dum',
        elektro: 'elektro',
        mobil: 'mobil',
        pc: 'pc',
        foto: 'foto',
        stroje: 'stroje',
        deti: 'deti',
        oblecenie: 'obleceni',
        sport: 'sport',
        hudba: 'hudba',
        knihy: 'knihy',
        nabytok: 'nabytek',
        sluzby: 'sluzby',
        vstupenky: 'vstupenky',
        ostatne: 'ostatni',
    },
};

/** Bazoš `order` query values. */
export const SORT = {
    newest: '',
    cheapest: '1',
    most_expensive: '2',
};

export const CURRENCY = { sk: 'EUR', cz: 'CZK' };

/** Ads per listing page - Bazoš is fixed at 20. */
export const PAGE_SIZE = 20;

export const LABELS = {
    LIST: 'LIST',
    DETAIL: 'DETAIL',
};
