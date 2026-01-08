<!-- Simplified single-file Alert component -->
<template>
  <div
    :class="alertClasses"
    role="alert"
    data-slot="alert"
  >
    <div
      v-if="title || $slots.title"
      :class="cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        titleClass
      )"
      data-slot="alert-title"
    >
      <slot name="title">{{ title }}</slot>
    </div>
    
    <div
      v-if="description || $slots.default"
      :class="cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        descriptionClass
      )"
      data-slot="alert-description"
    >
      <slot>{{ description }}</slot>
    </div>
    
    <slot name="icon" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cn } from './utils.js'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'destructive'].includes(value)
  },
  className: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  titleClass: {
    type: String,
    default: ''
  },
  descriptionClass: {
    type: String,
    default: ''
  }
})

const alertVariants = {
  default: 'bg-card text-card-foreground',
  destructive: 'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90'
}

const alertClasses = computed(() => {
  const baseClasses = 'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current'
  const variantClass = alertVariants[props.variant] || alertVariants.default
  return cn(baseClasses, variantClass, props.className)
})
</script>