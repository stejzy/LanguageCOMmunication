import { View, Text } from "react-native";
import React from "react";

export default function FlashcardFolder(props) {
  return (
    <View>
      <Text>{props.folder.name}</Text>
    </View>
  );
}
