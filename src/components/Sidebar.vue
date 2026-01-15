<script setup>
import { MessageCircle, Phone, Settings, Archive, Bookmark } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  selectedConversation: String,
  conversations: Array,
  // onlineUsers: Set,
  onlineUsers: Array,
  onSelectConversation: Function,
  currentUserId: String
})

const emit = defineEmits(['select-conversation'])

const handleConversationClick = (id) => {
  emit('select-conversation', id)
}

// Helper to check if user is online
const isUserOnline = computed(() => (userId) => {
  // return props.onlineUsers.has(userId)
  return props.onlineUsers.includes(userId)

})

// Format timestamp
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }
  
  // Otherwise show date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}


// Helper to get other participant's name
const getOtherParticipantName = computed(() => (conversation) => {
  if (!conversation?.participants || !props.currentUserId) {
    return conversation.name || 'Unknown User'
  }
  
  // Find the participant who is NOT the current user
  const otherParticipant = conversation.participants.find(
    participant => participant.uuid !== props.currentUserId
  )
  
  return otherParticipant?.user_name || conversation.name || 'Unknown User'
})


// Helper to get other participant's avatar
const getOtherParticipantAvatar = computed(() => (conversation) => {
  if (!conversation?.participants || !props.currentUserId) {
    return null
  }
  
  const otherParticipant = conversation.participants.find(
    participant => participant.uuid !== props.currentUserId
  )
  
  return otherParticipant?.avatar_url
})
</script>

<template>
  <div class="w-full md:w-85 border-r border-border flex h-screen">
    <!-- Navigation Icons - Hidden on mobile -->
    <div class="hidden md:flex w-18 flex-col items-center py-4 space-y-4 bg-gray-50">
      <div class="avatar w-10 h-10 rounded-full overflow-hidden">
        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face" alt="ME" class="w-full h-full object-cover" />
        <div class="w-full h-full bg-gray-200 flex items-center justify-center">
          ME
        </div>
      </div>
      
      <div class="separator w-8 h-px bg-border"></div>
      
      <button class="btn-icon w-10 h-10">
        <MessageCircle class="w-5 h-5" />
      </button>
      <button class="btn-icon w-10 h-10">
        <Phone class="w-5 h-5" />
      </button>
      <button class="btn-icon w-10 h-10">
        <Archive class="w-5 h-5" />
      </button>
      <button class="btn-icon w-10 h-10">
        <Bookmark class="w-5 h-5" />
      </button>
      <button class="btn-icon w-10 h-10">
        <Settings class="w-5 h-5" />
      </button>
    </div>

    <!-- Main Sidebar Content -->
    <div class="flex-1 flex flex-col w-full">
      <!-- Mobile header -->
      <div class="p-4 border-b border-border bg-white md:bg-transparent">
        <h1 class="text-lg font-semibold">Tenant Chat</h1>
      </div>

      <div class="space-y-1 p-2">
    <div
      v-for="conversation in conversations"
      :key="conversation.id"
      :class="[
        'grid grid-cols-[auto_1fr_auto] items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 active:bg-gray-200 w-full',
        selectedConversation === conversation.id ? 'bg-gray-100' : ''
      ]"
      @click="handleConversationClick(conversation.id)"
    >
      <!-- Avatar -->
      <div class="relative">
        <div class="avatar w-12 h-12 rounded-full overflow-hidden">
          <div class="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
            {{ conversation.name?.[0] || 'C' }}
          </div>
        </div>
      </div>
      
      <!-- Text content -->
      <div class="min-w-0">
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-medium truncate">{{ getOtherParticipantName(conversation) }}</h3>
          <span class="text-xs text-gray-500 shrink-0 ml-2">{{ formatTime(conversation.lastMessageAt) }}</span>
        </div>
        <p class="truncate text-sm text-gray-600">{{ conversation.lastMessage || 'No messages yet' }}</p>
      </div>
      
      <!-- Unread badge -->
      <div 
        v-if="conversation.unreadCount > 0" 
        class="badge bg-green-500 text-white rounded-full w-5 h-5 p-0 text-xs flex items-center justify-center"
      >
        {{ conversation.unreadCount }}
      </div>
    </div>
  </div>






      
    </div>
  </div>
</template>

<style scoped>
.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.displaytext {
    overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  min-width: 0;
  width: 100%;
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.avatar {
  flex-shrink: 0;
}

.badge {
  flex-shrink: 0;
}
</style>