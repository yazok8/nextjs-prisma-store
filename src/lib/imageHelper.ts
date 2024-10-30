// src/lib/imageHelper.ts

export const getImageSrc = (path: string | undefined | null): string => {
  if (!path) {
    return '/default-avatar.png';
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  } else if (path.startsWith("/")) {
    return path;
  } else {
    const sanitizedPath = path.startsWith('/') ? path.slice(1) : path;
    return `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/${sanitizedPath}`;
  }
};
