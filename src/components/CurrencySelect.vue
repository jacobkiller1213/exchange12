<template>
  <div class="custom-select" :class="{ 'open': isOpen }">
    <div class="select-trigger" @click="toggleDropdown">
      <div class="selected-option">
        <img v-if="selectedOption?.icon" :src="selectedOption.icon" :alt="selectedOption.label" class="option-icon">
        <span class="option-text">{{ selectedOption?.label || placeholder }}</span>
      </div>
      <svg class="chevron" :class="{ 'rotated': isOpen }" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <div class="options-container">
          <div
            v-for="option in options"
            :key="option.key"
            @click="selectOption(option)"
            class="option-item"
            :class="{ 'selected': option.key === modelValue }"
          >
            <img v-if="option.icon" :src="option.icon.toLowerCase()" :alt="option.label" class="option-icon">
            <span class="option-text">{{ option.label }}</span>
            <svg v-if="option.key === modelValue" class="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  options: {
    type: Array,
    required: true,
    validator: (options) => {
      return options.every(option =>
        option.hasOwnProperty('key') &&
        option.hasOwnProperty('label')
      )
    }
  },
  placeholder: {
    type: String,
    default: 'Выберите опцию'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)

const selectedOption = computed(() => {
  return props.options.find(option => option.key === props.modelValue)
})

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option) => {
  emit('update:modelValue', option.key)
  isOpen.value = false
}

const closeDropdown = (event) => {
  if (!event.target.closest('.custom-select')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
}

.select-trigger:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.custom-select.open .select-trigger {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.selected-option {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.option-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.option-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.chevron {
  width: 20px;
  height: 20px;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 4px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.options-container {
  max-height: 200px;
  overflow-y: auto;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  position: relative;
}

.option-item:hover {
  background-color: #f3f4f6;
}

.option-item.selected {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.option-item.selected .option-text {
  color: #1d4ed8;
  font-weight: 600;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #1d4ed8;
  margin-left: auto;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.options-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.options-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .select-trigger {
    padding: 10px 14px;
    min-height: 44px;
  }

  .option-item {
    padding: 10px 14px;
  }

  .option-text {
    font-size: 16px;
  }
}
</style>
