<script setup>
import { Phone, Video, MoreVertical, Paperclip, Send, Smile, ChevronLeft, Check, CheckCheck, X, Play, FileText, File, Music } from 'lucide-vue-next'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import socketService from '@/services/socket'
import { v4 as uuidv4 } from 'uuid'

const chatStore = useChatStore()
const emit = defineEmits(['back', 'send-message', 'typing'])

const props = defineProps({
  conversationId: String,
  chatPartner: Object,
  messages: Array,
  currentUser: Object,
  isMobile: Boolean,
  typingUsers: Array
})

// Message input state
const newMessage = ref('')
const showAttachmentOptions = ref(false)
const selectedFiles = ref([])
const fileInputRef = ref(null)
const attachmentMenuRef = ref(null)

// Typing indicator
let typingTimeout = null
const localTyping = ref(false)

const isSendDisabled = computed(() => {
  return newMessage.value.trim() === '' && selectedFiles.value.length === 0
})

const handleBack = () => {
  emit('back')
}

// const handleTyping = () => {
//   emit('typing')
// }

const handleTyping = () => {
  if (!props.conversationId) return

  emit('typing', {
    conversationId: props.conversationId
  })
}


const handleKeyPress = (event) => {
  handleTyping()
  
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (!isSendDisabled.value) {
      handleSendMessage()
    }
  }
}



// const handleSendMessage = () => {
//   if (isSendDisabled.value) return
  
//   // Handle text message
//   const tempId = uuidv4()
//   const now = new Date().toISOString()

//   if (newMessage.value.trim() !== '') {
//      chatStore.addOptimisticMessage(chatStore.activeConversationId, {
//     id: tempId,
//     conversation_id: chatStore.activeConversationId,
//     sender_uuid: props.currentUser.uuid, // optional
//     text_content: newMessage.value.trim(),
//     created_at: now,
//     message_type: "text",
//     status: 'SENDING',
//     tenant_id: "22222222-2222-2222-2222-222222222222",
//     optimistic: true
//   })

//     emit('send-message', {
//       type: 'text',
//       text: newMessage.value.trim()
//     })
//     newMessage.value = ''
//   }
  
//   // Handle file attachments
//   if (selectedFiles.value.length > 0) {
//     // For each file, you'll need to:
//     // 1. Get upload URL from backend
//     // 2. Upload to S3
//     // 3. Send message with file metadata
    
//     selectedFiles.value.forEach(async (file) => {
//       try {
//         // Request upload URL from backend
//         const uploadResponse = await fetch('/api/media/upload-url', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             fileName: file.name,
//             fileType: file.type,
//             fileSize: file.size
//           })
//         })
        
//         const { uploadUrl, fileUrl } = await uploadResponse.json()
        
//         // Upload to S3
//         await fetch(uploadUrl, {
//           method: 'PUT',
//           body: file,
//           headers: {
//             'Content-Type': file.type
//           }
//         })
        
//         // Send message with file metadata
//         emit('send-message', {
//           type: getFileType(file),
//           media: {
//             fileUrl: fileUrl,
//             fileName: file.name,
//             mimeType: file.type,
//             fileSize: file.size
//           }
//         })
//       } catch (error) {
//         console.error('File upload failed:', error)
//       }
//     })
    
//     selectedFiles.value = []
//   }
  
//   showAttachmentOptions.value = false
// }


const handleSendMessage = () => {
  if (isSendDisabled.value) return

  const requestId = uuidv4()
  const now = new Date().toISOString()

  console.log('📤 HANDLE SEND MESSAGE', { requestId })

  // ───────────────── TEXT MESSAGE ─────────────────
  if (newMessage.value.trim() !== '') {
    chatStore.addOptimisticMessage(chatStore.activeConversationId, {
      id: requestId, // 🔥 IMPORTANT: SAME AS requestId
      conversation_id: chatStore.activeConversationId,
      sender_uuid: props.currentUser.uuid,
      text_content: newMessage.value.trim(),
      created_at: now,
      message_type: 'text',
      status: 'SENDING',
      tenant_id: '22222222-2222-2222-2222-222222222222',
      optimistic: true
    })

    emit('send-message', {
      requestId, // 🔥 SEND IT UP
      type: 'text',
      text: newMessage.value.trim()
    })

    newMessage.value = ''
  }

  // ───────────────── FILE ATTACHMENTS ─────────────────
  if (selectedFiles.value.length > 0) {
    selectedFiles.value.forEach(async (file) => {
      try {
        const uploadResponse = await fetch('/api/media/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          })
        })

        const { uploadUrl, fileUrl } = await uploadResponse.json()

        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        })

        emit('send-message', {
          requestId, // 🔥 SAME requestId
          type: getFileType(file),
          media: {
            fileUrl,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size
          }
        })
      } catch (error) {
        console.error('❌ File upload failed:', error)
      }
    })

    selectedFiles.value = []
  }

  showAttachmentOptions.value = false
}




// File handling helpers
const getFileType = (file) => {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'document'
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value.push(...files)
  event.target.value = ''
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

// Message status helper
const getStatusIndicator = (message) => {
  const status = message.status || 'sent'
  
  switch (status) {
    case 'sent':
      return {
        icon: Check,
        color: 'text-gray-400',
        showSingle: true
      }
    case 'delivered':
      return {
        icon: CheckCheck,
        color: 'text-gray-400',
        showSingle: false
      }
    case 'read':
      return {
        icon: CheckCheck,
        color: 'text-blue-600',
        showSingle: false
      }
    default:
      return {
        icon: Check,
        color: 'text-gray-400',
        showSingle: true
      }
  }
}

// Format time from backend timestamp
const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Check if message is from current user
const isMyMessage = (message) => {
  // console.log('CURRENT USER:', props.currentUser)
  return message.sender_uuid === props.currentUser?.uuid
}

// Get message content for display
const getMessageContent = (message) => {
  // console.log('GETTING MESSAGE CONTENT FOR:', message)
  if (message.message_type === 'text') {
    // console.log('MESSAGE TEXT:')
    return message.text_content || ''
  } else if (message.media) {
    // For media messages, show a preview
    switch (message.type) {
      case 'image': return '📷 Image'
      case 'video': return '🎥 Video'
      case 'audio': return '🎵 Audio'
      case 'document': return '📄 Document'
      default: return 'File'
    }
  }
  return ''
}
</script>

<template>
  <div class="flex-1 flex flex-col h-full w-full relative">
    <!-- Chat Header -->
    <div v-if="conversationId" class="flex items-center justify-between p-4 border-b border-border bg-white">
      <div class="flex items-center space-x-3">
        <!-- Back button for mobile -->
        <button v-if="isMobile" @click="handleBack" class="btn-ghost p-2 -ml-2">
          <ChevronLeft class="w-5 h-5" />
        </button>

        <div class="relative">
          <!-- Conversation avatar - you'll need to implement based on your data -->
          <div class="avatar w-10 h-10 rounded-full overflow-hidden relative bg-blue-100">
            <div class="w-full h-full flex items-center justify-center text-blue-600 font-semibold">
              {{ currentUser?.name?.[0] || 'U' }}
            </div>
          </div>
        </div>
        <div>
          <!-- <h3 class="font-semibold">{{ currentUser?.name || 'User' }}</h3> -->
          <h3 class="font-semibold">{{ chatPartner?.name || 'User' }}</h3>
          <!-- Typing indicator -->
          <p v-if="typingUsers && typingUsers.length > 0" class="text-sm text-green-600">
            typing...
          </p>
          <p v-else class="text-sm text-muted-foreground">
            {{ currentUser?.isOnline ? 'Online' : 'Offline' }}
          </p>
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
    <div class="flex-1 p-4 overflow-y-auto bg-gray-50">
      <div class="space-y-4">
        <div v-for="message in messages" :key="message.id" :class="[
          'flex items-end space-x-2',
          isMyMessage(message) ? 'justify-end' : 'justify-start'
        ]">
          <!-- Other user's avatar -->
          <div v-if="!isMyMessage(message)" class="avatar w-8 h-8 rounded-full overflow-hidden">
            <div class="w-full h-full bg-gray-200 flex items-center justify-center">
              {{ message.senderName?.[0] || 'U' }}
            </div>
          </div>

          <div :class="[
            'max-w-[80%] sm:max-w-xs lg:max-w-md',
            isMyMessage(message) ? 'order-1' : ''
          ]">
            <!-- Text Message -->
            <div v-if="message.message_type === 'text'" :class="[
              'px-4 py-2 rounded-2xl relative min-w-20',
              isMyMessage(message)
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-white rounded-bl-md shadow-sm'
            ]">
              <p class="pr-6 mb-4">{{ getMessageContent(message) }}</p>

              <!-- Timestamp and status -->
              <div :class="[
                'absolute bottom-1 right-2 flex items-center',
                isMyMessage(message) ? 'text-white/70' : 'text-gray-600'
              ]">
                <span class="text-[10px] mr-1">{{ formatMessageTime(message.created_at) }}</span>
                
                <!-- Status indicator for my messages -->
                <div v-if="isMyMessage(message)">
                  <component 
                    v-if="getStatusIndicator(message).showSingle"
                    :is="getStatusIndicator(message).icon"
                    :class="['w-3 h-3', getStatusIndicator(message).color]" 
                  />
                  <div v-else class="relative">
                    <component 
                      :is="getStatusIndicator(message).icon"
                      :class="['w-3 h-3', getStatusIndicator(message).color]" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Media Messages (simplified for backend integration) -->
            <div v-else-if="message.media" class="rounded-2xl overflow-hidden relative">
              <!-- You'll need to implement media display based on your backend URLs -->
              <div class="bg-gray-100 p-4 rounded-lg">
                <div class="flex items-center space-x-3">
                  <component :is="getFileIcon(message.type)" class="w-8 h-8 text-gray-400" />
                  <div>
                    <p class="font-medium">{{ message.media.fileName || 'File' }}</p>
                    <p class="text-xs text-gray-500">{{ message.type }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Status indicator for media messages -->
              <div v-if="isMyMessage(message)" class="absolute bottom-2 right-2 bg-black/50 rounded-full p-1">
                <div class="flex items-center">
                  <span class="text-[10px] text-white/90 mr-1">{{ formatMessageTime(message.createdAt) }}</span>
                  <component 
                    :is="getStatusIndicator(message).icon"
                    class="w-3 h-3 text-white" 
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- My avatar -->
          <div v-if="isMyMessage(message)" class="avatar w-8 h-8 rounded-full overflow-hidden order-2">
            <img :src="currentUser?.avatar" alt="Me" class="w-full h-full object-cover" />
            <div v-if="!currentUser?.avatar" class="w-full h-full bg-gray-200 flex items-center justify-center">
              {{ currentUser?.name?.[0] || 'M' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="p-4 border-t border-border bg-white">
      <div class="flex items-center space-x-2">
        <!-- File attachment -->
        <div class="relative">
          <button @click="showAttachmentOptions = !showAttachmentOptions" class="btn-ghost p-2 rounded-full hover:bg-gray-100">
            <Paperclip class="w-5 h-5" />
          </button>
          
          <!-- Attachment options -->
          <div v-if="showAttachmentOptions" class="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border p-2 z-10">
            <button @click="triggerFileInput" class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded w-full">
              <File class="w-4 h-4" />
              <span>Document</span>
            </button>
            <input 
              ref="fileInputRef"
              type="file"
              multiple
              @change="handleFileSelect"
              class="hidden"
            />
          </div>
        </div>
        
        <!-- Message input -->
        <div class="flex-1 relative">
          <input 
            type="text"
            v-model="newMessage"
            @keypress="handleKeyPress"
            @input="handleTyping"
            placeholder="Write a message..."
            class="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-gray-100"
          />
          <button class="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 btn-ghost p-0 rounded-full">
            <Smile class="w-4 h-4" />
          </button>
        </div>
        
        <!-- Send button -->
        <button 
          @click="handleSendMessage" 
          :disabled="isSendDisabled"
          :class="[
            'p-2 rounded-full transition-colors',
            isSendDisabled 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
          ]"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Selected files preview -->
      <div v-if="selectedFiles.length > 0" class="mt-2">
        <div class="flex flex-wrap gap-2">
          <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
            <span class="text-sm truncate max-w-xs">{{ file.name }}</span>
            <button @click="removeFile(index)" class="text-red-500">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
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

.avatar {
  flex-shrink: 0;
}
</style>



<!-- async function SendMessage(text) {
  if (!chatStore.activeConversationId) return

  const tempId = uuidv4()
  const now = new Date().toISOString()

  // 🔥 1. OPTIMISTIC MESSAGE
  chatStore.addOptimisticMessage(chatStore.activeConversationId, {
    id: tempId,
    conversation_id: chatStore.activeConversationId,
    sender_id: props.currentUser, // optional
    text_content: newMessage.value.trim(),
    createdAt: now,
    status: 'SENDING',
    optimistic: true
  })
  newMessage.value = ''

  // 🔥 2. SEND TO SOCKET
  socketService.emit('message.send', {
    requestId: tempId,
    payload: {
      conversationId: chatStore.activeConversationId,
      content: {
        type: 'text',
        text
      }
    }
  })
} -->