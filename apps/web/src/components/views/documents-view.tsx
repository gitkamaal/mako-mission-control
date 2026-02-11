"use client";

import { useState } from "react";

interface Document {
  id: string;
  title: string;
  type: "markdown" | "code" | "data";
  updatedAt: string;
  agent: string;
}

const mockDocuments: Document[] = [
  { id: "1", title: "Project README", type: "markdown", updatedAt: "2 hours ago", agent: "Scribe" },
  { id: "2", title: "API Documentation", type: "markdown", updatedAt: "5 hours ago", agent: "Scribe" },
  { id: "3", title: "Database Schema", type: "code", updatedAt: "1 day ago", agent: "Forge" },
  { id: "4", title: "Architecture Decisions", type: "markdown", updatedAt: "2 days ago", agent: "Atlas" },
];

const typeIcons: Record<string, string> = {
  markdown: "📝",
  code: "💻",
  data: "📊",
};

export function DocumentsView() {
  const [documents] = useState(mockDocuments);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Documents</h1>
          <p className="text-secondary">Files and deliverables from agents</p>
        </div>
        <button className="btn-glass">
          + New Document
        </button>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="liquid-card p-5 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                {typeIcons[doc.type]}
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">{doc.title}</h3>
                <p className="text-sm text-secondary">
                  Updated {doc.updatedAt} by {doc.agent}
                </p>
              </div>
              <div className="text-secondary">→</div>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="liquid-card p-12 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="font-medium mb-2">No documents yet</h3>
          <p className="text-secondary text-sm">Documents created by agents will appear here</p>
        </div>
      )}
    </div>
  );
}
