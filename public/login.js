// public/login.js — Client-side Auth logic for CreatorHQ

let supabaseClient = null;

// Initialize Supabase. 
// We'll try to get the keys from the server or assume they are globally available.
async function initSupabase() {
  if (supabaseClient) return supabaseClient;
  
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    
    if (config.supabaseUrl && config.supabaseKey) {
      supabaseClient = supabase.createClient(config.supabaseUrl, config.supabaseKey);
      return supabaseClient;
    }
  } catch (err) {
    console.error('Failed to init Supabase client:', err);
  }
}

// UI Helpers
function openAuthModal() {
  document.getElementById('auth-modal').style.display = 'flex';
}

function closeAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
  document.getElementById('otp-group').style.display = 'none';
  document.getElementById('auth-group').style.display = 'block';
  document.getElementById('auth-error').style.display = 'none';
}

function showError(msg) {
  const err = document.getElementById('auth-error');
  err.textContent = msg;
  err.style.display = 'block';
}

// 1. Google Login
async function loginWithGoogle() {
  const sb = await initSupabase();
  if (!sb) return showError('System error: Auth client missing.');
  
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth/callback',
    }
  });
  
  if (error) showError(error.message);
}

// 2. OTP Request (WhatsApp or Email)
async function requestOTP() {
  const identifier = document.getElementById('auth-identifier').value.trim();
  if (!identifier) return showError('Enter an email or phone number.');

  const submitBtn = document.getElementById('auth-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });
    
    const data = await res.json();
    
    if (data.success) {
      // If it's pure Supabase magic link, it might already be sent.
      // If it's our custom WhatsApp flow, we show the OTP input.
      if (data.type === 'whatsapp' || data.type === 'phone' || data.type === 'email-otp') {
        document.getElementById('auth-group').style.display = 'none';
        document.getElementById('otp-group').style.display = 'block';
      } else {
        showError('Check your email for the magic link!');
      }
    } else {
      showError(data.error || 'Failed to send OTP.');
    }
  } catch (err) {
    showError('Network error. Try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Magic Link / OTP';
  }
}

// 3. OTP Verification
async function verifyOTP() {
  const identifier = document.getElementById('auth-identifier').value.trim();
  const token = document.getElementById('auth-otp').value.trim();
  
  if (!token) return showError('Enter the 6-digit code.');

  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, token, creatorId: window.location.pathname.split('/').pop() })
    });
    
    const data = await res.json();
    
    if (data.success) {
      // Success! Reload to see owner affordances
      window.location.reload();
    } else {
      showError(data.error || 'Invalid code.');
    }
  } catch (err) {
    showError('Verification failed. Try again.');
  }
}
