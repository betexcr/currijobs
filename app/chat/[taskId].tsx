import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

type Message = { id: string; senderId: string; text: string; createdAt: number };

export default function ChatScreen() {
  const { taskId, peerId } = useLocalSearchParams<{ taskId: string; peerId?: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    // Placeholder: load from backend later
    setMessages([]);
  }, [taskId, peerId]);

  const send = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      senderId: user?.id || 'me',
      text: input.trim(),
      createdAt: Date.now(),
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chat</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const mine = item.senderId === user?.id;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={styles.text}>{item.text}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          placeholderTextColor="#9CA3AF"
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#1E3A8A' },
  back: { color: 'white', fontSize: 22 },
  title: { color: 'white', fontSize: 18, fontWeight: '700' },
  list: { padding: 12 },
  bubble: { maxWidth: '75%', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, marginVertical: 6 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#1E3A8A' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#E5E7EB' },
  text: { color: 'white' },
  inputRow: { flexDirection: 'row', padding: 8, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  input: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, marginRight: 8 },
  sendBtn: { backgroundColor: '#1E3A8A', paddingHorizontal: 16, borderRadius: 20, justifyContent: 'center' },
  sendText: { color: 'white', fontWeight: '700' },
});



