import { View, Text } from 'react-native';
import { ReactNode } from 'react';

interface InfoBoxProps {
  icon?: ReactNode;
  title?: string;
  message: string;
  variant?: 'info' | 'warning' | 'error' | 'success';
  className?: string;
}

export function InfoBox({
  icon,
  title,
  message,
  variant = 'info',
  className = '',
}: InfoBoxProps) {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200',
    error: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
  };

  const textStyles = {
    info: 'text-blue-800',
    warning: 'text-amber-800',
    error: 'text-red-800',
    success: 'text-green-800',
  };

  return (
    <View className={`rounded-xl p-3 border ${variantStyles[variant]} ${className}`}>
      <View className="flex-row items-start gap-2">
        {icon && <View className="mt-0.5">{icon}</View>}
        <View className="flex-1">
          {title && (
            <Text className={`text-xs font-bold ${textStyles[variant]} mb-1`}>
              {title}
            </Text>
          )}
          <Text className={`text-xs leading-relaxed ${textStyles[variant]}`}>
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
}
