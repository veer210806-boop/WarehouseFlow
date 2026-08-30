/**
 * SearchAndSortDSA - Object-Oriented DSA Utility Class
 * Provides high-performance in-memory algorithms:
 * - Binary Search on indexed array of items (SKU / ID lookup)
 * - Multi-criteria QuickSort / Comparator pipelines
 * - Dynamic Filter Engine (Categories, Health, Pricing Range, Search Query)
 * - Slicing & Pagination
 */

export class SearchAndSortDSA {
  /**
   * Binary Search Algorithm on a sorted array of objects by a specific key (e.g. SKU)
   * Complexity: O(log N)
   * @param {Array} sortedArray - Array sorted by searchKey in ascending order
   * @param {string} searchKey - Key to compare on (e.g., 'sku')
   * @param {string} targetValue - Target string to locate
   * @returns {Object|null} The matched item or null
   */
  static binarySearch(sortedArray, searchKey, targetValue) {
    if (!Array.isArray(sortedArray) || sortedArray.length === 0) return null;
    const target = String(targetValue).toUpperCase().trim();
    let left = 0;
    let right = sortedArray.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const currentVal = String(sortedArray[mid][searchKey] || '').toUpperCase().trim();

      if (currentVal === target) {
        return sortedArray[mid];
      } else if (currentVal < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return null;
  }

  /**
   * Multi-field Filtering DSA Pipeline
   * Filters an array of products based on query, category, supplier, health status, and price range.
   * @param {Array} items - Array of product objects
   * @param {Object} criteria - Filter criteria
   * @returns {Array} Filtered array
   */
  static filterProducts(items, criteria = {}) {
    const {
      search = '',
      category = '',
      healthStatus = '',
      supplierId = '',
      minPrice = null,
      maxPrice = null,
      minStock = null,
      maxStock = null
    } = criteria;

    const query = search.trim().toLowerCase();

    return items.filter(item => {
      // 1. Text Search matching Name, SKU, HSN Code, Category, or Location
      if (query) {
        const nameMatch = item.name && item.name.toLowerCase().includes(query);
        const skuMatch = item.sku && item.sku.toLowerCase().includes(query);
        const hsnMatch = item.hsnCode && item.hsnCode.toLowerCase().includes(query);
        const catMatch = item.category && item.category.toLowerCase().includes(query);
        const locMatch = item.location && item.location.toLowerCase().includes(query);
        if (!nameMatch && !skuMatch && !hsnMatch && !catMatch && !locMatch) return false;
      }

      // 2. Category Filter
      if (category && category !== 'ALL') {
        if (item.category?.toLowerCase() !== category.toLowerCase()) return false;
      }

      // 3. Supplier Filter
      if (supplierId && supplierId !== 'ALL') {
        const itemSuppId = item.supplier?._id || item.supplier;
        if (String(itemSuppId) !== String(supplierId)) return false;
      }

      // 4. Health Status Filter (HEALTHY, LOW, CRITICAL, OUT_OF_STOCK)
      if (healthStatus && healthStatus !== 'ALL') {
        const stock = Number(item.stock) || 0;
        const safety = Number(item.safetyStock) || 5;
        const minAlert = Number(item.minStockAlert) || 15;

        let computedHealth = 'HEALTHY';
        if (stock === 0) computedHealth = 'OUT_OF_STOCK';
        else if (stock <= safety) computedHealth = 'CRITICAL';
        else if (stock <= minAlert) computedHealth = 'LOW';

        if (computedHealth !== healthStatus.toUpperCase()) return false;
      }

      // 5. Price Range
      if (minPrice !== null && !isNaN(minPrice) && item.sellingPrice < Number(minPrice)) return false;
      if (maxPrice !== null && !isNaN(maxPrice) && item.sellingPrice > Number(maxPrice)) return false;

      // 6. Stock Range
      if (minStock !== null && !isNaN(minStock) && item.stock < Number(minStock)) return false;
      if (maxStock !== null && !isNaN(maxStock) && item.stock > Number(maxStock)) return false;

      return true;
    });
  }

  /**
   * Sort items using custom Comparators
   * @param {Array} items - List of items
   * @param {string} sortBy - Field ('name', 'sku', 'stock', 'costPrice', 'sellingPrice', 'weeklySales', 'createdAt')
   * @param {string} order - 'asc' or 'desc'
   * @returns {Array} Sorted new array
   */
  static sortItems(items, sortBy = 'createdAt', order = 'desc') {
    const list = [...items];
    const isAsc = order.toLowerCase() === 'asc';

    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle null/undefined
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return isAsc ? numA - numB : numB - numA;
      }

      return 0;
    });

    return list;
  }

  /**
   * Paginate sliced collection
   * @param {Array} items - Sourced items
   * @param {number} page - 1-indexed page
   * @param {number} limit - items per page
   * @returns {Object} { data, pagination }
   */
  static paginate(items, page = 1, limit = 20) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 20);
    const total = items.length;
    const totalPages = Math.ceil(total / l) || 1;
    const startIndex = (p - 1) * l;
    const endIndex = startIndex + l;
    const data = items.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages,
        hasNextPage: p < totalPages,
        hasPrevPage: p > 1
      }
    };
  }
}
