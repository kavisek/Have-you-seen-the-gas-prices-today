"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { PageTransition } from "@/components/PageTransition";

const COO_DEFAULT = {
  certifier_type: "Exporter",
  certifier_name: "Acme Ltd",
  certifier_address: "123 Main St, Vancouver, BC",
  certifier_phone: "604-555-0100",
  certifier_email: "export@example.ca",
  exporter_name: "Acme Ltd",
  exporter_address: "123 Main St",
  producer_name: "Acme Ltd",
  producer_address: "123 Main St",
  importer_name: "US Buyer LLC",
  importer_address: "456 Ave, Seattle, WA",
  goods_description: "Wooden tables",
  hts_code: "9403.30.80",
  origin_criterion: "B",
  country_of_origin: "Canada",
  signature_name: "Jane Smith",
  signature_date: "2026-03-22",
};

const RULING_DEFAULT = {
  company_name: "Acme Ltd",
  company_address: "123 Main St, Vancouver, BC",
  contact_name: "Jane Smith",
  contact_email: "jane@example.ca",
  transaction_description: "Import of wooden tables from Canada",
  product_description: "Solid oak dining tables",
  proposed_hts: "9403.30.8090",
  legal_argument: "Classification in Chapter 94 per GRI 1.",
  gri_applied: "GRI 1",
  date: "2026-03-22",
};

export default function DocumentsPage() {
  const [msg, setMsg] = useState("");

  async function downloadPdf(path, body) {
    setMsg("");
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setMsg(await res.text());
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = path.includes("coo") ? "certificate-of-origin.pdf" : "binding-ruling-draft.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-zinc-500">Generate PDF drafts (informational — verify with a broker).</p>
        {msg && <p className="text-red-500 text-sm">{msg}</p>}
        <div className="space-y-3">
          <h2 className="font-medium">Certificate of Origin</h2>
          <button
            type="button"
            onClick={() => downloadPdf("/documents/coo", COO_DEFAULT)}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm"
          >
            Download CoO PDF
          </button>
        </div>
        <div className="space-y-3">
          <h2 className="font-medium">Binding ruling letter (draft)</h2>
          <button
            type="button"
            onClick={() => downloadPdf("/documents/binding-ruling", RULING_DEFAULT)}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm"
          >
            Download draft PDF
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
