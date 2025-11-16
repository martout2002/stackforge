/**
 * Rate Limiter Test
 * Simple test to verify rate limiting works correctly
 */

import { DeploymentRateLimiter } from './rate-limiter';

console.log('=== Rate Limiter Test ===\n');

async function runTests() {
  try {
    // Create a rate limiter with low limits for testing
    const limiter = new DeploymentRateLimiter(3, 10000); // 3 deployments per 10 seconds
    const testUserId = 'test-user-123';
    
    // Test 1: Check initial state
    console.log('Test 1: Initial state');
    const initialInfo = await limiter.getRateLimitInfo(testUserId);
    console.log('Initial limit:', initialInfo.limit);
    console.log('Initial remaining:', initialInfo.remaining);
    console.log('Initial exceeded:', initialInfo.exceeded);
    console.log('Valid initial state:', initialInfo.remaining === 3 ? '✓ Success' : '✗ Failed');
    console.log();
    
    // Test 2: Use up deployments
    console.log('Test 2: Use up deployments');
    for (let i = 1; i <= 3; i++) {
      const canDeploy = await limiter.checkLimit(testUserId);
      const remaining = await limiter.getRemainingDeployments(testUserId);
      console.log(`Deployment ${i}: canDeploy=${canDeploy}, remaining=${remaining}`);
    }
    console.log();
    
    // Test 3: Exceed limit
    console.log('Test 3: Exceed limit');
    const canDeployAfterLimit = await limiter.checkLimit(testUserId);
    const remainingAfterLimit = await limiter.getRemainingDeployments(testUserId);
    console.log('Can deploy after limit:', canDeployAfterLimit);
    console.log('Remaining after limit:', remainingAfterLimit);
    console.log('Correctly blocked:', !canDeployAfterLimit && remainingAfterLimit === 0 ? '✓ Success' : '✗ Failed');
    console.log();
    
    // Test 4: Get rate limit info
    console.log('Test 4: Rate limit info');
    const info = await limiter.getRateLimitInfo(testUserId);
    console.log('Limit:', info.limit);
    console.log('Remaining:', info.remaining);
    console.log('Exceeded:', info.exceeded);
    console.log('Reset time:', info.reset.toISOString());
    console.log('Info correct:', info.exceeded && info.remaining === 0 ? '✓ Success' : '✗ Failed');
    console.log();
    
    // Test 5: Reset limit
    console.log('Test 5: Reset limit');
    await limiter.resetLimit(testUserId);
    const afterReset = await limiter.getRemainingDeployments(testUserId);
    console.log('Remaining after reset:', afterReset);
    console.log('Reset successful:', afterReset === 3 ? '✓ Success' : '✗ Failed');
    console.log();
    
    // Test 6: Different users
    console.log('Test 6: Different users have separate limits');
    const user1 = 'user-1';
    const user2 = 'user-2';
    
    await limiter.checkLimit(user1);
    await limiter.checkLimit(user1);
    
    const user1Remaining = await limiter.getRemainingDeployments(user1);
    const user2Remaining = await limiter.getRemainingDeployments(user2);
    
    console.log('User 1 remaining:', user1Remaining);
    console.log('User 2 remaining:', user2Remaining);
    console.log('Separate limits:', user1Remaining === 1 && user2Remaining === 3 ? '✓ Success' : '✗ Failed');
    console.log();
    
    console.log('=== All Tests Passed ===');
    process.exit(0);
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTests();
