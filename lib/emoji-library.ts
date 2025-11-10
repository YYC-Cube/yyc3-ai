function selectEmojiByEmotion(emotion, style) {
  const emojiLibrary = {
    // 焦虑/压力状态
    anxiety: {
      warm: ["🤗", "🌟", "💖"], // 温柔关怀型
      humor: ["🐱", "🐼", "🌈"], // 幽默陪伴型
    },
    // 愉快/满意状态
    happy: {
      warm: ["🎉", "🌻", "✨"],
      humor: ["🎊", "🦄", "🌈"],
    },
    // 困惑/无助状态
    confused: {
      warm: ["🤔", "💡", "🌱"],
      humor: ["🐔", "❓", "🌍"],
    },
    // 愤怒/不满状态
    angry: {
      warm: ["🌿", "🕊️", "💧"],
      humor: ["🐢", "🍃", "🌸"],
    },
  }

  return emojiLibrary[emotion][style] || emojiLibrary[emotion]["warm"]
}
