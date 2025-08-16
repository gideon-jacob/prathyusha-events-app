import { StyleSheet, Text, View, type ViewStyle, type TextInputProps } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-gesture-handler'

interface ThemedTextInputProps extends TextInputProps {
  style?: ViewStyle
}

const ThemedTextInput = ({style, ...props}: ThemedTextInputProps) => {
  return (
    <TextInput style={[{
        
    },
    style]}
    {...props}
    />
  )
}

export default ThemedTextInput

const styles = StyleSheet.create({})