interface Listing {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  location: string;
  created_at: string;
  user_name: string;
  [key: string]: any;
}

interface SearchResult extends Listing {
  relevanceScore: number;
  matchReasons: string[];
}

// Common synonyms and related terms for better matching
const categoryKeywords: { [key: string]: string[] } = {
  'electronics': ['phone', 'laptop', 'computer', 'tablet', 'tech', 'electronic', 'device', 'iphone', 'android', 'mac', 'pc', 'gaming', 'headphones', 'speaker', 'charger', 'cable'],
  'textbooks': ['book', 'textbook', 'study', 'education', 'manual', 'guide', 'novel', 'literature', 'math', 'science', 'history', 'english', 'chemistry', 'biology', 'physics'],
  'furniture': ['chair', 'desk', 'table', 'bed', 'sofa', 'couch', 'dresser', 'shelf', 'bookshelf', 'lamp', 'mirror', 'furniture', 'decor', 'decoration'],
  'clothing': ['shirt', 'pants', 'shoes', 'dress', 'jacket', 'sweater', 'jeans', 'sneakers', 'boots', 'hat', 'clothing', 'apparel', 'outfit', 'fashion', 'wear'],
  'housing': ['room', 'apartment', 'house', 'rent', 'lease', 'sublet', 'roommate', 'housing', 'dorm', 'studio', 'bedroom', 'bathroom', 'kitchen'],
  'services': ['tutor', 'tutoring', 'help', 'service', 'repair', 'cleaning', 'moving', 'design', 'photography', 'writing', 'editing', 'consulting'],
};

// Brand names and common product terms
const brandKeywords = [
  'apple', 'samsung', 'nike', 'adidas', 'sony', 'microsoft', 'google', 'amazon', 'hp', 'dell', 'lenovo', 'asus',
  'canon', 'nikon', 'lg', 'panasonic', 'bose', 'beats', 'airpods', 'macbook', 'ipad', 'xbox', 'playstation'
];

// Function to normalize text for better matching
function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

// Function to calculate string similarity using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  // Convert distance to similarity percentage
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : 1 - (matrix[len1][len2] / maxLen);
}

// Function to get category keywords for a given category
function getCategoryKeywords(category: string): string[] {
  const normalizedCategory = normalizeText(category);
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (normalizedCategory.includes(cat) || cat.includes(normalizedCategory)) {
      return keywords;
    }
  }
  return [];
}

// Main search and ranking function
export function searchAndRankListings(listings: Listing[], searchQuery: string): SearchResult[] {
  if (!searchQuery.trim()) return listings.map(listing => ({ ...listing, relevanceScore: 0, matchReasons: [] }));

  const normalizedQuery = normalizeText(searchQuery);
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);

  const searchResults: SearchResult[] = listings.map(listing => {
    const normalizedTitle = normalizeText(listing.title);
    const normalizedDescription = normalizeText(listing.description);
    const normalizedCategory = normalizeText(listing.category);
    const normalizedLocation = normalizeText(listing.location);
    
    let score = 0;
    const matchReasons: string[] = [];

    // 1. Exact phrase match in title (highest priority)
    if (normalizedTitle.includes(normalizedQuery)) {
      score += 100;
      matchReasons.push('Exact match in title');
    }

    // 2. Exact phrase match in description
    if (normalizedDescription.includes(normalizedQuery)) {
      score += 80;
      matchReasons.push('Exact match in description');
    }

    // 3. Individual word matches in title
    queryWords.forEach(word => {
      if (normalizedTitle.includes(word)) {
        score += 50;
        matchReasons.push(`"${word}" found in title`);
      }
    });

    // 4. Individual word matches in description
    queryWords.forEach(word => {
      if (normalizedDescription.includes(word)) {
        score += 30;
        matchReasons.push(`"${word}" found in description`);
      }
    });

    // 5. Category matching
    if (normalizedCategory.includes(normalizedQuery)) {
      score += 60;
      matchReasons.push('Category match');
    }

    // 6. Category keyword matching
    const categoryKeywords = getCategoryKeywords(listing.category);
    queryWords.forEach(word => {
      categoryKeywords.forEach(keyword => {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 40;
          matchReasons.push(`Related to ${listing.category.toLowerCase()}`);
        }
      });
    });

    // 7. Brand name matching
    queryWords.forEach(word => {
      brandKeywords.forEach(brand => {
        if (brand.includes(word) || word.includes(brand)) {
          if (normalizedTitle.includes(brand) || normalizedDescription.includes(brand)) {
            score += 35;
            matchReasons.push(`Brand match: ${brand}`);
          }
        }
      });
    });

    // 8. Fuzzy matching for typos (using similarity threshold)
    queryWords.forEach(queryWord => {
      const titleWords = normalizedTitle.split(' ');
      const descriptionWords = normalizedDescription.split(' ');
      
      [...titleWords, ...descriptionWords].forEach(word => {
        if (word.length > 3) { // Only check longer words
          const similarity = calculateSimilarity(queryWord, word);
          if (similarity > 0.7 && similarity < 1) { // Similar but not exact
            score += Math.floor(similarity * 25);
            matchReasons.push(`Similar to "${word}"`);
          }
        }
      });
    });

    // 9. Location matching (lower priority)
    if (normalizedLocation.includes(normalizedQuery)) {
      score += 15;
      matchReasons.push('Location match');
    }

    // 10. Recency bonus (newer listings get slight boost)
    const daysOld = (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 7) score += 5;
    if (daysOld < 1) score += 5;

    // Remove duplicate match reasons
    const uniqueMatchReasons = [...new Set(matchReasons)];

    return {
      ...listing,
      relevanceScore: score,
      matchReasons: uniqueMatchReasons
    };
  });

  // Filter out listings with no relevance and sort by score
  return searchResults
    .filter(result => result.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Function to get search suggestions based on partial input
export function getSearchSuggestions(query: string, listings: Listing[]): string[] {
  if (!query.trim() || query.length < 2) return [];

  const normalizedQuery = normalizeText(query);
  const suggestions = new Set<string>();

  listings.forEach(listing => {
    const titleWords = normalizeText(listing.title).split(' ');
    const categoryWords = normalizeText(listing.category).split(' ');

    [...titleWords, ...categoryWords].forEach(word => {
      if (word.length > 2 && word.includes(normalizedQuery)) {
        suggestions.add(word);
      }
    });

    // Add category keywords if they match
    const categoryKeywords = getCategoryKeywords(listing.category);
    categoryKeywords.forEach(keyword => {
      if (keyword.includes(normalizedQuery)) {
        suggestions.add(keyword);
      }
    });
  });

  return Array.from(suggestions).slice(0, 5); // Return top 5 suggestions
}

// Function to get fallback suggestions when search results are limited
export function getFallbackSuggestions(searchQuery: string, searchResults: SearchResult[], allListings: Listing[], maxSuggestions: number = 6): Listing[] {
  // Always show fallback suggestions when there's a search query

  const normalizedQuery = normalizeText(searchQuery);
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
  
  // Get IDs of listings already in search results to avoid duplicates
  const existingIds = new Set(searchResults.map(result => result.id));
  
  // Find listings that might be related but didn't make the main search
  const fallbackCandidates: (Listing & { fallbackScore: number; reason: string })[] = [];

  allListings.forEach(listing => {
    if (existingIds.has(listing.id)) return; // Skip already included listings

    const normalizedTitle = normalizeText(listing.title);
    const normalizedDescription = normalizeText(listing.description);
    const normalizedCategory = normalizeText(listing.category);
    
    let fallbackScore = 0;
    let reason = '';

    // 1. Same category as search terms
    queryWords.forEach(word => {
      const categoryKeywords = getCategoryKeywords(listing.category);
      if (categoryKeywords.some(keyword => keyword.includes(word) || word.includes(keyword))) {
        fallbackScore += 30;
        reason = `Popular in ${listing.category.toLowerCase()}`;
      }
    });

    // 2. Partial word matches that didn't score high enough
    queryWords.forEach(word => {
      if (word.length > 3) {
        const titleWords = normalizedTitle.split(' ');
        const descWords = normalizedDescription.split(' ');
        
        [...titleWords, ...descWords].forEach(listingWord => {
          if (listingWord.length > 3 && (listingWord.includes(word) || word.includes(listingWord))) {
            fallbackScore += 15;
            if (!reason) reason = 'Similar items';
          }
        });
      }
    });

    // 3. Brand/popular item bonus
    brandKeywords.forEach(brand => {
      if (normalizedTitle.includes(brand) || normalizedDescription.includes(brand)) {
        fallbackScore += 20;
        if (!reason) reason = 'Popular items you might like';
      }
    });

    // 4. Recent listings bonus
    const daysOld = (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld < 3) {
      fallbackScore += 10;
      if (!reason) reason = 'Recently posted';
    }

    // 5. Price range consideration (if search had price-related terms)
    const hasPriceTerms = queryWords.some(word => 
      ['cheap', 'expensive', 'budget', 'affordable', 'free', 'deal'].includes(word)
    );
    if (hasPriceTerms) {
      if (listing.price < 50) {
        fallbackScore += 15;
        reason = 'Budget-friendly options';
      }
    }

    // Include listings with any relevance (lowered threshold)
    if (fallbackScore > 5) {
      fallbackCandidates.push({
        ...listing,
        fallbackScore,
        reason: reason || 'You might also like'
      });
    }
  });

  // Sort by fallback score and return top suggestions
  let sortedCandidates = fallbackCandidates
    .sort((a, b) => b.fallbackScore - a.fallbackScore)
    .slice(0, maxSuggestions);

  // If we don't have enough suggestions, add popular recent items as a last resort
  if (sortedCandidates.length < maxSuggestions) {
    const needed = maxSuggestions - sortedCandidates.length;
    const existingIds = new Set([...searchResults.map(r => r.id), ...sortedCandidates.map(c => c.id)]);
    
    const recentPopularItems = allListings
      .filter(listing => !existingIds.has(listing.id))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, needed)
      .map(listing => ({
        ...listing,
        fallbackScore: 5,
        reason: 'Recently posted'
      }));
    
    sortedCandidates = [...sortedCandidates, ...recentPopularItems];
  }

  return sortedCandidates;
}

// Helper function to determine the best fallback section title
export function getFallbackSectionTitle(searchQuery: string, fallbackListings: (Listing & { reason?: string })[]): string {
  if (fallbackListings.length === 0) return '';

  // Get the most common reason
  const reasons = fallbackListings.map(item => item.reason || 'Related items').filter(Boolean);
  const reasonCounts = reasons.reduce((acc, reason) => {
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonReason = Object.entries(reasonCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  // Return appropriate title based on the most common reason
  switch (mostCommonReason) {
    case 'Popular items you might like':
      return 'Popular items you might like';
    case 'Recently posted':
      return 'Recently posted items';
    case 'Budget-friendly options':
      return 'Budget-friendly alternatives';
    default:
      if (mostCommonReason && mostCommonReason.includes('Popular in')) {
        return mostCommonReason;
      }
      return 'You might also like';
  }
}