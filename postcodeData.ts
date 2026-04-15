/**
 * UK Postcode Data Structure (Bristol Area Focus)
 * Maps outward codes (e.g., "BS1") to their district codes (e.g., ["BS1 1", "BS1 2", ...])
 */

export interface PostcodeGroup {
    parent: string;
    children: string[];
}

export const BRISTOL_POSTCODES: Record<string, string[]> = {
    'BS1': ['BS1 1', 'BS1 2', 'BS1 3', 'BS1 4', 'BS1 5', 'BS1 6'],
    'BS2': ['BS2 0', 'BS2 8', 'BS2 9'],
    'BS3': ['BS3 1', 'BS3 2', 'BS3 3', 'BS3 4', 'BS3 5'],
    'BS4': ['BS4 1', 'BS4 2', 'BS4 3', 'BS4 4', 'BS4 5'],
    'BS5': ['BS5 0', 'BS5 6', 'BS5 7', 'BS5 8', 'BS5 9'],
    'BS6': ['BS6 5', 'BS6 6', 'BS6 7'],
    'BS7': ['BS7 0', 'BS7 8', 'BS7 9'],
    'BS8': ['BS8 1', 'BS8 2', 'BS8 3', 'BS8 4'],
    'BS9': ['BS9 1', 'BS9 2', 'BS9 3', 'BS9 4'],
    'BS10': ['BS10 5', 'BS10 6', 'BS10 7'],
    'BS11': ['BS11 0', 'BS11 8', 'BS11 9'],
    'BS13': ['BS13 0', 'BS13 7', 'BS13 8', 'BS13 9'],
    'BS14': ['BS14 0', 'BS14 8', 'BS14 9'],
    'BS15': ['BS15 1', 'BS15 2', 'BS15 3', 'BS15 4', 'BS15 8', 'BS15 9'],
    'BS16': ['BS16 1', 'BS16 2', 'BS16 3', 'BS16 4', 'BS16 5', 'BS16 6', 'BS16 7', 'BS16 9'],
    'BS20': ['BS20 0', 'BS20 6', 'BS20 7', 'BS20 8'],
    'BS21': ['BS21 5', 'BS21 6', 'BS21 7'],
    'BS22': ['BS22 6', 'BS22 7', 'BS22 8', 'BS22 9'],
    'BS23': ['BS23 1', 'BS23 2', 'BS23 3', 'BS23 4'],
    'BS24': ['BS24 0', 'BS24 6', 'BS24 7', 'BS24 8', 'BS24 9'],
    'BS25': ['BS25 1', 'BS25 5'],
    'BS30': ['BS30 5', 'BS30 6', 'BS30 7', 'BS30 8', 'BS30 9'],
    'BS31': ['BS31 1', 'BS31 2', 'BS31 3'],
    'BS32': ['BS32 0', 'BS32 4', 'BS32 8', 'BS32 9'],
    'BS34': ['BS34 5', 'BS34 6', 'BS34 7', 'BS34 8'],
    'BS35': ['BS35 1', 'BS35 2', 'BS35 3', 'BS35 4', 'BS35 5'],
    'BS36': ['BS36 1', 'BS36 2'],
    'BS37': ['BS37 4', 'BS37 5', 'BS37 6', 'BS37 7', 'BS37 8', 'BS37 9'],
    'BS39': ['BS39 4', 'BS39 5', 'BS39 6', 'BS39 7'],
    'BS40': ['BS40 5', 'BS40 6', 'BS40 7', 'BS40 8', 'BS40 9'],
    'BS41': ['BS41 8', 'BS41 9'],
    'BS48': ['BS48 1', 'BS48 2', 'BS48 3', 'BS48 4'],
    'BS49': ['BS49 4', 'BS49 5'],
};

/**
 * Search postcodes by prefix
 */
export function searchPostcodes(query: string): string[] {
    const upperQuery = query.toUpperCase().trim();
    if (!upperQuery) return [];

    return Object.keys(BRISTOL_POSTCODES).filter(code =>
        code.startsWith(upperQuery)
    );
}

/**
 * Get children for a parent postcode
 */
export function getPostcodeChildren(parent: string): string[] {
    return BRISTOL_POSTCODES[parent.toUpperCase()] || [];
}

/**
 * Check if a string is a valid parent postcode
 */
export function isValidParentPostcode(code: string): boolean {
    return code.toUpperCase() in BRISTOL_POSTCODES;
}
