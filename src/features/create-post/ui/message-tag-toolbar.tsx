interface MessageTagTemplate {
  accessibleLabel: string;
  closingTag: string;
  label: string;
  openingTag: string;
}

const MESSAGE_TAG_TEMPLATES: MessageTagTemplate[] = [
  { accessibleLabel: "Insert link tags", closingTag: "</a>", label: "<a></a>", openingTag: '<a href="" title="">' },
  { accessibleLabel: "Insert strong tags", closingTag: "</strong>", label: "<strong></strong>", openingTag: "<strong>" },
  { accessibleLabel: "Insert italic tags", closingTag: "</i>", label: "<i></i>", openingTag: "<i>" },
  { accessibleLabel: "Insert code tags", closingTag: "</code>", label: "<code></code>", openingTag: "<code>" },
];

interface MessageTagToolbarProps {
  disabled: boolean;
  onInsert: (openingTag: string, closingTag: string) => void;
}

export function MessageTagToolbar({ disabled, onInsert }: MessageTagToolbarProps) {
  return (
    <div aria-label="Allowed message tags" className="message-tag-toolbar" role="toolbar">
      {MESSAGE_TAG_TEMPLATES.map((template) => (
        <button
          aria-label={template.accessibleLabel}
          className="message-tag-button"
          disabled={disabled}
          key={template.openingTag}
          onClick={() => onInsert(template.openingTag, template.closingTag)}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          {template.label}
        </button>
      ))}
    </div>
  );
}
