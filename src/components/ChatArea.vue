




<script setup>
import { Phone, Video, MoreVertical, Paperclip, Send, Smile } from 'lucide-vue-next'

const props = defineProps({
  conversationId: String,
  messages: Array,
  currentUser: Object
})

const myAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
</script>

<template>
  <div class="flex-1 flex flex-col bg-amber-300 h-full">
    <!-- Chat Header -->
    <div v-if="currentUser" class="flex items-center justify-between p-4 border-b border-border">
      <div class="flex items-center space-x-3">
        <div class="relative">
          <div class="avatar w-10 h-10 rounded-full overflow-hidden relative">
            <img :src="currentUser.avatar" :alt="currentUser.name" class="w-full h-full object-cover" />
            <div v-if="!currentUser.avatar" class="w-full h-full bg-gray-200 flex items-center justify-center">
              {{ currentUser.name[0] }}
            </div>
          </div>
          <div 
            v-if="currentUser.isOnline" 
            class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"
          ></div>
        </div>
        <div>
          <h3 class="font-semibold">{{ currentUser.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ currentUser.isOnline ? 'Online' : 'Offline' }}</p>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button class="btn-ghost p-2 rounded-full hover:bg-gray-100">
          <Phone class="w-5 h-5" />
        </button>
        <button class="btn-ghost p-2 rounded-full hover:bg-gray-100">
          <Video class="w-5 h-5" />
        </button>
        <button class="btn-ghost p-2 rounded-full hover:bg-gray-100">
          <MoreVertical class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Messages Area -->
    <div class="flex-1 p-4 overflow-y-auto">
      <div class="space-y-4">
        <!-- Date separator -->
        <div class="flex justify-center">
          <span class="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            27 December 2024
          </span>
        </div>

        <div v-for="message in messages" :key="message.id"
          :class="[
            'flex items-end space-x-2',
            message.senderId === 'me' ? 'justify-end' : 'justify-start'
          ]"
        >
          <!-- Other user's avatar -->
          <div v-if="message.senderId === 'other' && currentUser" class="avatar w-8 h-8 rounded-full overflow-hidden">
            <img :src="currentUser.avatar" :alt="currentUser.name" class="w-full h-full object-cover" />
            <div v-if="!currentUser.avatar" class="w-full h-full bg-gray-200 flex items-center justify-center">
              {{ currentUser.name[0] }}
            </div>
          </div>
          
          <div :class="[
            'max-w-xs lg:max-w-md',
            message.senderId === 'me' ? 'order-1' : ''
          ]">
            <!-- Text Message -->
            <div v-if="message.type === 'text'"
              :class="[
                'px-4 py-2 rounded-2xl',
                message.senderId === 'me'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-muted rounded-bl-md'
              ]"
            >
              <p>{{ message.content }}</p>
            </div>
            
            <!-- Image Message -->
            <div v-else class="rounded-2xl overflow-hidden">
              <img 
                v-if="message.imageUrl" 
                :src="message.imageUrl" 
                alt="Shared image"
                class="w-64 h-auto"
              />
            </div>
            
            <!-- Message timestamp and read status -->
            <div :class="[
              'flex items-center mt-1 space-x-1',
              message.senderId === 'me' ? 'justify-end' : 'justify-start'
            ]">
              <span class="text-xs text-muted-foreground">{{ message.timestamp }}</span>
              <div v-if="message.senderId === 'me'" class="avatar w-4 h-4 rounded-full overflow-hidden">
                <img :src="myAvatar" alt="Me" class="w-full h-full object-cover" />
                <div v-if="!myAvatar" class="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                  M
                </div>
              </div>
            </div>
          </div>
          
          <!-- My avatar -->
          <div v-if="message.senderId === 'me'" class="avatar w-8 h-8 rounded-full overflow-hidden order-2">
            <img :src="myAvatar" alt="Me" class="w-full h-full object-cover" />
            <div v-if="!myAvatar" class="w-full h-full bg-gray-200 flex items-center justify-center">
              ME
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="p-4 border-t border-border">
      <div class="flex items-center space-x-2">
        <button class="btn-ghost p-2 rounded-full hover:bg-gray-100">
          <Paperclip class="w-5 h-5" />
        </button>
        
        <div class="flex-1 relative">
          <input 
            type="text"
            placeholder="Write a message..."
            class="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <button 
            class="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 btn-ghost p-0 rounded-full"
          >
            <Smile class="w-4 h-4" />
          </button>
        </div>
        
        <button class="btn-primary p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600">
          <Send class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-ghost {
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.avatar {
  flex-shrink: 0;
}
</style>