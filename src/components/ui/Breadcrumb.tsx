import Link from "next/link";

export function Breadcrumb({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2.5">
        {trail.map((t, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={t.path} className="flex items-center gap-2.5">
              {last ? (
                <span className="label text-mist" aria-current="page">
                  {t.name}
                </span>
              ) : (
                <Link href={t.path} className="link-draw label text-smoke">
                  {t.name}
                </Link>
              )}
              {!last && (
                <span aria-hidden className="h-px w-3 bg-hairline" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
