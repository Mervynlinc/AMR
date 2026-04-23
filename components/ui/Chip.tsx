import { TouchableOpacity, Text, View } from 'react-native';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}

export function Chip({
  label,
  selected = false,
  onPress,
  className = '',
}: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-3 py-2 rounded-full border ${
        selected
          ? 'bg-emerald-700 border-emerald-700'
          : 'bg-white border-gray-300'
      } ${className}`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-xs font-medium ${
          selected ? 'text-white' : 'text-gray-600'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface TabGroupProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabGroup({ tabs, activeTab, onTabChange }: TabGroupProps) {
  return (
    <View className="flex-row bg-gray-100 rounded-xl p-1">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onTabChange(tab)}
          className={`flex-1 py-2 rounded-lg ${
            activeTab === tab ? 'bg-white shadow-sm' : ''
          }`}
        >
          <Text
            className={`text-center text-xs font-medium ${
              activeTab === tab ? 'text-emerald-700 font-semibold' : 'text-gray-500'
            }`}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
