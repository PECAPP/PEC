/**
 * End-to-End Secure Authentication Flow Test Suite
 *
 * This test demonstrates all implemented security features:
 * 1. Secure signup with email verification
 * 2. Login with brute-force protection & account lockout
 * 3. Refresh token rotation with reuse detection
 * 4. Password reset flow
 * 5. Password change with session invalidation
 * 6. Role-based access control (RBAC)
 * 7. Session validation and expiration
 */

const API_BASE_URL = process.env.API_URL || "http://localhost:3000";

interface TestResult {
  scenario: string;
  status: "PASS" | "FAIL";
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  const startTime = Date.now();
  try {
    await fn();
    const duration = Date.now() - startTime;
    results.push({
      scenario: name,
      status: "PASS",
      message: "Success",
      duration,
    });
    console.log(`✓ ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);
    results.push({ scenario: name, status: "FAIL", message, duration });
    console.error(`✗ ${name} (${duration}ms): ${message}`);
  }
}

// Test 1: Signup with email verification token
async function testSignupWithEmailVerification() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "SecurePass123!@#";

  const signupRes = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: "Test User",
      role: "student",
    }),
    credentials: "include",
  });

  if (!signupRes.ok) {
    throw new Error(`Signup failed: ${signupRes.statusText}`);
  }

  const data = await signupRes.json();

  if (!data.access_token) {
    throw new Error("No access token received");
  }

  if (!data.emailVerificationToken) {
    throw new Error("No email verification token received");
  }

  if (!data.refresh_token) {
    throw new Error("No refresh token received");
  }

  // Simulate email verification
  const verifyRes = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: data.emailVerificationToken }),
    credentials: "include",
  });

  if (!verifyRes.ok) {
    throw new Error(`Email verification failed: ${verifyRes.statusText}`);
  }

  const verified = await verifyRes.json();
  if (!verified.verified) {
    throw new Error("Email verification did not return verified: true");
  }
}

// Test 2: Login and refresh token rotation
async function testLoginAndRefreshRotation() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "SecurePass123!@#";

  // Signup
  await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: "Refresh Test",
      role: "faculty",
    }),
    credentials: "include",
  });

  // Login
  const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
    credentials: "include",
  });

  if (!loginRes.ok) {
    throw new Error("Login failed");
  }

  const loginData = await loginRes.json();
  const originalRefreshToken = loginData.refresh_token;
  const originalAccessToken = loginData.access_token;

  if (!originalAccessToken || !originalRefreshToken) {
    throw new Error("Missing tokens from login response");
  }

  // Refresh to get new tokens
  const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: originalRefreshToken }),
    credentials: "include",
  });

  if (!refreshRes.ok) {
    throw new Error("Refresh failed");
  }

  const refreshData = await refreshRes.json();

  if (!refreshData.refresh_token) {
    throw new Error("No new refresh token");
  }

  if (refreshData.refresh_token === originalRefreshToken) {
    throw new Error("Refresh token was not rotated");
  }

  if (refreshData.access_token === originalAccessToken) {
    throw new Error("Access token was not refreshed");
  }

  // Try to reuse original token (should fail - reuse detection)
  const reuseRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: originalRefreshToken }),
    credentials: "include",
  });

  if (reuseRes.ok) {
    throw new Error(
      "Refresh token reuse detection failed - old token should be rejected",
    );
  }
}

// Test 3: Account lockout after failed logins
async function testAccountLockout() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "SecurePass123!@#";

  // Signup
  await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: "Lockout Test",
      role: "student",
    }),
    credentials: "include",
  });

  // Attempt 5 failed logins
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "WrongPassword" }),
      credentials: "include",
    });

    if (res.ok) {
      throw new Error(`Login should have failed on attempt ${i + 1}`);
    }
  }

  // Now attempt with correct password (should fail due to lockout)
  const lockedRes = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
    credentials: "include",
  });

  if (lockedRes.status !== 403) {
    throw new Error("Account lockout not triggered - expected 403 Forbidden");
  }
}

// Test 4: Password reset flow
async function testPasswordResetFlow() {
  const testEmail = `test_${Date.now()}@example.com`;
  const originalPassword = "SecurePass123!@#";
  const newPassword = "NewSecurePass456!@#";

  // Signup
  await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: originalPassword,
      name: "Password Reset Test",
      role: "student",
    }),
    credentials: "include",
  });

  // Request password reset
  const resetReqRes = await fetch(
    `${API_BASE_URL}/auth/request-password-reset`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
      credentials: "include",
    },
  );

  if (!resetReqRes.ok) {
    throw new Error("Password reset request failed");
  }

  const resetData = await resetReqRes.json();

  if (!resetData.resetToken) {
    throw new Error("No password reset token provided");
  }

  // Reset password using token
  const resetRes = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: resetData.resetToken,
      password: newPassword,
    }),
    credentials: "include",
  });

  if (!resetRes.ok) {
    throw new Error("Password reset failed");
  }

  // Login with new password
  const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: newPassword }),
    credentials: "include",
  });

  if (!loginRes.ok) {
    throw new Error("Login with new password failed");
  }

  // Verify old password no longer works
  const oldPassRes = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: originalPassword }),
    credentials: "include",
  });

  if (oldPassRes.ok) {
    throw new Error("Old password should no longer work after reset");
  }
}

// Test 5: RBAC - Resource ownership check
async function testResourceOwnershipCheck() {
  const user1Email = `user1_${Date.now()}@example.com`;
  const user2Email = `user2_${Date.now()}@example.com`;
  const password = "SecurePass123!@#";

  // Create two users
  const user1Res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user1Email,
      password,
      name: "User 1",
      role: "student",
    }),
    credentials: "include",
  });

  const user1Data = await user1Res.json();
  const user1Token = user1Data.access_token;
  const user1Id = user1Data.user.uid;

  const user2Res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user2Email,
      password,
      name: "User 2",
      role: "student",
    }),
    credentials: "include",
  });

  const user2Data = await user2Res.json();
  const user2Token = user2Data.access_token;
  const user2Id = user2Data.user.uid;

  // User 2 tries to access User 1's profile (should fail)
  const accessRes = await fetch(`${API_BASE_URL}/users/${user1Id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${user2Token}` },
    credentials: "include",
  });

  if (accessRes.ok) {
    throw new Error("User 2 should not be able to access User 1 profile");
  }

  if (accessRes.status !== 403) {
    throw new Error(`Expected 403, got ${accessRes.status}`);
  }

  // User 1 can access their own profile
  const ownAccessRes = await fetch(`${API_BASE_URL}/users/${user1Id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${user1Token}` },
    credentials: "include",
  });

  if (!ownAccessRes.ok) {
    throw new Error("User should be able to access their own profile");
  }
}

// Test 6: Session invalidation on password change
async function testSessionInvalidationOnPasswordChange() {
  const testEmail = `test_${Date.now()}@example.com`;
  const originalPassword = "SecurePass123!@#";
  const newPassword = "NewSecurePass456!@#";

  // Signup and login
  const signupRes = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: originalPassword,
      name: "Session Test",
      role: "student",
    }),
    credentials: "include",
  });

  const signupData = await signupRes.json();
  const oldAccessToken = signupData.access_token;
  const refreshToken = signupData.refresh_token;

  // Use the token to access profile
  const profileRes1 = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${oldAccessToken}` },
    credentials: "include",
  });

  if (!profileRes1.ok) {
    throw new Error("Initial profile access failed");
  }

  // Change password
  const changeRes = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${oldAccessToken}`,
    },
    body: JSON.stringify({
      currentPassword: originalPassword,
      newPassword,
    }),
    credentials: "include",
  });

  if (!changeRes.ok) {
    throw new Error("Password change failed");
  }

  // Old access token should now fail
  const profileRes2 = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${oldAccessToken}` },
    credentials: "include",
  });

  if (profileRes2.ok) {
    throw new Error("Old token should be invalidated after password change");
  }

  // Must login again with new password
  const reloginRes = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: newPassword }),
    credentials: "include",
  });

  if (!reloginRes.ok) {
    throw new Error("Re-login with new password failed");
  }
}

// Test 7: Logout revokes refresh tokens
async function testLogoutRevokesTokens() {
  const testEmail = `test_${Date.now()}@example.com`;
  const password = "SecurePass123!@#";

  // Signup
  const signupRes = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password,
      name: "Logout Test",
      role: "student",
    }),
    credentials: "include",
  });

  const signupData = await signupRes.json();
  const refreshToken = signupData.refresh_token;

  // Logout
  const logoutRes = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    credentials: "include",
  });

  if (!logoutRes.ok) {
    throw new Error("Logout failed");
  }

  // Try to use refresh token after logout (should fail)
  const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    credentials: "include",
  });

  if (refreshRes.ok) {
    throw new Error("Refresh token should be revoked after logout");
  }
}

// Run all tests
async function runAllTests() {
  console.log("🔐 Starting Secure Authentication Flow Tests\n");

  await runTest(
    "Signup with Email Verification",
    testSignupWithEmailVerification,
  );
  await runTest(
    "Login and Refresh Token Rotation",
    testLoginAndRefreshRotation,
  );
  await runTest("Account Lockout After Failed Logins", testAccountLockout);
  await runTest("Password Reset Flow", testPasswordResetFlow);
  await runTest("RBAC - Resource Ownership Check", testResourceOwnershipCheck);
  await runTest(
    "Session Invalidation on Password Change",
    testSessionInvalidationOnPasswordChange,
  );
  await runTest("Logout Revokes Refresh Tokens", testLogoutRevokesTokens);

  // Print summary
  console.log("\n📊 Test Summary");
  console.log("═".repeat(50));
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(
    `Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`,
  );
  console.log("═".repeat(50));

  if (failed > 0) {
    console.log("\nFailed Tests:");
    results
      .filter((r) => r.status === "FAIL")
      .forEach((r) => {
        console.log(`  ✗ ${r.scenario}`);
        console.log(`    ${r.message}`);
      });
  } else {
    console.log("\n✅ All tests passed!");
  }
}

// Execute tests
runAllTests().catch((error) => {
  console.error("Test suite error:", error);
  process.exit(1);
});
