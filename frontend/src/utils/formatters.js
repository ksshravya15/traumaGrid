export function formatBytes(bytes) {
  if (bytes === undefined || bytes === null) return '0 B';
  if (bytes < 1024) return `${bytes} bytes`;
  const kb = (bytes / 1024).toFixed(1);
  return `${kb} KB`;
}

export function formatTime(isoString) {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(isoString) {
  if (!isoString) return '--';
  const date = new Date(isoString);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function getPriorityTheme(priority) {
  switch (priority) {
    case 'RED':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500',
        text: 'text-red-400',
        badge: 'bg-red-500 text-white font-bold',
        pulseClass: 'pulse-red',
        label: 'Code Red — Critical (Immediate)',
        accent: '#ef4444',
      };
    case 'YELLOW':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500',
        text: 'text-amber-400',
        badge: 'bg-amber-500 text-slate-900 font-bold',
        pulseClass: 'pulse-yellow',
        label: 'Code Yellow — Urgent (Delayed)',
        accent: '#f59e0b',
      };
    case 'GREEN':
    default:
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500 text-slate-900 font-bold',
        pulseClass: 'pulse-green',
        label: 'Code Green — Minor (Stable)',
        accent: '#10b981',
      };
  }
}

export function getInjuryBadge(injury) {
  const map = {
    severe_bleeding: { label: 'Severe Bleeding', color: 'bg-red-600 text-white', icon: '🔴' },
    open_wound: { label: 'Open Wound', color: 'bg-amber-600 text-white', icon: '🟠' },
    possible_fracture: { label: 'Suspected Fracture', color: 'bg-orange-600 text-white', icon: '🦴' },
    airway_obstruction: { label: 'Airway Concern', color: 'bg-red-700 text-white', icon: '⚠️' },
    person: { label: 'Victim Detected', color: 'bg-blue-600 text-white', icon: '👤' },
  };
  return map[injury] || { label: injury.replace('_', ' '), color: 'bg-gray-600 text-white', icon: '📌' };
}
