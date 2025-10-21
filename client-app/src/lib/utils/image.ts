/**
 * Converts a relative image URL to an absolute URL using the API base URL
 */
export function getImageUrl(src: string | undefined): string {
  if (!src) {
    return `/attached_assets/generated_images/Traditional_thekua_sweet_snacks_abfa8650.png`;
  }
  
  if (src.startsWith('http')) {
    return src;
  }
  
  return src;
}