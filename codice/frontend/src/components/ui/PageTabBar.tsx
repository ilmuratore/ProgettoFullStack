export interface TabConfig {
  id: string;
  label: string;
  icon?: React.ElementType;
  count?: number;
  disabled?: boolean;
}

interface PageTabBarProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function PageTabBar({ tabs, activeTab, onTabChange }: PageTabBarProps) {
  return (
    <div className="bg-white border-b border-[#E5EAF2]">
      {/* Mobile: native select */}
      <div className="md:hidden px-4 py-3">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value)}
          className="w-full px-3 py-2 border border-[#E5EAF2] rounded-xl text-sm text-[#374151] bg-white focus:outline-none focus:ring-2 focus:ring-[#17E88F] focus:border-transparent"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id} disabled={tab.disabled}>
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: pill tabs */}
      <div className="hidden md:flex items-center gap-1.5 px-6 py-3 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = !!tab.disabled;
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-[#F0FFF8] text-[#1E293B]'
                  : isDisabled
                    ? 'text-[#C0C7D1] cursor-not-allowed opacity-60'
                    : 'text-[#6B7280] hover:bg-[#F7F9FC] hover:text-[#374151]'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#17E88F]' : isDisabled ? 'text-[#D1D5DB]' : 'text-[#9CA3AF]'}`}
                />
              )}
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-semibold min-w-[20px] text-center ${
                    isActive
                      ? 'bg-[#17E88F] text-white'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
