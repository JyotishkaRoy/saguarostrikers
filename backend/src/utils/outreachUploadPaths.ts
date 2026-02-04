/**
 * Shared folder name for outreach-related uploads.
 * All outreach files go under: uploads/<bucket>/<outreachname>-<outreachId>/
 * - uploads/outreaches/outreachname-outreachId/ (hero image)
 * - uploads/outreach-galleries/outreachname-outreachId/
 * - uploads/outreach-artifacts/outreachname-outreachId/
 */
export function getOutreachFolderName(title: string, outreachId: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
  return `${slug}-${outreachId}`;
}
