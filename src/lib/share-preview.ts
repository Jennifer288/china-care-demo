export const isSharePreview = process.env.NEXT_PUBLIC_SHARE_PREVIEW === "true";
export function publicPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//")
    ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`
    : path;
}
