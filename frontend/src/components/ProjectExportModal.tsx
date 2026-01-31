import { useState } from 'react';

interface Match {
  id: string;
  matchScore: number;
  matchReasoning: string;
  status: string;
  projectStatus: string;
  professional: {
    firstName: string;
    lastName: string;
    experienceYears: number;
    hourlyRate: number;
    professions: { profession: { name: string } }[];
  };
}

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

interface Project {
  id: string;
  projectTitle: string;
  projectSummary: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  aiCreditsUsed: number;
  projectInsights: {
    budget?: { value: string };
    deadline?: { value: string };
    style?: { value: string };
    target?: { value: string };
    objective?: { value: string };
  };
  matches: Match[];
  messages: Message[];
}

interface ProjectExportModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectExportModal({ project, onClose }: ProjectExportModalProps) {
  const [exporting, setExporting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Terminé',
      'DRAFT': 'Brouillon',
      'PENDING': 'En attente',
      'ACCEPTED': 'Accepté',
      'DECLINED': 'Refusé',
    };
    return labels[status] || status;
  };

  const handleExport = () => {
    setExporting(true);

    // Create export content
    const exportContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.projectTitle || 'Brief Projet'} - Export</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 3px solid #f97316;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #f97316;
      margin-bottom: 10px;
    }
    h1 {
      font-size: 24px;
      color: #111827;
      margin-bottom: 8px;
    }
    h2 {
      font-size: 18px;
      color: #374151;
      margin: 25px 0 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .meta {
      color: #6b7280;
      font-size: 14px;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: #dcfce7;
      color: #166534;
    }
    .section { margin-bottom: 25px; }
    .insight-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .insight-item {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
    }
    .insight-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .insight-value {
      font-weight: 500;
      color: #111827;
    }
    .match-card {
      background: #f9fafb;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 12px;
    }
    .match-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .match-name {
      font-weight: 600;
      color: #111827;
    }
    .match-score {
      background: #dcfce7;
      color: #166534;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .match-details {
      font-size: 14px;
      color: #6b7280;
    }
    .summary-box {
      background: #fff7ed;
      border-left: 4px solid #f97316;
      padding: 15px;
      border-radius: 0 8px 8px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">JUNY</div>
    <h1>${project.projectTitle || 'Projet sans titre'}</h1>
    <div class="meta">
      <span class="status">${getStatusLabel(project.status)}</span>
      &nbsp;&middot;&nbsp;
      Créé le ${formatDate(project.createdAt)}
      &nbsp;&middot;&nbsp;
      ${project.matches.length} créatif(s) matché(s)
    </div>
  </div>

  ${project.projectSummary ? `
  <div class="section">
    <h2>Résumé du projet</h2>
    <div class="summary-box">
      ${project.projectSummary}
    </div>
  </div>
  ` : ''}

  <div class="section">
    <h2>Détails du brief</h2>
    <div class="insight-grid">
      ${project.projectInsights?.objective?.value ? `
      <div class="insight-item">
        <div class="insight-label">Objectif</div>
        <div class="insight-value">${project.projectInsights.objective.value}</div>
      </div>
      ` : ''}
      ${project.projectInsights?.target?.value ? `
      <div class="insight-item">
        <div class="insight-label">Cible</div>
        <div class="insight-value">${project.projectInsights.target.value}</div>
      </div>
      ` : ''}
      ${project.projectInsights?.budget?.value ? `
      <div class="insight-item">
        <div class="insight-label">Budget</div>
        <div class="insight-value">${project.projectInsights.budget.value}</div>
      </div>
      ` : ''}
      ${project.projectInsights?.deadline?.value ? `
      <div class="insight-item">
        <div class="insight-label">Deadline</div>
        <div class="insight-value">${project.projectInsights.deadline.value}</div>
      </div>
      ` : ''}
      ${project.projectInsights?.style?.value ? `
      <div class="insight-item">
        <div class="insight-label">Style</div>
        <div class="insight-value">${project.projectInsights.style.value}</div>
      </div>
      ` : ''}
      <div class="insight-item">
        <div class="insight-label">Crédits IA utilisés</div>
        <div class="insight-value">${project.aiCreditsUsed || 0}</div>
      </div>
    </div>
  </div>

  ${project.matches.length > 0 ? `
  <div class="section">
    <h2>Créatifs matchés (${project.matches.length})</h2>
    ${project.matches.map(match => `
    <div class="match-card">
      <div class="match-header">
        <span class="match-name">${match.professional.firstName} ${match.professional.lastName}</span>
        <span class="match-score">${match.matchScore}% match</span>
      </div>
      <div class="match-details">
        <strong>${match.professional.professions?.[0]?.profession?.name || 'Professionnel'}</strong>
        &nbsp;&middot;&nbsp;
        ${match.professional.experienceYears} ans d'expérience
        &nbsp;&middot;&nbsp;
        ${match.professional.hourlyRate}€/h
        <br>
        <em style="color: #9ca3af; font-size: 13px;">${match.matchReasoning || 'Match basé sur les compétences et l\'expérience'}</em>
      </div>
    </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="footer">
    Exporté depuis JUNY le ${formatDate(new Date().toISOString())}
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
    `;

    // Open in new window for print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(exportContent);
      printWindow.document.close();
    }

    setTimeout(() => {
      setExporting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Exporter le brief</h3>
            <p className="text-sm text-gray-500">Générer un PDF de votre projet</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="font-medium text-gray-900 mb-1">
            {project.projectTitle || 'Projet sans titre'}
          </p>
          <p className="text-sm text-gray-500">
            {project.matches.length} créatif(s) matché(s) &middot; {project.messages.length} message(s)
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Résumé du projet et détails du brief
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Liste des créatifs matchés avec scores
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Format PDF prêt à partager
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={exporting}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Export...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exporter PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
