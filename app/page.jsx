import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, FileCheck2, Globe2, GraduationCap, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Verify Certificate', href: '/verify' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'Sign In', href: '/login' }
];

const features = [
  ['Instant trust checks', 'Verify credentials in seconds with a secure public lookup or QR scan.', ShieldCheck],
  ['Institution workflows', 'Issue, review and manage certificates from a single trusted dashboard.', Building2],
  ['Secure by default', 'Signed sessions, role-based access and verified records help protect credential integrity.', LockKeyhole],
  ['Professional PDFs', 'Download polished certificate documents with QR verification and public links.', FileCheck2],
  ['Accessible anywhere', 'Designed for institutions, students and employers across desktop and mobile.', Globe2],
  ['Future-ready records', 'Track issuance, verification and expiry states with clear audit trails.', CheckCircle2]
];

const steps = [
  ['01', 'Issue', 'Authorized institutions create a verified credential record with recipient details and course information.'],
  ['02', 'Generate', 'Credora assigns a unique certificate ID and QR verification link for reliable public checks.'],
  ['03', 'Verify', 'Anyone can scan or search the ID to confirm status, expiry and authenticity in real time.']
];

const faq = [
  ['Who can verify a certificate?', 'Anyone can verify a certificate through the public verification page by ID or QR code.'],
  ['What happens when a certificate expires?', 'The public record shows an expired status once the expiry date has passed.'],
  ['Can a certificate be revoked?', 'Yes. Revoked records remain visible but are marked as revoked and never shown as valid.']
];

export default function Home() {
  return (
    <main className="credora-home">
      <header className="site-header">
        <div className="brand-wrap">
          <div className="brand-mark-shell">
            <ShieldCheck className="brand-mark" strokeWidth={2.4} />
          </div>
          <span>Credora</span>
        </div>

        <nav className="top-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/login" className="btn btn-primary btn-small">Sign In</Link>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} />
            Every achievement deserves to be trusted.
          </div>
          <h1>Your Achievements. Verified Everywhere.</h1>
          <p className="hero-subtitle">
            Credora helps institutions issue trustworthy digital credentials and lets learners, employers and verifiers confirm authenticity in seconds.
          </p>

          <div className="hero-actions">
            <Link href="/verify" className="btn btn-primary">Verify a Certificate</Link>
            <Link href="/login" className="btn btn-outline">Get Started</Link>
          </div>

          <div className="trust-row">
            <div className="trust-item"><ShieldCheck size={18} /><span>Trusted verification</span></div>
            <div className="trust-item"><LockKeyhole size={18} /><span>Secure records</span></div>
            <div className="trust-item"><CheckCircle2 size={18} /><span>Instant status</span></div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Credora certificate dashboard preview">
          <div className="floating-card card-main">
            <div className="mini-header">
              <span className="mini-label">Credential snapshot</span>
              <span className="mini-status verified">QR linked</span>
            </div>

            <div className="mini-body">
              <div>
                <small>Recipient</small>
                <strong>Recipient name</strong>
              </div>
              <div>
                <small>Program</small>
                <strong>Course or program</strong>
              </div>
              <div>
                <small>ID</small>
                <strong>Unique certificate ID</strong>
              </div>
            </div>
          </div>

          <div className="floating-card card-certificate">
            <div className="certificate-badge">Credora</div>
            <h3>Digital credential</h3>
            <p>This is to certify that</p>
            <strong>Recipient name</strong>
            <p>Achievement details appear on the issued credential.</p>
            <div className="certificate-meta">
              <span>Unique certificate ID</span>
              <span>Issue date</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="section-kicker">How it works</p>
          <h2>Built for secure, effortless credential verification.</h2>
        </div>

        <div className="feature-grid">
          {steps.map(([number, title, description]) => (
            <article key={number} className="feature-card">
              <span className="step-pill">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section alt-section">
        <div className="section-heading">
          <p className="section-kicker">Platform highlights</p>
          <h2>Everything needed to issue and verify credentials with confidence.</h2>
        </div>

        <div className="feature-grid">
          {features.map(([title, description, Icon]) => (
            <article key={title} className="feature-card">
              <Icon className="feature-icon" />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section dual-columns">
        <div className="panel-simple security">
          <p className="section-kicker">Security & authenticity</p>
          <h2>Designed to protect trust.</h2>
          <ul>
            <li>Public verification without exposing private account details.</li>
            <li>Clear valid, expired and revoked states for every credential.</li>
            <li>Audit logs for issuance and verification activity.</li>
          </ul>
        </div>

        <div className="panel-simple">
          <p className="section-kicker">For every stakeholder</p>
          <h2>Institutions, students and employers work in one secure workflow.</h2>
          <div className="stakeholder-list">
            <div><Building2 size={18} /><span>Institutions</span></div>
            <div><GraduationCap size={18} /><span>Students</span></div>
            <div><ShieldCheck size={18} /><span>Employers</span></div>
          </div>
        </div>
      </section>

      <section className="section alt-section">
        <div className="section-heading">
          <p className="section-kicker">Frequently asked questions</p>
          <h2>Helpful answers for verification and credential access.</h2>
        </div>

        <div className="faq-list">
          {faq.map(([question, answer]) => (
            <div key={question} className="faq-item">
              <h3>{question}</h3>
              <p>{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="section-kicker alt">Trusted credentials</p>
          <h2>Make every achievement easy to verify.</h2>
        </div>
        <Link href="/verify" className="btn btn-primary">Verify a Certificate <ArrowRight size={18} /></Link>
      </section>

      <footer className="site-footer">
        <div className="brand-wrap footer-brand">
          <div className="brand-mark-shell">
            <ShieldCheck className="brand-mark" strokeWidth={2.4} />
          </div>
          <span>Credora</span>
        </div>
        <p>Secure digital credential issuance, management and verification.</p>
        <div className="footer-links">
          <Link href="/verify">Verify Certificate</Link>
          <Link href="/about">About</Link>
          <Link href="/login">Sign In</Link>
        </div>
      </footer>
    </main>
  );
}
