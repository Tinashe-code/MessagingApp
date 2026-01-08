<script setup>
import { ref, computed, watch } from 'vue'
import ChatArea from './ChatArea.vue'
import Sidebar from './Sidebar.vue'
import { MessageCircle, Phone, Settings, Archive, Bookmark } from 'lucide-vue-next'

// Mock data moved here
const mockUsers = [
  { id: "1", name: "Bankaii", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face", isOnline: true },
  { id: "2", name: "Karen", avatar: "https://images.unsplash.com/photo-1494790108755-2616b96d113c?w=40&h=40&fit=crop&crop=face", isOnline: true },
  { id: "3", name: "Elena", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face", isOnline: true },
  { id: "4", name: "Aleck", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face", isOnline: true },
  { id: "5", name: "Runy", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face", isOnline: true },
]

const mockConversations = [
  {
    id: "1",
    userId: "1",
    lastMessage: "I'm quite tired!",
    timestamp: "12:38 AM",
    unreadCount: 0,
  },
  {
    id: "2", 
    userId: "2",
    lastMessage: "Nice Clifton yo Fredric",
    timestamp: "12:38 AM",
    unreadCount: 1,
  },
  {
    id: "3",
    userId: "3", 
    lastMessage: "Yes",
    timestamp: "8:32 AM",
    unreadCount: 0,
  },
  {
    id: "4",
    userId: "4",
    lastMessage: "Hey let's meet at the...",
    timestamp: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "5",
    userId: "4",
    lastMessage: "Morning is magical",
    timestamp: "Yesterday", 
    unreadCount: 0,
  },
  {
    id: "6",
    userId: "paper",
    lastMessage: "2nd place is great lol",
    timestamp: "Yesterday",
    unreadCount: 1,
  },
  {
    id: "7",
    userId: "5",
    lastMessage: "Hi Karen!",
    timestamp: "Yesterday",
    unreadCount: 0,
  },
]

// Message data for each conversation
import exampleImage from '../assets/3R6A0573.JPG'

const mockMessages = {
   "1": [
    {
      id: "1",
      senderId: "other",
      content: "Man, when you'll book a plan ticket?",
      timestamp: "09:07 AM",
      type: "text",
    },
    {
      id: "2", 
      senderId: "me",
      content: "I'm quite tired",
      timestamp: "09:26 AM",
      type: "text",
      status: "read" // Options: 'sent', 'delivered', 'read'
    },
    {
      id: "3",
      senderId: "me", 
      content: "Hey, we go back in 10!",
      timestamp: "09:26 AM",
      type: "text",
      status: "read"
    },
    {
      id: "4",
      senderId: "other",
      content: "Ok!",
      timestamp: "09:31 AM", 
      type: "text",
    },
    {
      id: "5",
      senderId: "me",
      content: "Sure, I've bought the tickets",
      timestamp: "10:40 AM",
      type: "text",
      status: "delivered"
    },
    {
      id: "6",
      senderId: "me",
      content: "",
      timestamp: "10:40 AM",
      type: "image",
      imageUrl: exampleImage,
      status: "sent"
    },
  ],
  "2": [
    {
      id: "1",
      senderId: "other",
      content: "Hello from Karen!",
      timestamp: "11:00 AM",
      type: "text",
    },
    {
      id: "2", 
      senderId: "me",
      content: "Hi Karen!",
      timestamp: "11:05 AM",
      type: "text",
    },
  ],
  "3": [
    {
      id: "1",
      senderId: "other",
      content: "Hi from Elena!",
      timestamp: "10:00 AM",
      type: "text",
    },
  ],
  "4": [
    {
      id: "1",
      senderId: "other",
      content: "Meeting time?",
      timestamp: "09:00 AM",
      type: "text",
    },
  ],
  "5": [
    {
      id: "1",
      senderId: "other",
      content: "Good morning!",
      timestamp: "07:00 AM",
      type: "text",
    },
  ],
  "6": [
    {
      id: "1",
      senderId: "other",
      content: "We got 2nd place!",
      timestamp: "06:00 PM",
      type: "text",
    },
  ],
  "7": [
    {
      id: "1",
      senderId: "other",
      content: "Tokyo is amazing!",
      timestamp: "03:00 PM",
      type: "text",
    },
     {
      id: "2", 
      senderId: "me",
      content: "Hi Karen!",
      timestamp: "11:05 AM",
      type: "text",
    },
  ],
}

// Special users (like PAPER REX)
const specialUsers = {
  "paper": { 
    id: "paper", 
    name: "PAPER REX", 
    avatar: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=40&h=40&fit=crop&crop=face", 
    isOnline: false 
  }
}

const selectedConversation = ref(null)
const isMobile = ref(false)
const showChatArea = ref(false) // For mobile: controls if chat area is visible

// Check screen size on mount and resize
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768 // 768px is typical md breakpoint
  if (isMobile.value && !selectedConversation.value) {
    showChatArea.value = false
  }
}

// On component mount
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// Watch for conversation changes on mobile - FIXED
watch(selectedConversation, (newValue, oldValue) => {
  if (isMobile.value && newValue && newValue !== oldValue) {
    showChatArea.value = true
  }
})

// Get the current conversation user
const currentConversationUser = computed(() => {
  const conversation = mockConversations.find(c => c.id === selectedConversation.value)
  if (!conversation) return null
  
  // Check if it's a special user or regular user
  if (conversation.userId in specialUsers) {
    return specialUsers[conversation.userId]
  }
  
  return mockUsers.find(user => user.id === conversation.userId) || mockUsers[0]
})

// Get messages for selected conversation
const currentMessages = computed(() => {
  return mockMessages[selectedConversation.value] || []
})

const handleSelectConversation = (id) => {
  // Store previous value to compare
  const previousValue = selectedConversation.value
  
  // If clicking the same conversation on mobile, toggle chat area
  if (isMobile.value && id === previousValue) {
    showChatArea.value = !showChatArea.value
  } else {
    // Different conversation or desktop
    selectedConversation.value = id
    if (isMobile.value) {
      showChatArea.value = true
    }
  }
}

const handleBackToSidebar = () => {
  // Don't clear selectedConversation, just hide chat area
  showChatArea.value = false
}

// Prepare conversation data for sidebar
const conversationData = computed(() => {
  return mockConversations.map(conversation => {
    let user
    if (conversation.userId in specialUsers) {
      user = specialUsers[conversation.userId]
    } else {
      user = mockUsers.find(u => u.id === conversation.userId) || mockUsers[0]
    }
    
    return {
      id: conversation.id,
      user: user,
      lastMessage: conversation.lastMessage,
      timestamp: conversation.timestamp,
      unreadCount: conversation.unreadCount
    }
  })
})

const handleSendMessage = (message) => {
  // Add the new message to the current conversation
  if (mockMessages[selectedConversation.value]) {
    mockMessages[selectedConversation.value].push(message)
  }
  
  // Update the conversation's last message
  const conversation = mockConversations.find(c => c.id === selectedConversation.value)
  if (conversation) {
    conversation.lastMessage = message.type === 'text' 
      ? message.content 
      : message.type === 'image' 
        ? '📷 Image' 
        : message.type === 'video'
          ? '🎥 Video'
          : message.type === 'audio'
            ? '🎵 Audio'
            : '📄 Document'
    conversation.timestamp = message.timestamp
  }
}
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
        :conversations="conversationData"
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
      <!-- <ChatArea 
        :conversation-id="selectedConversation"
        :messages="currentMessages"
        :current-user="currentConversationUser"
        :is-mobile="isMobile"
        @back="handleBackToSidebar"
      /> -->

       <ChatArea 
    :conversation-id="selectedConversation"
    :messages="currentMessages"
    :current-user="currentConversationUser"
    :is-mobile="isMobile"
    @back="handleBackToSidebar"
    @send-message="handleSendMessage"
  />
    </div>

    <!-- MOBILE BOTTOM NAVIGATION - ONLY SHOWN WHEN SIDEBAR IS VISIBLE -->
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