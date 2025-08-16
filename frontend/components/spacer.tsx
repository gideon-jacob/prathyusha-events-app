import { View, type DimensionValue } from 'react-native'
import React from 'react'

type SpacerProps = {
  width?: DimensionValue
  height?: DimensionValue
}

const Spacer = ({ width = "100%", height = 40 }: SpacerProps) => {
  return (
    <View style = {{width, height}}/>
  )
}

export default Spacer