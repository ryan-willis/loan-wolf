import React from "react";

export interface HeaderTags {
  scripts: {
    key: string;
    src: string;
  }[];
}

export function HeaderScripts({ data }: { data: HeaderTags }) {
  return data.scripts.map((p) => React.createElement("script", { ...p }));
}
