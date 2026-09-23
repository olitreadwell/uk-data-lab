export type ReferenceKind = 'news' | 'history' | 'culture' | 'data' | 'licence';

export interface MicrositeReference {
  label: string;
  url: string;
  kind: ReferenceKind;
}

const KIND_LABELS: Record<ReferenceKind, string> = {
  news: 'News',
  history: 'History',
  culture: 'Culture',
  data: 'Data',
  licence: 'Licence',
};

interface MicrositeReferencesProps {
  references: MicrositeReference[];
}

/** Sources and further reading for one microsite story. */
export function MicrositeReferences({ references }: MicrositeReferencesProps): React.ReactElement {
  return (
    <div className="max-w-3xl pb-[var(--spacing-2xl)]">
      <h2 className="numeral-text-eyebrow text-[var(--color-muted)]">
        Sources and further reading
      </h2>
      <ul className="mt-3 space-y-2">
        {references.map((reference) => (
          <li key={reference.url} className="flex items-baseline gap-2">
            <span className="numeral-text-eyebrow text-[10px] text-[var(--color-muted)]">
              {KIND_LABELS[reference.kind]}
            </span>
            <a className="underline" href={reference.url}>
              {reference.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
