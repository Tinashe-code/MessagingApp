<script setup>
import { ref, computed, onMounted } from 'vue'
import Chat from './components/Chat.vue'
import { useAuthStore } from './stores/auth'

// Import icons for the auth dialog
import { 
  MessageCircle, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-vue-next'

const authStore = useAuthStore()

// Dialog state
const showAuthDialog = ref(true) // Show by default until we check auth state
const isLoginView = ref(true) // Toggle between login and signup

// Form states
const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false
})

const signupForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// UI states
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Check if user is already authenticated
onMounted(async () => {
  // Check if user is already logged in from localStorage
  authStore.initializeFromStorage()
  
  if (authStore.isAuthenticated) {
    showAuthDialog.value = false
  }
})

// Watch for auth state changes
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Form validation
const validateLoginForm = () => {
  if (!loginForm.value.email.trim()) {
    errorMessage.value = 'Email is required'
    return false
  }
  if (!loginForm.value.password) {
    errorMessage.value = 'Password is required'
    return false
  }
  if (!/\S+@\S+\.\S+/.test(loginForm.value.email)) {
    errorMessage.value = 'Please enter a valid email address'
    return false
  }
  return true
}

const validateSignupForm = () => {
  if (!signupForm.value.name.trim()) {
    errorMessage.value = 'Name is required'
    return false
  }
  if (!signupForm.value.email.trim()) {
    errorMessage.value = 'Email is required'
    return false
  }
  if (!signupForm.value.password) {
    errorMessage.value = 'Password is required'
    return false
  }
  if (signupForm.value.password !== signupForm.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return false
  }
  if (signupForm.value.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return false
  }
  if (!/\S+@\S+\.\S+/.test(signupForm.value.email)) {
    errorMessage.value = 'Please enter a valid email address'
    return false
  }
  return true
}

// Handle login
const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (!validateLoginForm()) return
  
  isLoading.value = true
  
  try {
    const result = await authStore.login({
      email: loginForm.value.email,
      password: loginForm.value.password
    })
    
    if (result.success) {
      successMessage.value = 'Login successful!'
      showAuthDialog.value = false
      
      // Reset form
      loginForm.value = {
        email: '',
        password: '',
        rememberMe: false
      }
    } else {
      errorMessage.value = result.error || 'Login failed. Please try again.'
    }
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred during login.'
  } finally {
    isLoading.value = false
  }
}

// Handle signup
const handleSignup = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (!validateSignupForm()) return
  
  isLoading.value = true
  
  try {
    // Replace with your actual signup API call
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: signupForm.value.name,
        email: signupForm.value.email,
        password: signupForm.value.password
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.token) {
      // Auto-login after successful signup
      const loginResult = await authStore.login({
        email: signupForm.value.email,
        password: signupForm.value.password
      })
      
      if (loginResult.success) {
        successMessage.value = 'Account created successfully!'
        showAuthDialog.value = false
        
        // Reset form
        signupForm.value = {
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        }
      } else {
        errorMessage.value = 'Account created but login failed. Please try logging in.'
        isLoginView.value = true
      }
    } else {
      errorMessage.value = data.message || 'Signup failed. Please try again.'
    }
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred during signup.'
  } finally {
    isLoading.value = false
  }
}

// Handle forgot password
const handleForgotPassword = () => {
  // Implement forgot password logic
  alert('Forgot password functionality would go here')
}

// Toggle between login and signup
const toggleView = () => {
  isLoginView.value = !isLoginView.value
  errorMessage.value = ''
  successMessage.value = ''
}

// Demo login for testing
const handleDemoLogin = () => {
  loginForm.value = {
    email: 'demo@example.com',
    password: 'password123',
    rememberMe: true
  }
  handleLogin()
}
</script>

<template>
  <div>
    <!-- Authentication Dialog -->
    <div v-if="showAuthDialog" class="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center">
          <div class="flex items-center justify-center space-x-3 mb-4">
            <MessageCircle class="w-10 h-10 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-white mb-2">
            Welcome to Tenant Chat
          </h1>
          <p class="text-blue-100 text-sm">
            {{ isLoginView ? 'Sign in to continue to your conversations' : 'Create a new account to get started' }}
          </p>
        </div>

        <!-- Form Container -->
        <div class="p-6 md:p-8">
          <!-- Success Message -->
          <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle class="w-5 h-5 text-green-500" />
            <span class="text-green-700 text-sm">{{ successMessage }}</span>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <XCircle class="w-5 h-5 text-red-500" />
            <span class="text-red-700 text-sm">{{ errorMessage }}</span>
          </div>

          <!-- Login Form -->
          <form v-if="isLoginView" @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="loginForm.email"
                  type="email"
                  placeholder="you@example.com"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  :disabled="isLoading"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  v-model="loginForm.rememberMe"
                  type="checkbox"
                  class="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                  :disabled="isLoading"
                />
                <span class="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                @click="handleForgotPassword"
                class="text-sm text-blue-500 hover:text-blue-700 font-medium"
                :disabled="isLoading"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
              <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
            </button>

            <button
              type="button"
              @click="handleDemoLogin"
              :disabled="isLoading"
              class="w-full bg-gradient-to-r from-gray-500 to-gray-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-gray-600 hover:to-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Try Demo Account
            </button>
          </form>

          <!-- Signup Form -->
          <form v-else @submit.prevent="handleSignup" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="signupForm.name"
                  type="text"
                  placeholder="John Doe"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  :disabled="isLoading"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div class="relative">
                <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="signupForm.email"
                  type="email"
                  placeholder="you@example.com"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  :disabled="isLoading"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="signupForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  v-model="signupForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <component :is="showConfirmPassword ? EyeOff : Eye" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                id="terms"
                class="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                required
                :disabled="isLoading"
              />
              <label for="terms" class="ml-2 text-sm text-gray-600">
                I agree to the 
                <a href="#" class="text-blue-500 hover:text-blue-700 font-medium">Terms of Service</a>
                and 
                <a href="#" class="text-blue-500 hover:text-blue-700 font-medium">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
              <span>{{ isLoading ? 'Creating Account...' : 'Create Account' }}</span>
            </button>
          </form>

          <!-- Toggle between login and signup -->
          <div class="mt-6 pt-6 border-t border-gray-200 text-center">
            <p class="text-gray-600 text-sm">
              {{ isLoginView ? "Don't have an account?" : "Already have an account?" }}
              <button
                @click="toggleView"
                class="text-blue-500 hover:text-blue-700 font-semibold ml-1"
                :disabled="isLoading"
              >
                {{ isLoginView ? 'Sign up' : 'Sign in' }}
              </button>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 p-4 text-center">
          <p class="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>

    <!-- Main Chat App (only shown when authenticated) -->
    <div v-if="!showAuthDialog && isAuthenticated" class="h-screen">
      <Chat />
    </div>
  </div>
</template>

<style scoped>
/* Animation for dialog entrance */
.fixed {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Smooth transitions for form toggle */
form {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>