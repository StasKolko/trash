"use client";

import { useEffect, useState } from "react";

export function useObjectUrls(files: File[]) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!files.length) {
      setUrls([]);
      return;
    }

    const nextUrls = files.map((file) => URL.createObjectURL(file));
    setUrls(nextUrls);

    return () => {
      for (const url of nextUrls) URL.revokeObjectURL(url);
    };
  }, [files]);

  return urls;
}
