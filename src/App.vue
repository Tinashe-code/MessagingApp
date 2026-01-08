<script setup>
// import { ref } from 'vue'
// import Sidebar from './components/Sidebar.vue'
// import ChatArea from './components/ChatArea.vue'

// const selectedConversation = ref("0")
import Chat from './components/Chat.vue';
</script>

<template>
  <div>
    <Chat />
  </div>
  <!-- <div class="h-screen flex bg-background">
    <Sidebar 
      :selected-conversation="selectedConversation"
      @select-conversation="selectedConversation = $event"
    />
    <ChatArea :conversation-id="selectedConversation" />
  </div> -->
</template>