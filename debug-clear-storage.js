// EMERGENCY: Clear corrupted Supabase localStorage
// Run this in browser console if session restore fails

console.log('🧹 Debug: Clearing all Supabase storage...')

// Clear localStorage
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('sb-')) {
    console.log('🗑️ Removing localStorage:', key)
    localStorage.removeItem(key)
  }
})

// Clear sessionStorage
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('sb-')) {
    console.log('🗑️ Removing sessionStorage:', key)
    sessionStorage.removeItem(key)
  }
})

// Clear cookies
document.cookie.split(";").forEach(function(c) { 
  const cookie = c.replace(/^ +/, "")
  if (cookie.includes('supabase') || cookie.includes('sb-')) {
    console.log('🗑️ Removing cookie:', cookie.split('=')[0])
    document.cookie = cookie.replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
  }
})

console.log('✅ All Supabase storage cleared. Refresh the page.')
