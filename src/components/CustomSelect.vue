<template>
  <div class="custom-select" :class="{ 'open': isOpen, 'disabled': disabled }">
    <div class="select-trigger" @click="toggleDropdown">
      <div class="selected-option">
        <img v-if="selectedOption?.icon" :src="selectedOption.icon" :alt="selectedOption.label" class="option-icon">
        <span class="option-text" :class="{ 'placeholder': !selectedOption }">
          {{ selectedOption?.label || placeholder }}
        </span>
      </div>
      <svg class="chevron" :class="{ 'rotated': isOpen }" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <div v-if="searchable" class="search-container">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Поиск..."
            class="search-input"
            @click.stop
          >
        </div>
        <div class="options-container">
          <div
            v-for="option in filteredOptions"
            :key="option.key"
            @click="selectOption(option)"
            class="option-item"
            :class="{ 'selected': option.key === modelValue }"
          >
            <img v-if="option.icon" :src="option.icon" :alt="option.label" class="option-icon">
            <div class="option-content">
              <span class="option-text">{{ option.label }}</span>
              <span v-if="option.description" class="option-description">{{ option.description }}</span>
            </div>
            <svg v-if="option.key === modelValue" class="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div v-if="filteredOptions.length === 0" class="no-options">
            Ничего не найдено
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

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
  },
  searchable: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)

const selectedOption = computed(() => {
  return props.options.find(option => option.key === props.modelValue)
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option =>
    option.label.toLowerCase().includes(query) ||
    (option.description && option.description.toLowerCase().includes(query))
  )
})

const toggleDropdown = () => {
  if (props.disabled) return

  isOpen.value = !isOpen.value

  if (isOpen.value && props.searchable) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

const selectOption = (option) => {
  emit('update:modelValue', option.key)
  emit('change', option)
  isOpen.value = false
  searchQuery.value = ''
}

const closeDropdown = (event) => {
  if (!event.target.closest('.custom-select')) {
    isOpen.value = false
    searchQuery.value = ''
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
}

.custom-select.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #3f3f45;
  border: 2px solid #3b3b43;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.custom-select:not(.disabled) .select-trigger:hover {
  border-color: #2cb48e;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.custom-select.open .select-trigger {
  border-color: #2cb48e;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.custom-select.disabled .select-trigger {
  cursor: not-allowed;
  background: #f9fafb;
}

.selected-option {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.option-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.option-text {
  font-weight: 500;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.option-text.placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.chevron {
  width: 20px;
  height: 20px;
  color: #6b7280;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  background: #3b3b43;
  border: 2px solid #3b3b43;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.search-container {
  padding: 12px;
  border-bottom: 1px solid #63676e;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #63676e;
  background: #3b3b43;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #3b82f6;
}

.options-container {
  max-height: 250px;
  overflow-y: auto;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.option-item:hover {
  background-color: #f8fafc;
}

.option-item.selected {
  background-color: #eff6ff;
}

.option-item.selected .option-text {
  color: #1d4ed8;
  font-weight: 600;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-description {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #1d4ed8;
  flex-shrink: 0;
}

.no-options {
  padding: 16px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
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

.select-trigger {
  padding: 12px 16px;
  min-height: 48px;
  font-size: 14px;
}

.custom-select[data-size="small"] .select-trigger {
  padding: 8px 12px;
  min-height: 40px;
  font-size: 13px;
}

.custom-select[data-size="large"] .select-trigger {
  padding: 16px 20px;
  min-height: 56px;
  font-size: 16px;
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