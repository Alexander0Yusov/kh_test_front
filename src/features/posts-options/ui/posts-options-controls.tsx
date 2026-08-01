import type { PostsQueryRules } from "@/entities/post";
import { useState } from "react";

interface PostsOptionsControlsProps {
  onChange: (rules: PostsQueryRules) => void;
  rules: PostsQueryRules;
}

const SORT_OPTIONS = [
  ["Date", "CREATED_AT"],
  ["Email", "EMAIL"],
  ["Username", "USER_NAME"],
] as const;
const FIELD_OPTIONS = [
  ["Avatar", "avatar"],
  ["Email", "email"],
  ["HomePage", "homePage"],
  ["File", "attachment"],
  ["Date", "publishDate"],
] as const;

interface PageSizeControlProps {
  onChange: (value: number) => void;
  value: number;
}

function PageSizeControl({ onChange, value }: PageSizeControlProps) {
  const [draft, setDraft] = useState(String(value));

  const commit = (candidate: string): void => {
    const normalizedCandidate = candidate.trim();
    const numericValue = Number(normalizedCandidate);
    if (normalizedCandidate === "" || !Number.isFinite(numericValue)) {
      setDraft(String(value));
      return;
    }
    const normalized = Math.min(50, Math.max(1, Math.round(numericValue)));
    setDraft(String(normalized));
    if (normalized !== value) onChange(normalized);
  };

  return (
    <>
      <div className="page-size-input">
        <input
          aria-describedby="page-size-description"
          aria-label="Page size"
          inputMode="numeric"
          max={50}
          min={1}
          onBlur={(event) => commit(event.currentTarget.value)}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(event.currentTarget.value);
            }
          }}
          step={1}
          type="number"
          value={draft}
        />
      </div>
      <span className="options-description" id="page-size-description">Root trees per request</span>
    </>
  );
}

export function PostsOptionsControls({ onChange, rules }: PostsOptionsControlsProps) {
  return (
    <div className="posts-options-controls">
      <fieldset><legend>Sort By</legend>{SORT_OPTIONS.map(([label, value]) => (
        <label key={value}><input checked={rules.sortBy === value} name="posts-sort" onChange={() => onChange({ ...rules, sortBy: value })} type="radio" />{label}</label>
      ))}</fieldset>
      <fieldset><legend>Direction</legend>{(["ASC", "DESC"] as const).map((value) => (
        <label key={value}><input checked={rules.sortDirection === value} name="posts-direction" onChange={() => onChange({ ...rules, sortDirection: value })} type="radio" />{value}</label>
      ))}</fieldset>
      <fieldset><legend>Fields</legend>{FIELD_OPTIONS.map(([label, field]) => (
        <label key={field}><input checked={rules.fields[field]} onChange={(event) => onChange({ ...rules, fields: { ...rules.fields, [field]: event.currentTarget.checked } })} type="checkbox" />{label}</label>
      ))}</fieldset>
      <fieldset><legend>Page Size</legend><PageSizeControl key={rules.limit} onChange={(limit) => onChange({ ...rules, limit })} value={rules.limit} /></fieldset>
    </div>
  );
}
