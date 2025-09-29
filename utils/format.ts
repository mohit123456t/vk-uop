const SI_SYMBOLS = [ { value: 1, symbol: "" }, { value: 1e3, symbol: "K" }, { value: 1e6, symbol: "M" }, { value: 1e9, symbol: "B" }, { value: 1e12, symbol: "T" }];
const INDIAN_CRORE_SYMBOLS = [ { value: 1, symbol: "" }, { value: 1e3, symbol: "K" }, { value: 1e5, symbol: "L" }, { value: 1e7, symbol: "Cr" }];

const formatNumber = (number, system = 'indian') => {
    const symbols = system === 'indian' ? INDIAN_CRORE_SYMBOLS : SI_SYMBOLS;
    if (number === 0) return '0';

    const tier = symbols.slice().reverse().find(s => number >= s.value);

    if (tier) {
        const formattedNumber = (number / tier.value).toFixed(2);
        // Remove trailing .00 and insignificant .d0
        return `${parseFloat(formattedNumber)}${tier.symbol}`;
    }

    return number.toString();
};

export { formatNumber };
