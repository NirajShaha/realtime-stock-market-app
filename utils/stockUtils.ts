export const cleanStockSymbol = (symbol: string): string => {
    if (!symbol) return '';
    return symbol.replace('.NS', '').trim().toUpperCase();
};
