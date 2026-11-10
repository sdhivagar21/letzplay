import React from 'react';
import { Link } from 'react-router-dom';

// items: [{ label, to }] — the last one is the current page.
export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={it.label + i}>
            {last || !it.to ? <span aria-current={last ? 'page' : undefined}>{it.label}</span> : <Link to={it.to}>{it.label}</Link>}
            {!last && <span className="crumbs__sep" aria-hidden="true">/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
