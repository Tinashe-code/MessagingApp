<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '../stores/chat'
import ChatArea from './ChatArea.vue'
import Sidebar from './Sidebar.vue'
import { MessageCircle, Phone, Settings, Archive, Bookmark } from 'lucide-vue-next'

const chatStore = useChatStore()

// Socket connection (you'll need to implement this based on your backend)
import socket from '../services/socket' // This should be your Socket.IO instance

const selectedConversation = ref(null)
const isMobile = ref(false)
const showChatArea = ref(false)

// Current user info (should come from auth store)
const currentUser = ref({
  uuid: 'user-uuid-from-auth', // This should come from your auth system
  name: 'Current User',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
})

// Screen size handling
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value && !selectedConversation.value) {
    showChatArea.value = false
  }
}

// Socket event handlers
const setupSocketListeners = () => {
  // Message events
  // socket.on('message.new', (payload) => {
  //   chatStore.addMessages(payload.conversationId, [payload.message])
    
  //   // Update conversation last message
  //   chatStore.updateConversation(payload.conversationId, {
  //     lastMessage: payload.message.text || getMessagePreview(payload.message),
  //     lastMessageAt: payload.message.createdAt
  //   })
  // })

  socket.on('message.new', (payload) => {
  const msg = payload.message

  chatStore.addMessages(payload.conversationId, [{
    id: msg.id,
    conversationId: payload.conversationId,
    senderUuid: msg.sender_uuid,
    type: msg.message_type,
    text: msg.text_content,
    media: msg.media || null,
    createdAt: msg.created_at,
    status: 'sent'
  }])
})

  
  socket.on('message.ack', (payload) => {
    chatStore.updateMessageStatus(payload.messageId, 'sent')
  })
  
  socket.on('message.delivered', (payload) => {
    chatStore.updateMessageStatus(payload.messageId, 'delivered')
  })
  
  socket.on('message.read', (payload) => {
    chatStore.updateMessageStatus(payload.messageId, 'read')
  })
  
  // Typing indicators
  socket.on('typing.start', (payload) => {
    chatStore.addTypingUser(payload.conversationId, payload.userUuid)
  })
  
  socket.on('typing.stop', (payload) => {
    chatStore.removeTypingUser(payload.conversationId, payload.userUuid)
  })
  
  // Presence
  socket.on('presence.online', (payload) => {
    chatStore.setOnlineUsers([...chatStore.onlineUsers, payload.userId])
  })
  
  socket.on('presence.offline', (payload) => {
    const newOnlineUsers = new Set(chatStore.onlineUsers)
    newOnlineUsers.delete(payload.userId)
    chatStore.setOnlineUsers([...newOnlineUsers])
  })

  socket.emit('conversation.join', {
  conversationId: selectedConversation.value
})

  
  // Initial sync
  socket.on('sync.response', (payload) => {
    chatStore.setConversations(payload.conversations)
    
    // Load messages for each conversation
    Object.keys(payload.messages).forEach(conversationId => {
      chatStore.addMessages(conversationId, payload.messages[conversationId])
    })
  })
}

const getMessagePreview = (message) => {
  switch (message.type) {
    case 'image': return '📷 Image'
    case 'video': return '🎥 Video'
    case 'audio': return '🎵 Audio'
    case 'document': return '📄 Document'
    default: return message.text || 'Message'
  }
}

const handleSelectConversation = (id) => {
  const previousValue = selectedConversation.value
  
  if (isMobile.value && id === previousValue) {
    showChatArea.value = !showChatArea.value
  } else {
    selectedConversation.value = id
    chatStore.activeConversationId = id
    if (isMobile.value) {
      showChatArea.value = true
    }

    // join the conversation 
    socket.emit('conversation.join', {
    conversationId: id
  })
    
    // Mark messages as read when selecting conversation
    if (id) {
      socket.emit('conversation.read', { conversationId: id })
    }
  }
}

// const handleSelectConversation = (id) => {
//   selectedConversation.value = id
//   chatStore.activeConversationId = id

//   socket.emit('conversation.join', {
//     conversationId: id
//   })
// }


const handleBackToSidebar = () => {
  showChatArea.value = false
}

const handleSendMessage = (payload) => {
  if (!selectedConversation.value) return
  
  // Send message intent to backend
  // socket.emit('message.send', {
  //   requestId: crypto.randomUUID(),
  //   conversationId: selectedConversation.value,
  //   payload: payload
  // })

  socket.emit('message.send', {
  requestId: crypto.randomUUID(),
  payload: {
    conversationId: selectedConversation.value,
    content: payload
  }
})

  
  // Clear input (handled in ChatArea)
}

// Typing indicator
let typingTimeout = null
// const handleTyping = () => {
//   if (!selectedConversation.value) return
  
//   // Send typing start
//   socket.emit('typing.start', { conversationId: selectedConversation.value })
  
//   // Clear previous timeout
//   if (typingTimeout) clearTimeout(typingTimeout)
  
//   // Set timeout to send typing stop
//   typingTimeout = setTimeout(() => {
//     socket.emit('typing.stop', { conversationId: selectedConversation.value })
//   }, 3000)
// }

const handleTyping = (payload) => {
  if (!payload?.conversationId) return

  socket.emit('typing.start', payload)
}


onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  
  // Setup socket listeners
  setupSocketListeners()
  
  // Request initial sync
  socket.emit('sync.request')
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  // Clean up socket listeners
  socket.off('message.new')
  socket.off('message.ack')
  socket.off('message.delivered')
  socket.off('message.read')
  socket.off('typing.start')
  socket.off('typing.stop')
  socket.off('presence.online')
  socket.off('presence.offline')
  socket.off('sync.response')
})

onMounted(() => {
  chatStore.setConversations([
    {
      id: 'REAL_CONVERSATION_UUID',
      name: 'Test Chat',
      lastMessage: '',
      lastMessageAt: null,
      unreadCount: 0
    }
  ])

  selectedConversation.value = 'REAL_CONVERSATION_UUID'
  chatStore.activeConversationId = 'REAL_CONVERSATION_UUID'

  setupSocketListeners()
})

</script>

<template>
  <div class="h-screen flex bg-background">
    <!-- Sidebar -->
    <div 
      :class="[
        'transition-all duration-300 ease-in-out',
        isMobile ? (showChatArea ? 'hidden' : 'w-full') : 'w-85'
      ]"
    >
      <Sidebar 
        :selected-conversation="selectedConversation"
        :conversations="chatStore.conversations"
        :online-users="chatStore.onlineUsers"
        @select-conversation="handleSelectConversation"
      />
    </div>
    
    <!-- Chat Area -->
    <div 
      :class="[
        'transition-all duration-300 ease-in-out',
        isMobile ? (showChatArea ? 'w-full' : 'hidden') : 'flex-1'
      ]"
    >
      <ChatArea 
        :conversation-id="selectedConversation"
        :messages="chatStore.activeMessages"
        :current-user="currentUser"
        :is-mobile="isMobile"
        :typing-users="chatStore.typingUsers[selectedConversation] || []"
        @back="handleBackToSidebar"
        @send-message="handleSendMessage"
        @typing="handleTyping"
      />
    </div>

    <!-- MOBILE BOTTOM NAVIGATION -->
    <div 
      v-if="isMobile && !showChatArea"
      class="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 justify-around items-center z-50"
    >
      <button class="btn-mobile-icon flex flex-col items-center p-2 rounded-lg active:bg-gray-100">
        <MessageCircle class="w-6 h-6 mb-1" />
        <span class="text-xs">Chats</span>
      </button>
      <button class="btn-mobile-icon flex flex-col items-center p-2 rounded-lg active:bg-gray-100">
        <Phone class="w-6 h-6 mb-1" />
        <span class="text-xs">Calls</span>
      </button>
      <button class="btn-mobile-icon flex flex-col items-center p-2 rounded-lg active:bg-gray-100">
        <Archive class="w-6 h-6 mb-1" />
        <span class="text-xs">Archive</span>
      </button>
      <button class="btn-mobile-icon flex flex-col items-center p-2 rounded-lg active:bg-gray-100">
        <Bookmark class="w-6 h-6 mb-1" />
        <span class="text-xs">Saved</span>
      </button>
      <button class="btn-mobile-icon flex flex-col items-center p-2 rounded-lg active:bg-gray-100">
        <Settings class="w-6 h-6 mb-1" />
        <span class="text-xs">Settings</span>
      </button>
    </div>
  </div>
</template>