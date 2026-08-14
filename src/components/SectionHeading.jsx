import React from 'react';

export default function SectionHeading({ title, subtitle, centered = true }) {
  return (
    <div className={`section-heading-container ${centered ? 'text-center' : ''}`}>
      {subtitle && <span className="section-subtitle">{subtitle}</span>}
      <h2 className="section-title">{title}</h2>
      <div className="section-heading-divider"></div>
    </div>
  );
}
