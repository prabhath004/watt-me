import { HouseDiagramCard } from './HouseDiagramCard';
import type { HomeLatest } from '@/hooks/useAdminData';

interface HousesGridProps {
  homes: HomeLatest[];
}

export function HousesGrid({ homes }: HousesGridProps) {
  // Sort: exporters first, then neutral, then importers
  const sortedHomes = [...homes].sort((a, b) => {
    const aExport = a.grid_export_w > 500 ? 1 : 0;
    const bExport = b.grid_export_w > 500 ? 1 : 0;
    const aImport = a.grid_import_w > 500 ? -1 : 0;
    const bImport = b.grid_import_w > 500 ? -1 : 0;
    return (bExport + bImport) - (aExport + aImport);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedHomes.map(home => (
        <HouseDiagramCard key={home.home_id} home={home} />
      ))}
    </div>
  );
}
