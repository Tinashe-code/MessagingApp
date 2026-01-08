<template>
  <div class="accordion">
    <div v-for="item in items" :key="item.value" class="accordion-item border-b last:border-b-0">
      <button
        :class="[
          'accordion-trigger focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50',
          activeItem === item.value ? 'open' : ''
        ]"
        @click="toggleItem(item.value)"
      >
        <span class="flex-1">{{ item.trigger }}</span>
        <ChevronDownIcon :class="[
          'text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200',
          activeItem === item.value ? 'rotate-180' : ''
        ]" />
      </button>
      <div
        :class="[
          'accordion-content overflow-hidden text-sm transition-all duration-200',
          activeItem === item.value ? 'open' : ''
        ]"
        :style="{ 
          maxHeight: activeItem === item.value ? contentHeights[item.value] + 'px' : '0px',
          opacity: activeItem === item.value ? 1 : 0
        }"
        ref="contentRefs"
      >
        <div class="pt-0 pb-4">
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const ChevronDownIcon = ChevronDown

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const activeItem = ref(props.modelValue)
const contentHeights = ref({})
const contentRefs = ref([])

const toggleItem = (value) => {
  if (props.multiple) {
    // For multiple accordion implementation
    // You would need to track an array of active items
  } else {
    activeItem.value = activeItem.value === value ? '' : value
    emit('update:modelValue', activeItem.value)
  }
}

const updateHeights = () => {
  props.items.forEach((item, index) => {
    if (contentRefs.value[index]) {
      contentHeights.value[item.value] = contentRefs.value[index].scrollHeight
    }
  })
}

onMounted(() => {
  updateHeights()
})

watch(() => props.modelValue, (newValue) => {
  activeItem.value = newValue
})
</script>