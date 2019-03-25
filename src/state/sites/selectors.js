/**
 * Returns a normalized site object by its ID or site slug.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number|String}  siteIdOrSlug Site ID or site slug
 * @return {?Object}        Site object
 */
export function getSite(state, siteIdOrSlug) {
  const rawSite =
    getRawSite(state, siteIdOrSlug) || getSiteBySlug(state, siteIdOrSlug);
  if (!rawSite) {
    return null;
  }

  // Use the rawSite object itself as a WeakMap key
  const cachedSite = getSiteCache.get(rawSite);
  if (cachedSite) {
    return cachedSite;
  }

  const site = {
    ...rawSite,
    ...getSiteComputedAttributes(state, rawSite.ID),
    ...getJetpackComputedAttributes(state, rawSite.ID)
  };

  // Once the `rawSite` object becomes outdated, i.e., state gets updated with a newer version
  // and no more references are held, the key will be automatically removed from the WeakMap.
  getSiteCache.set(rawSite, site);
  return site;
}

getSite.clearCache = () => {
  getSiteCache = new WeakMap();
};