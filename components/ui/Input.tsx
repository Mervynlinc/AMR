import { TextInput, View, Text, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  readOnly?: boolean;
  className?: string;
  type?: 'text' | 'password' | 'number';
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  readOnly = false,
  className = '',
  type = 'text',
}: InputProps) {
  return (
    <View className={className}>
      {label && (
        <Text className="text-xs font-medium text-gray-600 mb-1.5">
          {label}
        </Text>
      )}
      <TextInput
        className={`w-full px-4 py-4 border border-gray-200 rounded-xl text-sm ${
          readOnly ? 'bg-gray-50 font-medium' : 'bg-white'
        }`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        editable={!readOnly}
        keyboardType={type === 'number' ? 'numeric' : 'default'}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}

interface SelectProps {
  label?: string;
  options: string[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onValueChange,
  className = '',
}: SelectProps) {
  return (
    <View className={className}>
      {label && (
        <Text className="text-xs font-semibold text-gray-700 mb-1.5">
          {label}
        </Text>
      )}
      <View className="border border-gray-200 rounded-xl overflow-hidden">
        <TextInput
          className="w-full px-4 py-3.5 text-sm bg-white"
          value={value || ''}
          onChangeText={onValueChange}
          placeholder="Select..."
          placeholderTextColor="#9ca3af"
        />
      </View>
    </View>
  );
}

interface InputWithIconProps {
  icon: ReactNode;
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  className?: string;
}

export function InputWithIcon({
  icon,
  placeholder,
  value,
  onChangeText,
  className = '',
}: InputWithIconProps) {
  return (
    <View className={`relative ${className}`}>
      <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        {icon}
      </View>
      <TextInput
        className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-xl text-sm bg-white"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}
