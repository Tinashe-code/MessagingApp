<script setup>
    import ChatArea from './ChatArea.vue';
    import Sidebar from './Sidebar.vue';

    const selectedConversation = ref("0")
</script>

<template>

    <div class="h-screen flex bg-background">
        <Sidebar 
        :selected-conversation="selectedConversation"
        @select-conversation="selectedConversation = $event"
        />
        <ChatArea :conversation-id="selectedConversation" />
    </div>
</template>