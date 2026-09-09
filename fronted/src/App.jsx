import React, { useState } from "react";

// ---- mock data -------------------------------------------------

const EXAMPLES = [
  {
    title: "Senior ML Engineer",
    location: "Algiers, Algeria",
    company: "TechCorp",
    industry: "Software Development",
    experience: "Mid-Senior level",
    employment: "Full-time",
    skills: "Python, scikit-learn, SQL",
    description:
      "We are looking for a Senior ML Engineer to join our growing data team. You will design, train, and deploy machine learning models that power our core product recommendations. Strong background in Python and production ML systems required.",
    postedDuration: "1-2 weeks",
    reposted: true,
  },
  {
    title: "Data Scientist",
    location: "Berlin, Germany",
    company: "Northwind Analytics",
    industry: "Financial Services",
    experience: "Associate",
    employment: "Full-time",
    skills: "Python, pandas, SQL, Tableau",
    description:
      "Join our risk analytics team to build models that support credit decisioning. You'll work closely with engineering and compliance to ship interpretable, well-tested models.",
    postedDuration: "A few days",
    reposted: false,
  },
  {
    title: "AI Engineer",
    location: "Remote",
    company: "Fieldstone Labs",
    industry: "Technology",
    experience: "Entry level",
    employment: "Contract",
    skills: "PyTorch, transformers, Docker",
    description:
      "Fieldstone Labs is hiring an AI Engineer to help fine-tune and evaluate language models for our internal tooling. Comfortable working independently in a remote-first team.",
    postedDuration: "Over a month",
    reposted: true,
  },
];

const OTHER_MODEL_SCORES = [
  { model: "Logistic Regression", value: "64%" },
  { model: "Gradient Boosting", value: "69%" },
];

const SIGNALS = [
  { signal: "Days posted (estimated)", value: "1-2 weeks", effect: "\u2191 Risk" },
  { signal: "Reposted", value: "Yes", effect: "\u2191 Risk" },
  { signal: "Company posting volume", value: "Normal", effect: "\u2014" },
];

const SALARY_MODEL_ROWS = [
  { method: "Baseline (median)", mae: "$18,400", rmse: "$24,100", r2: "0.00", time: "\u2014", production: false },
  { method: "Normal equation", mae: "$9,850", rmse: "$13,220", r2: "0.71", time: "0.4s", production: false },
  { method: "Gradient descent", mae: "$9,910", rmse: "$13,340", r2: "0.71", time: "2.1s", production: true },
];

const GHOST_MODEL_ROWS = [
  { model: "Baseline", precision: "0.31", recall: "0.31", f1: "0.31", auc: "0.50", production: false },
  { model: "Logistic Regression", precision: "0.58", recall: "0.52", f1: "0.55", auc: "0.74", production: false },
  { model: "Random Forest", precision: "0.66", recall: "0.61", f1: "0.63", auc: "0.81", production: true },
  { model: "Gradient Boosting", precision: "0.64", recall: "0.59", f1: "0.61", auc: "0.80", production: false },
];

const EMPTY_FORM = {
  title: "",
  location: "",
  company: "",
  industry: "Software Development",
  experience: "Entry level",
  employment: "Full-time",
  skills: "",
  description: "",
  postedDuration: "Just posted",
  reposted: false,
};

// ---- shared bits ------------------------------------------------

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm text-sand-600 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputClasses =
  "w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-sand-300 focus:border-sand-300 transition-colors";

function riskBadge(level) {
  const map = {
    low: { label: "Low risk", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    medium: { label: "Medium risk", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    high: { label: "High risk", cls: "bg-red-50 text-red-700 border-red-200" },
  };
  const m = map[level];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-sand-100 bg-white shadow-card ${className}`}>{children}</div>
  );
}

// ---- main tool screen --------------------------------------------

function ToolScreen({ onNavigateMethodology }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [showOtherModels, setShowOtherModels] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analyzedSummary, setAnalyzedSummary] = useState(null);

  const update = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const charCount = form.description.length;
  const charLimit = 2000;
  const overWarning = charCount > 1800;

  const handleLoadExample = () => {
    const example = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
    setForm({ ...EMPTY_FORM, ...example });
    setValidationError(false);
  };

  const handleAnalyze = () => {
    if (!form.title.trim() || !form.location.trim()) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    setLoading(true);
    setShowResults(false);
    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
      setAnalyzedSummary(
        `${form.title || "Senior ML Engineer"} at ${form.company || "TechCorp"} \u00b7 ${
          form.location || "Algiers, Algeria"
        }`
      );
    }, 700);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setShowResults(false);
    setValidationError(false);
    setShowOtherModels(false);
    setAnalyzedSummary(null);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto w-full max-w-[680px] px-5 py-14">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-serif text-3xl text-sand-900">Job posting intelligence</h1>
        <div className="h-px w-12 bg-sand-200 mt-3 mb-3" />
        <p className="text-xs text-sand-400">For LinkedIn job postings</p>
        <p className="text-base text-sand-700 mt-4">
          Predicted salary and ghost-job risk for LinkedIn job postings.
        </p>
        <p className="text-xs text-sand-400 mt-1.5">
          Copy fields directly from a LinkedIn posting for the most accurate result.
        </p>
      </header>

      {/* Form */}
      <Card className="p-5 sm:p-8">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Job title">
              <input
                className={inputClasses}
                type="text"
                maxLength={200}
                value={form.title}
                onChange={update("title")}
                placeholder="Senior ML Engineer"
              />
            </Field>
            <Field label="Location">
              <input
                className={inputClasses}
                type="text"
                maxLength={200}
                value={form.location}
                onChange={update("location")}
                placeholder="Algiers, Algeria"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company (optional)">
              <input
                className={inputClasses}
                type="text"
                value={form.company}
                onChange={update("company")}
                placeholder="TechCorp"
              />
            </Field>
            <Field label="Industry">
              <select className={inputClasses} value={form.industry} onChange={update("industry")}>
                <option>Software Development</option>
                <option>Technology</option>
                <option>Financial Services</option>
                <option>Healthcare</option>
                <option>Other</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Experience level">
              <select className={inputClasses} value={form.experience} onChange={update("experience")}>
                <option>Entry level</option>
                <option>Associate</option>
                <option>Mid-Senior level</option>
                <option>Director</option>
              </select>
            </Field>
            <Field label="Employment type">
              <select className={inputClasses} value={form.employment} onChange={update("employment")}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </select>
            </Field>
          </div>

          <Field label="Skills">
            <input
              className={inputClasses}
              type="text"
              value={form.skills}
              onChange={update("skills")}
              placeholder="Python, scikit-learn, SQL"
            />
          </Field>

          <Field label="Job description">
            <textarea
              className={`${inputClasses} resize-none`}
              rows={4}
              maxLength={charLimit}
              value={form.description}
              onChange={update("description")}
              placeholder="Paste the job description text directly from the LinkedIn posting for best accuracy"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${overWarning ? "text-amber-600" : "text-sand-400"}`}>
                {charCount}/{charLimit}
              </span>
            </div>
          </Field>

          {/* Ghost-risk inputs */}
          <div className="pt-5 border-t border-sand-100">
            <p className="text-xs font-medium text-sand-500 mb-3">Ghost-risk inputs (your best estimate)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Roughly how long has this been posted?">
                <select className={inputClasses} value={form.postedDuration} onChange={update("postedDuration")}>
                  <option>Just posted</option>
                  <option>A few days</option>
                  <option>1-2 weeks</option>
                  <option>Over a month</option>
                </select>
              </Field>
              <Field label="Has it been reposted or relisted?">
                <div className="flex items-center gap-3 h-[38px]">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.reposted}
                    onClick={() => setForm((f) => ({ ...f, reposted: !f.reposted }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sand-300 focus:ring-offset-1 ${
                      form.reposted ? "bg-sand-800" : "bg-sand-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        form.reposted ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-sm text-sand-600">{form.reposted ? "Yes" : "No"}</span>
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-lg bg-sand-900 px-4 py-2 text-sm font-medium text-white hover:bg-sand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-sand-400 focus:ring-offset-1"
          >
            {loading ? "Analyzing..." : "Analyze posting"}
          </button>
          <button
            type="button"
            onClick={handleLoadExample}
            className="rounded-lg border border-sand-300 px-4 py-2 text-sm font-medium text-sand-700 hover:bg-sand-50 transition-colors focus:outline-none focus:ring-2 focus:ring-sand-300 focus:ring-offset-1"
          >
            Load example
          </button>
        </div>
        {validationError && <p className="text-sm text-red-600 mt-3">Title and location are required.</p>}
      </Card>

      {/* Results */}
      {showResults && (
        <div className="mt-8">
          {analyzedSummary && <p className="text-xs text-sand-400 mb-3">Analyzed: {analyzedSummary}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <p className="text-sm text-sand-500">Predicted salary</p>
              <p className="mt-2 text-3xl font-mono text-sand-900">$78,500</p>
              <p className="text-xs text-sand-400 mt-2">Model estimate</p>
              <p className="text-xs text-sand-400 mt-3 pt-3 border-t border-sand-100">
                Predicted using: Gradient descent
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-sm text-sand-500">Ghost job risk</p>
              <div className="mt-2 flex items-baseline gap-2.5">
                <p className="text-3xl font-mono text-sand-900">72%</p>
                {riskBadge("high")}
              </div>
              <p className="text-xs text-sand-400 mt-2">Based on signals detected in this posting.</p>
              <p className="text-xs text-sand-400 mt-3 pt-3 border-t border-sand-100">
                Predicted using: Random forest
              </p>
            </Card>
          </div>

          {/* Other model scores */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowOtherModels((s) => !s)}
              className="text-sm text-sand-500 hover:text-sand-700 transition-colors focus:outline-none"
            >
              See how other models scored this posting {showOtherModels ? "\u25b4" : "\u25be"}
            </button>
            {showOtherModels && (
              <div className="mt-3 rounded-lg border border-sand-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-sand-50 text-sand-500 text-left">
                      <th className="px-3 py-2 font-normal">Model</th>
                      <th className="px-3 py-2 font-normal">Ghost risk score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {OTHER_MODEL_SCORES.map((row) => (
                      <tr key={row.model} className="border-t border-sand-100">
                        <td className="px-3 py-2 text-sand-700">{row.model}</td>
                        <td className="px-3 py-2 text-sand-700 font-mono">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Why this prediction */}
          <Card className="mt-6 p-5">
            <p className="text-sm font-medium text-sand-800 mb-3">Why this prediction?</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-sand-500 text-left">
                  <th className="py-1.5 font-normal">Signal</th>
                  <th className="py-1.5 font-normal">Value</th>
                  <th className="py-1.5 font-normal">Effect</th>
                </tr>
              </thead>
              <tbody>
                {SIGNALS.map((row) => (
                  <tr key={row.signal} className="border-t border-sand-100">
                    <td className="py-2 text-sand-700">{row.signal}</td>
                    <td className="py-2 text-sand-700">{row.value}</td>
                    <td className="py-2 text-sand-700">{row.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Metadata + copy */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-sand-400">Models: Salary regression \u00b7 Ghost job classification</p>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-sand-600 hover:text-sand-800 border border-sand-200 rounded-lg px-2.5 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-sand-300"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-sand-500 hover:text-sand-700 underline underline-offset-2 transition-colors focus:outline-none"
            >
              Analyze another posting
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center">
        <button
          type="button"
          onClick={onNavigateMethodology}
          className="text-sm text-sand-500 hover:text-sand-700 underline underline-offset-2 transition-colors focus:outline-none"
        >
          How this prediction works
        </button>
        <p className="text-xs text-sand-400 mt-3">
          Portfolio project \u2014 not a production hiring tool. Trained and evaluated on LinkedIn postings only.
        </p>
      </footer>
    </div>
  );
}

// ---- methodology screen -------------------------------------------

function ProductionBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-sand-200 bg-sand-100 px-2 py-0.5 text-[11px] font-medium text-sand-800 ml-2">
      In production
    </span>
  );
}

function MethodologyScreen({ onBack }) {
  return (
    <div className="mx-auto w-full max-w-[680px] px-5 py-14">
      <h1 className="font-serif text-3xl text-sand-900">How this prediction works</h1>
      <div className="h-px w-12 bg-sand-200 mt-3 mb-8" />

      <div className="space-y-3 text-sm text-sand-600 leading-relaxed">
        <p>
          The salary model takes the fields from the form \u2014 title, location, experience level, employment
          type, industry, and skills \u2014 and predicts an expected annual salary for that posting, based on
          patterns learned from historical LinkedIn postings.
        </p>
        <p>
          The ghost-job model takes the same fields, plus the posting-age and repost estimates you provide, and
          scores the likelihood that a posting is being kept open with no real intent to fill it.
        </p>
        <p className="text-sand-500">Predictions are estimates, not guarantees.</p>
      </div>

      {/* Salary model */}
      <section className="mt-10">
        <h2 className="font-serif text-xl text-sand-800">Salary model</h2>
        <p className="text-sm text-sand-600 mt-2 leading-relaxed">
          The normal equation and gradient descent rows below are the same linear model, trained two different
          ways \u2014 the comparison is about how each scales, not which one is more accurate.
        </p>
        <div className="mt-4 rounded-lg border border-sand-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sand-50 text-sand-500 text-left">
                <th className="px-3 py-2 font-normal">Method</th>
                <th className="px-3 py-2 font-normal">MAE</th>
                <th className="px-3 py-2 font-normal">RMSE</th>
                <th className="px-3 py-2 font-normal">R\u00b2</th>
                <th className="px-3 py-2 font-normal">Train time</th>
              </tr>
            </thead>
            <tbody>
              {SALARY_MODEL_ROWS.map((row) => (
                <tr key={row.method} className="border-t border-sand-100">
                  <td className="px-3 py-2 text-sand-700 whitespace-nowrap">
                    {row.method}
                    {row.production && <ProductionBadge />}
                  </td>
                  <td className="px-3 py-2 text-sand-700">{row.mae}</td>
                  <td className="px-3 py-2 text-sand-700">{row.rmse}</td>
                  <td className="px-3 py-2 text-sand-700">{row.r2}</td>
                  <td className="px-3 py-2 text-sand-700">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-sand-400 mt-3">
          Gradient descent was chosen for how it scales with feature count, not because it scored higher.
        </p>
      </section>

      {/* Ghost classifier */}
      <section className="mt-10">
        <h2 className="font-serif text-xl text-sand-800">Ghost job classifier</h2>
        <p className="text-sm text-sand-600 mt-2 leading-relaxed">
          Unlike the salary comparison above, these are genuinely different models.
        </p>
        <div className="mt-4 rounded-lg border border-sand-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sand-50 text-sand-500 text-left">
                <th className="px-3 py-2 font-normal">Model</th>
                <th className="px-3 py-2 font-normal">Precision</th>
                <th className="px-3 py-2 font-normal">Recall</th>
                <th className="px-3 py-2 font-normal">F1</th>
                <th className="px-3 py-2 font-normal">ROC-AUC</th>
              </tr>
            </thead>
            <tbody>
              {GHOST_MODEL_ROWS.map((row) => (
                <tr key={row.model} className="border-t border-sand-100">
                  <td className="px-3 py-2 text-sand-700 whitespace-nowrap">
                    {row.model}
                    {row.production && <ProductionBadge />}
                  </td>
                  <td className="px-3 py-2 text-sand-700">{row.precision}</td>
                  <td className="px-3 py-2 text-sand-700">{row.recall}</td>
                  <td className="px-3 py-2 text-sand-700">{row.f1}</td>
                  <td className="px-3 py-2 text-sand-700">{row.auc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-sand-400 mt-3">
          Random Forest was chosen for the highest F1 on the ghost class, since accuracy alone is misleading
          under class imbalance.
        </p>
      </section>

      {/* Dataset and limitations */}
      <section className="mt-10">
        <h2 className="font-serif text-xl text-sand-800">Dataset and limitations</h2>
        <p className="text-sm text-sand-600 mt-2 leading-relaxed">
          Both models were trained on the LinkedIn Job Postings dataset (roughly 124,000 US postings). Ghost-job
          labels are heuristic proxies, since no public dataset has verified ghost-job outcomes. Both models were
          trained and evaluated on LinkedIn postings only, and accuracy has not been validated on other
          platforms. Ghost-risk inputs like posting age and repost status are user-estimated rather than
          automatically detected, since that activity data isn't visible on public LinkedIn pages.
        </p>
      </section>

      <div className="mt-12">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-sand-500 hover:text-sand-700 underline underline-offset-2 transition-colors focus:outline-none"
        >
          Back to tool
        </button>
      </div>
    </div>
  );
}

// ---- app ------------------------------------------------------

export default function App() {
  const [screen, setScreen] = useState("tool");

  return (
    <div className="min-h-screen bg-sand-50 font-sans">
      {screen === "tool" ? (
        <ToolScreen onNavigateMethodology={() => setScreen("methodology")} />
      ) : (
        <MethodologyScreen onBack={() => setScreen("tool")} />
      )}
    </div>
  );
}
