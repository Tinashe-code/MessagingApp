<script setup>
import { MessageCircle, Phone, Settings, Archive, Bookmark } from 'lucide-vue-next'

const props = defineProps({
  selectedConversation: String,
  conversations: Array,
  onSelectConversation: Function
})

const emit = defineEmits(['select-conversation'])

const handleConversationClick = (id) => {
  emit('select-conversation', id)
}
</script>

<template>
  <div class="w-full md:w-85 border-r border-border flex h-screen">
    <!-- Navigation Icons - Hidden on mobile -->
    <div class="hidden md:flex w-18 flex-col items-center py-4 space-y-4 bg-amber-400">
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

<!-- mobile  -->
 <!-- Mobile: Horizontal bottom navigation -->
    <!-- <div class="flex md:hidden fixed  bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 justify-around items-center z-50">
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
    </div> -->
    <!-- Main Sidebar Content -->
    <div class="flex-1 flex flex-col w-full">
      <!-- Mobile header -->
      <div class="p-4 border-b border-border bg-white md:bg-transparent">
        <h1 class="text-lg font-semibold">Tenant Chat</h1>
      </div>

      <div class="p-4 flex-1">
        <h2 class="mb-4 text-gray-600">Messages</h2>
        <div class="h-full overflow-y-auto">
          <div class="space-y-1">
            <div
              v-for="conversation in conversations"
              :key="conversation.id"
              :class="[
                'flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 active:bg-gray-200',
                selectedConversation === conversation.id ? 'bg-gray-100' : ''
              ]"
              @click="handleConversationClick(conversation.id)"
            >
              <div class="relative">
                <div class="avatar w-12 h-12 rounded-full overflow-hidden">
                  <img :src="conversation.user.avatar" :alt="conversation.user.name" class="w-full h-full object-cover" />
                  <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                    {{ conversation.user.name[0] }}
                  </div>
                </div>
                <div 
                  v-if="conversation.user.isOnline" 
                  class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
                ></div>
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="font-medium truncate">{{ conversation.user.name }}</h3>
                  <span class="text-xs text-gray-500">{{ conversation.timestamp }}</span>
                </div>
                <p class="text-sm text-gray-600 truncate">{{ conversation.lastMessage }}</p>
              </div>
              
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

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.btn-mobile-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;
}

.separator {
  background-color: var(--border-color, #e5e7eb);
}

.avatar {
  flex-shrink: 0;
}

.badge {
  flex-shrink: 0;
}

/* Add safe area for iPhone X and newer */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .fixed.bottom-0 {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>