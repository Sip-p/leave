const HeroIllustration = ({ className = "" }) => (
  <div className={`w-full max-w-lg ${className}`}>
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <rect x="40" y="80" width="320" height="200" rx="12" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="2" />
      <rect x="60" y="100" width="80" height="40" rx="6" fill="#0f766e" fillOpacity="0.9" />
      <rect x="60" y="155" width="120" height="40" rx="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
      <rect x="60" y="210" width="100" height="40" rx="6" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
      <circle cx="200" cy="250" r="20" fill="#14b8a6" fillOpacity="0.3" />
      <path d="M195 250 L198 253 L205 246" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="200" y="100" width="140" height="150" rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1" />
      <rect x="215" y="120" width="50" height="8" rx="2" fill="#e2e8f0" />
      <rect x="215" y="140" width="110" height="6" rx="2" fill="#f1f5f9" />
      <rect x="215" y="155" width="90" height="6" rx="2" fill="#f1f5f9" />
      <rect x="215" y="170" width="100" height="6" rx="2" fill="#f1f5f9" />
      <rect x="215" y="195" width="70" height="8" rx="2" fill="#0f766e" fillOpacity="0.2" />
      <rect x="215" y="215" width="70" height="8" rx="2" fill="#dc2626" fillOpacity="0.2" />
      <circle cx="80" cy="35" r="25" fill="#0f766e" fillOpacity="0.15" />
      <path d="M70 35 L76 41 L92 25" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  </div>
);

export default HeroIllustration;
