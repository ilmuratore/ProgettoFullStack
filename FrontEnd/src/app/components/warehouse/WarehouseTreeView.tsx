import { useState } from 'react';
import { ChevronRight, ChevronDown, Warehouse, Grid3X3, Boxes } from 'lucide-react';

interface TreeNode {
  id: string;
  name: string;
  type: 'warehouse' | 'zone' | 'aisle';
  ubicazioni: number;
  occupazione: number;
  children?: TreeNode[];
}

const warehouseData: TreeNode[] = [
  {
    id: 'mag-01',
    name: 'Magazzino Principale',
    type: 'warehouse',
    ubicazioni: 850,
    occupazione: 82,
    children: [
      {
        id: 'zona-a',
        name: 'Zona A - Prodotti Finiti',
        type: 'zone',
        ubicazioni: 300,
        occupazione: 95,
        children: [
          { id: 'corsia-a1', name: 'Corsia A01', type: 'aisle', ubicazioni: 100, occupazione: 98 },
          { id: 'corsia-a2', name: 'Corsia A02', type: 'aisle', ubicazioni: 100, occupazione: 96 },
          { id: 'corsia-a3', name: 'Corsia A03', type: 'aisle', ubicazioni: 100, occupazione: 91 },
        ],
      },
      {
        id: 'zona-b',
        name: 'Zona B - Materie Prime',
        type: 'zone',
        ubicazioni: 280,
        occupazione: 74,
        children: [
          { id: 'corsia-b1', name: 'Corsia B01', type: 'aisle', ubicazioni: 90, occupazione: 78 },
          { id: 'corsia-b2', name: 'Corsia B02', type: 'aisle', ubicazioni: 95, occupazione: 72 },
          { id: 'corsia-b3', name: 'Corsia B03', type: 'aisle', ubicazioni: 95, occupazione: 72 },
        ],
      },
      {
        id: 'zona-ref',
        name: 'Zona Refrigerata',
        type: 'zone',
        ubicazioni: 120,
        occupazione: 88,
        children: [
          { id: 'corsia-r1', name: 'Corsia R01', type: 'aisle', ubicazioni: 60, occupazione: 90 },
          { id: 'corsia-r2', name: 'Corsia R02', type: 'aisle', ubicazioni: 60, occupazione: 86 },
        ],
      },
      {
        id: 'zona-sped',
        name: 'Area Spedizioni',
        type: 'zone',
        ubicazioni: 150,
        occupazione: 65,
        children: [
          { id: 'corsia-s1', name: 'Bancale S01', type: 'aisle', ubicazioni: 50, occupazione: 70 },
          { id: 'corsia-s2', name: 'Bancale S02', type: 'aisle', ubicazioni: 50, occupazione: 62 },
          { id: 'corsia-s3', name: 'Bancale S03', type: 'aisle', ubicazioni: 50, occupazione: 63 },
        ],
      },
    ],
  },
];

function TreeNodeItem({ node, level = 0 }: { node: TreeNode; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  const getOccupazioneColor = (occupazione: number) => {
    if (occupazione >= 90) return 'bg-[#EF4444] text-white';
    if (occupazione >= 75) return 'bg-[#F59E0B] text-white';
    return 'bg-[#22C55E] text-white';
  };

  const getIcon = () => {
    switch (node.type) {
      case 'warehouse':
        return <Warehouse className="w-4 h-4" />;
      case 'zone':
        return <Grid3X3 className="w-4 h-4" />;
      case 'aisle':
        return <Boxes className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <div
        onClick={() => node.children && setIsExpanded(!isExpanded)}
        className={`flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-[#F7F9FC] transition-all cursor-pointer group ${
          level === 0 ? 'bg-[#F0FDF7]' : ''
        }`}
        style={{ marginLeft: `${level * 20}px` }}
      >
        {node.children && (
          <div className="text-[#6B7280]">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        )}
        {!node.children && <div className="w-4" />}

        <div className="w-8 h-8 bg-white border border-[#E5EAF2] rounded-lg flex items-center justify-center text-[#6B7280] group-hover:border-[#17E88F] group-hover:text-[#17E88F] transition-all">
          {getIcon()}
        </div>

        <div className="flex-1">
          <div className="font-medium text-[#2D2D2D] text-sm">{node.name}</div>
          <div className="text-xs text-[#6B7280] mt-0.5">{node.ubicazioni} ubicazioni</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-[#2D2D2D]">{node.occupazione}%</div>
            <div className="text-xs text-[#6B7280]">occupato</div>
          </div>
          <div className={`w-12 h-12 ${getOccupazioneColor(node.occupazione)} rounded-xl flex items-center justify-center font-semibold text-sm`}>
            {node.occupazione}%
          </div>
        </div>
      </div>

      {isExpanded && node.children && (
        <div className="space-y-1 mt-1">
          {node.children.map((child) => (
            <TreeNodeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function WarehouseTreeView() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-[#2D2D2D]">Struttura Magazzino</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-[#22C55E] rounded"></div>
            <span className="text-[#6B7280]">Disponibile</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-[#F59E0B] rounded"></div>
            <span className="text-[#6B7280]">Quasi Pieno</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-[#EF4444] rounded"></div>
            <span className="text-[#6B7280]">Saturo</span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {warehouseData.map((node) => (
          <TreeNodeItem key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
