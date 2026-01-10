<script setup>
import { Phone, Video, MoreVertical, Paperclip, Send, Smile, ChevronLeft, Check, CheckCheck, X, Play, FileText, File, Music } from 'lucide-vue-next'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['back', 'send-message'])

const myAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"

const props = defineProps({
  conversationId: String,
  messages: Array,
  currentUser: Object,
  isMobile: Boolean
})

// Attachment state
const showAttachmentOptions = ref(false)
const selectedFiles = ref([])
const fileInputRef = ref(null)
const newMessage = ref('')
const showMediaPreview = ref(false)
const previewMedia = ref(null)
const attachmentMenuRef = ref(null)

// File type detection
const fileTypes = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  audio: ['mp3', 'wav', 'ogg', 'm4a'],
  document: ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx']
}

// Check if send button should be disabled
const isSendDisabled = computed(() => {
  return newMessage.value.trim() === '' && selectedFiles.value.length === 0
})

// Close attachment menu when clicking outside
const handleClickOutside = (event) => {
  if (attachmentMenuRef.value && !attachmentMenuRef.value.contains(event.target)) {
    // Check if click is on paperclip button
    const paperclipButton = event.target.closest('.paperclip-button') || 
                           event.target.closest('button')?.querySelector('.paperclip-button')
    
    if (!paperclipButton) {
      showAttachmentOptions.value = false
    }
  }
}

// Close attachment menu when switching conversations
watch(() => props.conversationId, () => {
  showAttachmentOptions.value = false
  selectedFiles.value = []
  showMediaPreview.value = false
  previewMedia.value = null
  newMessage.value = ''
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const getFileType = (file) => {
  const extension = file.name.split('.').pop().toLowerCase()
  
  for (const [type, extensions] of Object.entries(fileTypes)) {
    if (extensions.includes(extension)) {
      return type
    }
  }
  return 'document' // default
}

const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'image': return File
    case 'video': return Play
    case 'audio': return Music
    case 'document': return FileText
    default: return File
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleBack = () => {
  // Reset attachment state when going back
  showAttachmentOptions.value = false
  selectedFiles.value = []
  showMediaPreview.value = false
  previewMedia.value = null
  newMessage.value = ''
  emit('back')
}

const toggleAttachmentOptions = (event) => {
  event.stopPropagation()
  showAttachmentOptions.value = !showAttachmentOptions.value
}

const triggerFileInput = (event) => {
  event.stopPropagation()
  fileInputRef.value?.click()
  showAttachmentOptions.value = false
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  
  files.forEach(file => {
    const fileType = getFileType(file)
    const fileObj = {
      file: file,
      type: fileType,
      preview: null,
      name: file.name,
      size: formatFileSize(file.size)
    }
    
    // Generate preview for images and videos
    if (fileType === 'image' || fileType === 'video') {
      const reader = new FileReader()
      reader.onload = (e) => {
        fileObj.preview = e.target.result
      }
      reader.readAsDataURL(file)
    }
    
    selectedFiles.value.push(fileObj)
  })
  
  // Clear file input
  event.target.value = ''
  
  if (selectedFiles.value.length > 0) {
    showMediaPreview.value = true
  }
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
  if (selectedFiles.value.length === 0) {
    showMediaPreview.value = false
  }
}

const openMediaPreview = (file) => {
  if (file.type === 'image' || file.type === 'video') {
    previewMedia.value = file
  }
}

const closeMediaPreview = () => {
  previewMedia.value = null
}

const handleSendMessage = () => {
  if (isSendDisabled.value) return
  
  // Create message object for files
  if (selectedFiles.value.length > 0) {
    selectedFiles.value.forEach(file => {
      const message = {
        id: Date.now().toString() + Math.random(),
        senderId: 'me',
        content: file.type === 'image' ? '' : `Sent a ${file.type} file: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: file.type,
        status: 'sent',
        fileData: file
      }
      
      // Emit to parent
      emit('send-message', message)
    })
  }
  
  // Create message object for text
  if (newMessage.value.trim() !== '') {
    const textMessage = {
      id: Date.now().toString() + Math.random(),
      senderId: 'me',
      content: newMessage.value,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      status: 'sent'
    }
    
    emit('send-message', textMessage)
  }
  
  // Reset
  newMessage.value = ''
  selectedFiles.value = []
  showMediaPreview.value = false
  showAttachmentOptions.value = false
}

const handleKeyPress = (event) => {
  // Check if Enter is pressed without Shift
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // Prevent new line in input
    if (!isSendDisabled.value) {
      handleSendMessage()
    }
  }
}

// Helper function to get status indicator
const getStatusIndicator = (message) => {
  const status = message.status || 'sent'

  switch (status) {
    case 'sent':
      return {
        icon: Check,
        color: 'text-gray-400',
        text: 'Sent',
        showSingle: true
      }
    case 'delivered':
      return {
        icon: CheckCheck,
        color: 'text-gray-400',
        text: 'Delivered',
        showSingle: false
      }
    case 'read':
      return {
        icon: CheckCheck,
        color: 'text-red-700',
        text: 'Read',
        showSingle: false
      }
    default:
      return {
        icon: Check,
        color: 'text-gray-400',
        text: 'Sent',
        showSingle: true
      }
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col h-full w-full relative">
    <!-- Media Preview Modal -->
    <div v-if="previewMedia" class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div class="relative max-w-4xl max-h-[90vh] w-full">
        <button @click="closeMediaPreview" class="absolute -top-10 right-0 text-white p-2">
          <X class="w-6 h-6" />
        </button>
        
        <div v-if="previewMedia.type === 'image'" class="flex items-center justify-center h-full">
          <img :src="previewMedia.preview" :alt="previewMedia.name" class="max-w-full max-h-[80vh] object-contain" />
        </div>
        
        <div v-if="previewMedia.type === 'video'" class="flex items-center justify-center h-full">
          <video :src="previewMedia.preview" controls class="max-w-full max-h-[80vh]">
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div class="mt-4 text-white text-center">
          <p class="font-medium">{{ previewMedia.name }}</p>
          <p class="text-sm opacity-80">{{ previewMedia.size }}</p>
        </div>
      </div>
    </div>

    <!-- Chat Header -->
    <div v-if="currentUser" class="flex items-center justify-between p-4 border-b border-border bg-white">
      <div class="flex items-center space-x-3">
        <!-- Back button for mobile -->
        <button v-if="isMobile" @click="handleBack" class="btn-ghost p-2 -ml-2">
          <ChevronLeft class="w-5 h-5" />
        </button>

        <div class="relative">
          <div class="avatar w-10 h-10 rounded-full overflow-hidden relative">
            <img :src="currentUser.avatar" :alt="currentUser.name" class="w-full h-full object-cover" />
            <div v-if="!currentUser.avatar" class="w-full h-full bg-gray-200 flex items-center justify-center">
              {{ currentUser.name[0] }}
            </div>
          </div>
          <div v-if="currentUser.isOnline"
            class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
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
    <div class="flex-1 p-4 overflow-y-auto bg-gray-50">
      <div class="space-y-4">
        <!-- Date separator -->
        <div class="flex justify-center">
          <span class="text-xs text-muted-foreground bg-gray-200 px-3 py-1 rounded-full">
            27 December 2024
          </span>
        </div>

        <div v-for="message in messages" :key="message.id" :class="[
          'flex items-end space-x-2',
          message.senderId === 'me' ? 'justify-end' : 'justify-start'
        ]">
          <!-- Other user's avatar -->
          <div v-if="message.senderId === 'other' && currentUser" class="avatar w-8 h-8 rounded-full overflow-hidden">
            <img :src="currentUser.avatar" :alt="currentUser.name" class="w-full h-full object-cover" />
            <div v-if="!currentUser.avatar" class="w-full h-full bg-gray-200 flex items-center justify-center">
              {{ currentUser.name[0] }}
            </div>
          </div>

          <div :class="[
            'max-w-[80%] sm:max-w-xs lg:max-w-md',
            message.senderId === 'me' ? 'order-1' : ''
          ]">
            <!-- Text Message -->
            <div v-if="message.type === 'text'" :class="[
              'px-4 py-2 rounded-2xl relative min-w-20',
              message.senderId === 'me'
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-white rounded-bl-md shadow-sm'
            ]">
              <p class="pr-6 mb-4">{{ message.content }}</p>

              <div v-if="message.senderId === 'other'" class="absolute bottom-1 right-2 flex items-center">
<span class="text-[10px] text-black mr-1">{{ message.timestamp }}</span>
              </div>
              

              <!-- Status indicator for sent messages -->
              <div v-if="message.senderId === 'me'" class="absolute bottom-1 right-2 flex items-center">
                <span class="text-[10px] text-white/70 mr-1">{{ message.timestamp }}</span>
                <div v-if="getStatusIndicator(message).showSingle">
                  <component :is="getStatusIndicator(message).icon"
                    :class="['w-3 h-3', getStatusIndicator(message).color]" />
                </div>
                
                <div v-if="message.status === 'delivered'">
                  <component :is="getStatusIndicator(message).icon"
                    :class="['w-3 h-3', getStatusIndicator(message).color]" />
                </div>
                <div v-if="message.status === 'read'">
                  <component :is="getStatusIndicator(message).icon"
                    :class="['w-3 h-3', getStatusIndicator(message).color]" />
                </div>
              </div>
            </div>

            <!-- Image Message -->
            <div v-else-if="message.type === 'image'" class="rounded-2xl overflow-hidden relative">
              <img :src="message.imageUrl || message.fileData?.preview" alt="Shared image" class="w-full max-w-64 h-auto cursor-pointer" @click="openMediaPreview(message)" />

              <!-- Status indicator for image messages -->
              <div class="absolute bottom-2 right-2 bg-black/50 rounded-full p-1">
                <div class="flex items-center">
                  <span class="text-[10px] text-white/90 mr-1">{{ message.timestamp }}</span>
                  <div v-if="getStatusIndicator(message).showSingle">
                    <component :is="getStatusIndicator(message).icon" :class="['w-3 h-3 text-white']" />
                  </div>
                  <div v-else class="relative">
                    <component v-if="message.status==='read'" :is="getStatusIndicator(message).icon" :class="['w-3 h-3 text-white']" /> 
                    <component v-if="message.status==='delivered'" :is="getStatusIndicator(message).icon" :class="['w-3 h-3 text-white']" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Video Message -->
            <div v-else-if="message.type === 'video'" class="rounded-2xl overflow-hidden relative">
              <div class="relative">
                <video :src="message.fileData?.preview" class="w-full max-w-64 h-auto rounded-lg" controls>
                  Your browser does not support the video tag.
                </video>
                <div class="absolute bottom-2 right-2 bg-black/50 rounded-full p-1">
                  <div class="flex items-center">
                    <span class="text-[10px] text-white/90 mr-1">{{ message.timestamp }}</span>
                    <div v-if="getStatusIndicator(message).showSingle">
                      <component :is="getStatusIndicator(message).icon" :class="['w-3 h-3 text-white']" />
                    </div>
                    <div v-else class="relative">
                      <component v-if="message.status==='read'" :is="getStatusIndicator(message).icon" :class="['w-3 h-3 text-white']" /> 
                      <component v-if="message.status==='delivered'" :is="getStatusIndicator(message).icon" :class="['w-3 h-3 text-white']" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Audio Message -->
            <div v-else-if="message.type === 'audio'" :class="[
              'px-4 py-2 rounded-2xl relative',
              message.senderId === 'me'
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-white rounded-bl-md shadow-sm'
            ]">
              <div class="flex items-center space-x-3">
                <Music class="w-6 h-6" />
                <div class="flex-1">
                  <p class="font-medium">{{ message.fileData?.name || 'Audio file' }}</p>
                  <p class="text-xs opacity-80">{{ message.fileData?.size || '' }}</p>
                </div>
                <audio :src="message.fileData?.preview" controls class="w-32 h-8"></audio>
              </div>
              
              <div v-if="message.senderId === 'me'" class="absolute bottom-1 right-2 flex items-center">
                <span class="text-[10px] text-white/70 mr-1">{{ message.timestamp }}</span>
                <div v-if="getStatusIndicator(message).showSingle">
                  <component :is="getStatusIndicator(message).icon" :class="['w-3 h-3', getStatusIndicator(message).color]" />
                </div>
                <div v-else>
                  <component :is="getStatusIndicator(message).icon" :class="['w-3 h-3', getStatusIndicator(message).color]" />
                </div>
              </div>
            </div>

            <!-- Document Message -->
            <div v-else-if="message.type === 'document'" :class="[
              'px-4 py-2 rounded-2xl relative',
              message.senderId === 'me'
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-white rounded-bl-md shadow-sm'
            ]">
              <div class="flex items-center space-x-3">
                <FileText class="w-8 h-8" />
                <div class="flex-1">
                  <p class="font-medium truncate">{{ message.fileData?.name || 'Document' }}</p>
                  <p class="text-xs opacity-80">{{ message.fileData?.size || '' }}</p>
                </div>
              </div>
              
              <div v-if="message.senderId === 'me'" class="absolute bottom-1 right-2 flex items-center">
                <span class="text-[10px] text-white/70 mr-1">{{ message.timestamp }}</span>
                <div v-if="getStatusIndicator(message).showSingle">
                  <component :is="getStatusIndicator(message).icon" :class="['w-3 h-3', getStatusIndicator(message).color]" />
                </div>
                <div v-else>
                  <component :is="getStatusIndicator(message).icon" :class="['w-3 h-3', getStatusIndicator(message).color]" />
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

    <!-- Attachment Options -->
    <div v-if="showAttachmentOptions" ref="attachmentMenuRef" class="absolute bottom-16 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-40">
      <div class="grid grid-cols-2 gap-2">
        <button @click="triggerFileInput" class="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <File class="w-6 h-6 text-blue-500 mb-1" />
          <span class="text-xs">Document</span>
        </button>
        <button @click="triggerFileInput" class="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <Music class="w-6 h-6 text-green-500 mb-1" />
          <span class="text-xs">Audio</span>
        </button>
        <button @click="triggerFileInput" class="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <Play class="w-6 h-6 text-purple-500 mb-1" />
          <span class="text-xs">Video</span>
        </button>
        <button @click="triggerFileInput" class="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <File class="w-6 h-6 text-red-500 mb-1" />
          <span class="text-xs">Image</span>
        </button>
      </div>
    </div>

    <!-- File Preview Section -->
    <div v-if="showMediaPreview && selectedFiles.length > 0" class="border-t border-gray-200 bg-white p-3">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-medium text-sm">Attachments ({{ selectedFiles.length }})</h4>
        <button @click="showMediaPreview = false" class="text-gray-500 hover:text-gray-700">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <div v-for="(file, index) in selectedFiles" :key="index" class="relative group">
          <div class="border rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
            <div v-if="file.type === 'image'" class="w-16 h-16 relative">
              <img :src="file.preview" :alt="file.name" class="w-full h-full object-cover rounded" @click="openMediaPreview(file)" />
            </div>
            <div v-else-if="file.type === 'video'" class="w-16 h-16 relative">
              <video :src="file.preview" class="w-full h-full object-cover rounded" @click="openMediaPreview(file)">
                Your browser does not support the video tag.
              </video>
              <Play class="absolute inset-0 m-auto w-6 h-6 text-white" />
            </div>
            <div v-else class="w-16 h-16 flex items-center justify-center">
              <component :is="getFileIcon(file.type)" class="w-8 h-8 text-gray-400" />
            </div>
            <button @click="removeFile(index)" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              <X class="w-3 h-3" />
            </button>
            <div class="mt-1 text-xs text-gray-600 truncate" :title="file.name">{{ file.name }}</div>
            <div class="text-xs text-gray-400">{{ file.size }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="p-4 border-t border-border bg-white">
      <div class="flex items-center space-x-2">
        <div class="relative">
          <button @click="toggleAttachmentOptions" class="btn-ghost p-2 rounded-full hover:bg-gray-100 paperclip-button">
            <Paperclip class="w-5 h-5 paperclip-button" />
          </button>
          
          <!-- Hidden file input -->
          <input 
            ref="fileInputRef"
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
            @change="handleFileSelect"
            class="hidden"
          />
        </div>
        
        <div class="flex-1 relative">
          <input 
            type="text"
            v-model="newMessage"
            @keypress="handleKeyPress"
            placeholder="Write a message..."
            class="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 bg-gray-100"
          />
          <button 
            class="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 btn-ghost p-0 rounded-full"
          >
            <Smile class="w-4 h-4" />
          </button>
        </div>
        
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

/* Mobile optimizations */
@media (max-width: 768px) {
  .max-w-\[80\%\] {
    max-width: 80%;
  }
}

/* WhatsApp-like checkmark styling */
.text-blue-500 {
  color: #3b82f6;
}

.text-gray-400 {
  color: #9ca3af;
}
</style>