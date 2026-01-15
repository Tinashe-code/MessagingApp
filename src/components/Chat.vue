<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '../stores/chat'
import ChatArea from './ChatArea.vue'
import Sidebar from './Sidebar.vue'
import { MessageCircle, Phone, Settings, Archive, Bookmark } from 'lucide-vue-next'
import SocketService from '@/services/socket'
import { fetchUserConversations } from '@/services/chat.api'


const chatStore = useChatStore()

// Socket connection (you'll need to implement this based on your backend)
// import socket from '../services/socket' // This should be your Socket.IO instance

const selectedConversation = ref(null)
const selectedConversationname = ref(null)
const isMobile = ref(false)
const showChatArea = ref(false)

const USERS = {
  1: {
    uuid: '11111111-1111-1111-1111-111111111111',
    name: 'Tendai',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
  },
  2: {
    uuid: '33333333-3333-3333-3333-333333333333',
    name: 'Tinashe',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
  }
}

const currentUser = ref(null)


const resolveCurrentUser = () => {
  const params = new URLSearchParams(window.location.search)
  const userParam = params.get('user')
  console.log('Params for cusrrent user', params)
  console.log('Userparam', userParam)

  // Default → user 1 (Tendai)
  currentUser.value = userParam === '2' ? USERS[2] : USERS[1]

  SocketService.emit('user.join', {
  userUuid: currentUser.value.uuid
})
console.log('🔌 USER JOINED SOCKET AS:', currentUser.value.uuid)


  console.log('🧑 CURRENT USER:', currentUser.value)
}

const conversationId = 'c1d2f3a4-5678-4abc-9def-111122223333'

const participants = [
  USERS[1],
  USERS[2]
]



// Current user info (should come from auth store)
// const currentUser = ref({
//   uuid: '33333333-3333-3333-3333-333333333333', // This should come from your auth system
//   name: 'Tinashe',
//   avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
// })

// const currentUser = ref({
//   uuid: '11111111-1111-1111-1111-111111111111', // This should come from your auth system
//   name: 'Tendai',
//   avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
// })

// Screen size handling
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value && !selectedConversation.value) {
    showChatArea.value = false
  }
}

onMounted(async () => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)

  resolveCurrentUser()

  // 🔌 CONNECT SOCKET FIRST
  SocketService.connect()

  // ⏳ WAIT FOR CONNECTION
  SocketService.on('connect', () => {
    console.log('✅ SOCKET READY — registering listeners')

    setupSocketListeners()

    SocketService.emit('sync.request')
  })

  const otherUser = participants.find(
    u => u.uuid !== currentUser.value.uuid
  )

  // chatStore.setConversations([
  //   {
  //     id: conversationId,
  //     name: otherUser.name,
  //     participants,
  //     lastMessage: '',
  //     lastMessageAt: null,
  //     unreadCount: 0
  //   }
  // ])
  const conversations = await fetchUserConversations()
  console.log('Fetched conversations:', conversations)
  chatStore.setConversations(conversations)
  

  // Auto-select first conversation
  if (chatStore.conversations.length) {
    openConversation(chatStore.conversations[0].id)
  }

  selectedConversation.value = conversationId
  selectedConversationname.value = otherUser.name
  chatStore.activeConversationId = conversationId
})


// onMounted(async () => {
//   resolveCurrentUser()

//   console.log('📥 Loading conversations...')
//   const res = await fetch('/api/conversations')
//   const conversations = await res.json()

//   chatStore.setConversations(conversations)

//   // Auto-select first conversation
//   if (conversations.length) {
//     openConversation(conversations[0].id)
//   }
// })

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

  // socketService.on('message.new', (payload) => {
  //   const msg = payload.message

  //   chatStore.addMessages(payload.conversationId, [{
  //     id: msg.id,
  //     conversationId: payload.conversationId,
  //     senderUuid: msg.sender_uuid,
  //     type: msg.message_type,
  //     text: msg.text_content,
  //     media: msg.media || null,
  //     createdAt: msg.created_at,
  //     status: 'sent'
  //   }])
  // })

//   SocketService.on('message.new', ({ conversationId, message }) => {
//   console.log('📥 NEW MESSAGE RECEIVED:', message)

//   chatStore.addMessages(conversationId, [{
//     id: message.id,
//     conversation_id: conversationId,
//     sender_uuid: message.sender_uuid,
//     message_type: message.message_type,
//     text_content: message.text_content,
//     media: message.media || null,
//     created_at: message.created_at,
//     status: 'sent'
//   }])
// })


SocketService.on('message.new', ({ conversationId, message }) => {
  // 🚫 Ignore my own messages
  if (message.sender_uuid === currentUser.value.uuid) {
    console.log('↩️ Ignoring self message')
    return
  }

  console.log('📥 NEW MESSAGE RECEIVED:', message)

  chatStore.addMessages(conversationId, [{
    id: message.id,
    conversation_id: conversationId,
    sender_uuid: message.sender_uuid,
    message_type: message.message_type,
    text_content: message.text_content,
    media: message.media || null,
    created_at: message.created_at,
    status: 'sent'
  }])

  console.log('➡️ Applying last message update to conversation sidebar')
  console.log('Conversation ID:', conversationId)
  console.log('Message:', message)
  chatStore.applyLastMessageUpdate(
  conversationId,
  message
)

})





  // socket.on('message.ack', (payload) => {
  //   chatStore.updateMessageStatus(payload.messageId, 'sent')
  // })
  // socketService.on('message.ack', ({ requestId, payload }) => {
  //   console.log('✅ MESSAGE ACK:', requestId)

  //   chatStore.updateMessageStatus(requestId, 'SENT')
  // })

//   socketService.on('message.ack', ({ requestId, message }) => {
//   console.log('✅ MESSAGE ACK RECEIVED:', requestId)

//   chatStore.replaceOptimisticMessage(requestId, {
//     id: message.id,
//     created_at: message.created_at,
//     status: 'sent'
//   })
// })

SocketService.on('message.ack', ({ requestId, payload }) => {
  console.log('✅ MESSAGE ACK:', requestId, payload)

  chatStore.replaceOptimisticMessage(requestId, {
    id: payload.messageId,
    status: 'sent',
    optimistic: false
  })
})






  SocketService.on('message.delivered', (payload) => {
    chatStore.updateMessageStatus(payload.messageId, 'delivered')
  })

  SocketService.on('message.read', (payload) => {
    chatStore.updateMessageStatus(payload.messageId, 'read')
  })

  // Typing indicators
  SocketService.on('typing.start', (payload) => {
    chatStore.addTypingUser(payload.conversationId, payload.userUuid)
  })

  SocketService.on('typing.stop', (payload) => {
    chatStore.removeTypingUser(payload.conversationId, payload.userUuid)
  })

  // Presence
  SocketService.on('presence.online', (payload) => {
    chatStore.setOnlineUsers([...chatStore.onlineUsers, payload.userId])
  })

  SocketService.on('presence.offline', (payload) => {
    const newOnlineUsers = new Set(chatStore.onlineUsers)
    newOnlineUsers.delete(payload.userId)
    chatStore.setOnlineUsers([...newOnlineUsers])
  })

  SocketService.emit('conversation.join', {
    conversationId: selectedConversation.value
  })


  // Initial sync
  SocketService.on('sync.response', (payload) => {
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

// async function openConversation(conversationId) {
//   chatStore.activeConversationId = conversationId

//   // 🔥 JOIN SOCKET ROOM
//   socketService.emit('conversation.join', { conversationId })

//   // 🔥 LOAD HISTORY
//   const res = await fetch(
//     `/api/conversations/${conversationId}/messages`
//   )
//   console.log('FETCH MESSAGES RESPONSE:', res)
//   const data = await res.json()
//   console.log('FETCHED MESSAGES DATA:', data)
//   //   const text = await res.text()
//   // console.log('RAW RESPONSE TEXT:', text)

//   // chatStore.addMessages(conversationId, data)
//   chatStore.addMessages(conversationId, data.messages)
// }


// async function openConversation(conversationId) {
//   console.log('📂 OPEN CONVERSATION:', conversationId)

//   chatStore.activeConversationId = conversationId

//   // JOIN SOCKET ROOM
//   SocketService.emit('conversation.join', {
//     conversationId
//   })

//   console.log('🔗 JOINED ROOM:', conversationId)

//   // LOAD HISTORY (ONCE)
//   const res = await fetch(`/api/conversations/${conversationId}/messages`)
//   const data = await res.json()

//   console.log('📜 HISTORY LOADED:', data.messages)

//   // chatStore.setMessages(conversationId, data.messages)
//   chatStore.addMessages(conversationId, data.messages)
// }


// REMEMBER TO UNCOMMENT THE CODE
async function openConversation(conversationId) {
  chatStore.activeConversationId = conversationId

  SocketService.emit('conversation.join', { conversationId })

  console.log('📜 Loading last 5 days of messages...')
  fetch(`/api/conversations/${conversationId}/messages`)
    .then(res => res.json())
    .then(({ messages }) => {
      chatStore.addMessages(conversationId, messages)

      // Update sidebar preview using last message
      const last = messages[messages.length - 1]
      // if (last) {
      //   chatStore.updateConversationLastMessage(conversationId, last)
      // }
    })
    .catch(err => {
      console.error('❌ Failed to load messages', err)
    })
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
    //   socket.emit('conversation.join', {
    //   conversationId: id
    // })
    openConversation(id)



    // Mark messages as read when selecting conversation
    if (id) {
      SocketService.emit('conversation.read', { conversationId: id })
    }
  }
}

// const handleSelectConversation = (id) => {
//   selectedConversation.value = id
//   chatStore.activeConversationId = id

//   socketService.emit('conversation.join', {
//     conversationId: id
//   })
// }


const handleBackToSidebar = () => {
  showChatArea.value = false
}

// const handleSendMessage = (payload) => {
//   if (!selectedConversation.value) return

//   // Send message intent to backend
//   // socket.emit('message.send', {
//   //   requestId: crypto.randomUUID(),
//   //   conversationId: selectedConversation.value,
//   //   payload: payload
//   // })

//   socketService.emit('message.send', {
//     requestId: crypto.randomUUID(),
//     payload: {
//       conversationId: selectedConversation.value,
//       content: payload
//     }
//   })


//   // Clear input (handled in ChatArea)
// }

const handleSendMessage = ({ requestId, ...payload }) => {
  if (!selectedConversation.value) return

  console.log('📡 EMIT SOCKET MESSAGE:', { requestId, payload })

  SocketService.emit('message.send', {
    requestId,
    payload: {
      conversationId: selectedConversation.value,
      content: payload
    }
  })
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

  SocketService.emit('typing.start', payload)
}


// onMounted(() => {
//   checkScreenSize()
//   window.addEventListener('resize', checkScreenSize)

//   // Setup socket listeners
//   setupSocketListeners()

//   // Request initial sync
//   SocketService.emit('sync.request')
// })

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  // Clean up socket listeners
  SocketService.off('message.new')
  SocketService.off('message.ack')
  SocketService.off('message.delivered')
  SocketService.off('message.read')
  SocketService.off('typing.start')
  SocketService.off('typing.stop')
  SocketService.off('presence.online')
  SocketService.off('presence.offline')
  SocketService.off('sync.response')
})

// onMounted(() => {
//   chatStore.setConversations([
//     {
//       id: 'c1d2f3a4-5678-4abc-9def-111122223333',
//       name: 'Test Chat',
//       lastMessage: '',
//       lastMessageAt: null,
//       unreadCount: 0
//     }
//   ])

//   selectedConversation.value = 'c1d2f3a4-5678-4abc-9def-111122223333'
//   chatStore.activeConversationId = 'c1d2f3a4-5678-4abc-9def-111122223333'

//   setupSocketListeners()
// })



// const otherUser = participants.find(
//   u => u.uuid !== currentUser.value.uuid
// )

// chatStore.setConversations([
//   {
//     id: conversationId,
//     name: otherUser.name,
//     participants,
//     lastMessage: '',
//     lastMessageAt: null,
//     unreadCount: 0
//   }
// ])

// selectedConversation.value = conversationId
// chatStore.activeConversationId = conversationId

// onMounted(() => {
//   resolveCurrentUser()
  
//   const otherUser = participants.find(
//     u => u.uuid !== currentUser.value.uuid
//   )

//   chatStore.setConversations([
//     {
//       id: conversationId,
//       name: otherUser.name,
//       participants,
//       lastMessage: '',
//       lastMessageAt: null,
//       unreadCount: 0
//     }
//   ])

//   selectedConversation.value = conversationId
//   selectedConversationname.value = otherUser.name
//   chatStore.activeConversationId = conversationId

//   // setupSocketListeners()
// })





</script>

<template>
  <div class="h-screen flex bg-background">
    <!-- Sidebar -->
    <div :class="[
      'transition-all duration-300 ease-in-out',
      isMobile ? (showChatArea ? 'hidden' : 'w-full') : 'w-105'
    ]">
      <Sidebar :selected-conversation="selectedConversation" :conversations="chatStore.conversations"
        :online-users="chatStore.onlineUsers" :currentUserId="currentUser" @select-conversation="handleSelectConversation" />
    </div>
    <!-- :chatPartner="selectedConversationname" -->
    <!-- Chat Area -->
    <div :class="[
      'transition-all duration-300 ease-in-out',
      isMobile ? (showChatArea ? 'w-full' : 'hidden') : 'flex-1'
    ]">
      <ChatArea :conversation-id="selectedConversation" :chatPartner="chatStore.conversations.find(c => c.id === selectedConversation)?.participants
        ?.find(u => u.uuid !== currentUser.uuid)" :messages="chatStore.activeMessages" :current-user="currentUser"
        :is-mobile="isMobile" :typing-users="chatStore.typingUsers[selectedConversation] || []"
        @back="handleBackToSidebar" @send-message="handleSendMessage" @typing="handleTyping" />
    </div>

    <!-- MOBILE BOTTOM NAVIGATION -->
    <div v-if="isMobile && !showChatArea"
      class="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 justify-around items-center z-50">
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