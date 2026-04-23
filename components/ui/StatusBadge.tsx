import { View, Text } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export function StatusBadge({
  label,
  variant = 'default',
  className = '',
}: StatusBadgeProps) {
  const variantStyles = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-100 text-gray-700',
  };

  return (
    <View className={`px-2.5 py-1 rounded-full ${variantStyles[variant].split(' ')[0]} ${className}`}>
      <Text className={`text-xs font-semibold ${variantStyles[variant].split(' ')[1]}`}>
        {label}
      </Text>
    </View>
  );
}

interface ASTBadgeProps {
  result: 'S' | 'I' | 'R';
}

export function ASTBadge({ result }: ASTBadgeProps) {
  const styles = {
    S: 'bg-green-500',
    I: 'bg-amber-500',
    R: 'bg-red-500',
  };

  return (
    <View className={`px-2 py-0.5 rounded ${styles[result]}`}>
      <Text className="text-white text-xs font-bold">{result}</Text>
    </View>
  );
}
