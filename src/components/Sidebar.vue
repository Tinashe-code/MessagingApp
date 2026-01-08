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
  <div class="w-85 border-r border-border flex h-screen">
    <!-- Navigation Icons -->
    <div class="w-18  flex flex-col items-center py-4 space-y-4 bg-amber-400">
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
    <div class="flex-1 flex flex-col">
      <div class="p-4">
        <h1 class="text-lg semibold">Tenant Chat</h1>
      </div>

      <div class="separator h-px bg-border"></div>

      <div class="p-4 flex-1">
        <h2 class=" mb-4">Messages</h2>
        <div class="h-full overflow-y-auto">
          <div class="space-y-1">
            <div
              v-for="conversation in conversations"
              :key="conversation.id"
              :class="[
                'flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent',
                selectedConversation === conversation.id ? 'bg-accent' : ''
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
                  class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"
                ></div>
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="font-medium truncate">{{ conversation.user.name }}</h3>
                  <span class="text-xs text-muted-foreground">{{ conversation.timestamp }}</span>
                </div>
                <p class="text-sm text-muted-foreground truncate">{{ conversation.lastMessage }}</p>
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

.separator {
  background-color: var(--border-color, #e5e7eb);
}

.avatar {
  flex-shrink: 0;
}

.badge {
  flex-shrink: 0;
}

.bg-accent {
  background-color: rgba(0, 0, 0, 0.05);
}

.hover\:bg-accent:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.text-muted-foreground {
  color: #6b7280;
}

.bg-muted\/30 {
  background-color: rgba(0, 0, 0, 0.03);
}

.border-border {
  border-color: #e5e7eb;
}
</style>