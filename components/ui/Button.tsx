import { ReactNode } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  className = '',
  disabled = false,
}: ButtonProps) {
  const baseStyles = 'w-full py-4 rounded-xl flex-row items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-emerald-700',
    secondary: 'bg-white border-2 border-gray-200',
    outline: 'bg-transparent border border-emerald-700',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
}

interface ButtonWithIconProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function ButtonWithIcon({
  icon,
  title,
  subtitle,
  onPress,
  variant = 'primary',
}: ButtonWithIconProps) {
  const containerStyles = variant === 'primary' 
    ? 'bg-emerald-700' 
    : 'bg-white border-2 border-gray-200';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-full rounded-2xl p-5 flex-row items-center ${containerStyles}`}
      activeOpacity={0.8}
    >
      <View className={`w-12 h-12 rounded-xl items-center justify-center ${variant === 'primary' ? 'bg-white/20' : 'bg-blue-50'}`}>
        {icon}
      </View>
      <View className="flex-1 ml-4">
        <Text className={`text-base font-bold ${variant === 'primary' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </Text>
        {subtitle && (
          <Text className={`text-xs mt-1 ${variant === 'primary' ? 'text-emerald-100' : 'text-gray-500'}`}>
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
