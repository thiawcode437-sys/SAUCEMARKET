import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageAPI, BASE_URL } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, radius, typography, formatFCFA } from '../theme/colors';

const SOCKET_URL = BASE_URL.replace('/v1', '').replace('http', 'ws');

export default function ChatScreen({ route, navigation }) {
  const { convId, product, peer } = route.params;
  const me = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: peer.name });
  }, [peer, navigation]);

  useEffect(() => {
    let active = true;
    (async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const history = await MessageAPI.history(convId);
      if (active) setMessages(history.items.reverse());

      const socket = io(SOCKET_URL, { auth: { token } });
      socketRef.current = socket;
      socket.emit('conv:join', convId);
      socket.on('message:new', (msg) => {
        if (msg.conversationId === convId) {
          setMessages((prev) => [...prev, msg]);
        }
      });
      socket.emit('message:read', { convId });
    })();
    return () => {
      active = false;
      socketRef.current?.disconnect();
    };
  }, [convId]);

  const send = () => {
    const body = input.trim();
    if (!body) return;
    setInput('');
    socketRef.current?.emit('message:send', { convId, body }, (ack) => {
      if (!ack?.ok) {
        // TODO: retry queue
      }
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
      keyboardVerticalOffset={80}
    >
      {product && (
        <View style={styles.contextBar}>
          <Text style={styles.contextTitle} numberOfLines={1}>📦 {product.title}</Text>
          <Text style={styles.contextPrice}>{formatFCFA(product.price)}</Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => {
          const isMine = item.senderId === me.id;
          return (
            <View style={[styles.bubbleRow, isMine ? styles.rowRight : styles.rowLeft]}>
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={isMine ? styles.textMine : styles.textTheirs}>{item.body}</Text>
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="attach" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Écrire un message…"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          blurOnSubmit={false}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contextBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: spacing.md, backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  contextTitle: { ...typography.body, flex: 1 },
  contextPrice: { ...typography.body, color: colors.primary, fontWeight: '700' },
  bubbleRow: { marginVertical: 2 },
  rowLeft: { alignItems: 'flex-start' },
  rowRight: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '78%', padding: spacing.sm + 2,
    borderRadius: radius.md, marginVertical: 2,
  },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
  textMine: { color: 'white', fontSize: 15 },
  textTheirs: { color: colors.text, fontSize: 15 },
  time: {
    fontSize: 10, color: 'rgba(255,255,255,0.7)',
    marginTop: 2, alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.sm, backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  iconBtn: { padding: spacing.sm },
  input: {
    flex: 1, backgroundColor: colors.bg,
    borderRadius: radius.pill, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, fontSize: 15, maxHeight: 100,
  },
  sendBtn: {
    marginLeft: spacing.sm, width: 40, height: 40,
    borderRadius: 20, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});
