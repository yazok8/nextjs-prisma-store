 // Helper function to ensure the URL has a scheme
 export const ensureScheme = (url: string, defaultScheme: string = "https://") => {
    if (!/^https?:\/\//i.test(url)) {
      return `${defaultScheme}${url}`;
    }
    return url;
  };