import assert from "assert";
import fs from "fs";
import path from "path";

console.log("\x1b[35m==================================================================\x1b[0m");
console.log("\x1b[35m                 VOXSPHERE AUTOMATED TEST SUITE                 \x1b[0m");
console.log("\x1b[35m==================================================================\x1b[0m\n");

const BASE_URL = "http://localhost:3000";

// Local Spam Loop Matcher Simulation (from server.ts)
function detectSpamLoops(text: string): { isSpam: boolean; phraseMatched?: string } {
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);
  
  for (let phraseLen = 1; phraseLen <= 4; phraseLen++) {
    for (let i = 0; i <= words.length - (phraseLen * 3); i++) {
      const chunk1 = words.slice(i, i + phraseLen).join(" ");
      const chunk2 = words.slice(i + phraseLen, i + (phraseLen * 2)).join(" ");
      const chunk3 = words.slice(i + (phraseLen * 2), i + (phraseLen * 3)).join(" ");
      
      if (chunk1 === chunk2 && chunk2 === chunk3 && chunk1.length > 0) {
        return { isSpam: true, phraseMatched: chunk1 };
      }
    }
  }

  if (normalized.includes("bolo na bolo na") || normalized.includes("bolo na") && words.filter(w => w === "bolo" || w === "na").length >= 4) {
    return { isSpam: true, phraseMatched: "bolo na loop" };
  }

  const wordCounts: { [key: string]: number } = {};
  for (const word of words) {
    if (word.length > 2) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
      if (wordCounts[word] >= 6) {
        return { isSpam: true, phraseMatched: `excessive word: "${word}"` };
      }
    }
  }

  return { isSpam: false };
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function testCase(name: string, fn: () => void | Promise<void>) {
    try {
      console.log(`\x1b[34m[TEST]\x1b[0m Running: ${name}`);
      const res = fn();
      if (res instanceof Promise) {
        throw new Error("testCase does not support async directly, use testCaseAsync");
      }
      console.log(`  \x1b[32m✔ SUCCESS\x1b[0m\n`);
      passed++;
    } catch (err: any) {
      console.log(`  \x1b[31m✘ FAILED\x1b[0m: ${err.message}\n`);
      failed++;
    }
  }

  async function testCaseAsync(name: string, fn: () => Promise<void>) {
    try {
      console.log(`\x1b[34m[TEST]\x1b[0m Running: ${name}`);
      await fn();
      console.log(`  \x1b[32m✔ SUCCESS\x1b[0m\n`);
      passed++;
    } catch (err: any) {
      console.log(`  \x1b[31m✘ FAILED\x1b[0m: ${err.message}\n`);
      failed++;
    }
  }

  // ==========================================
  // SECTION 1: UNIT TESTS FOR SPAM LOOP HEURISTIC
  // ==========================================
  console.log("\x1b[36m--- Section 1: Spam Loop Detection Unit Tests ---\x1b[0m\n");

  testCase("Spam Loop Heuristic - Clear/Safe Audio Phrase", () => {
    const text = "Sisters, we carry heavy loads but we do not have to carry them in silence. Take 30 seconds for self-care.";
    const result = detectSpamLoops(text);
    assert.strictEqual(result.isSpam, false, "Should not be spam");
  });

  testCase("Spam Loop Heuristic - Repetitive Phrase Matcher ('bolo na bolo na bolo na')", () => {
    const text = "Let's talk, bolo na bolo na bolo na, please share your thoughts";
    const result = detectSpamLoops(text);
    assert.strictEqual(result.isSpam, true, "Should flag repeated 2-word phrase as spam");
    assert.strictEqual(result.phraseMatched, "bolo na loop", "Should detect phraseMatched as 'bolo na loop'");
  });

  testCase("Spam Loop Heuristic - Repetitive Word Count Limit Matcher", () => {
    const text = "maternity rights maternity laws maternity support maternity claims maternity help maternity check";
    const result = detectSpamLoops(text);
    assert.strictEqual(result.isSpam, true, "Should flag excessive repeating words");
    assert.ok(result.phraseMatched?.includes("maternity"), "Should identify maternity word");
  });

  // ==========================================
  // SECTION 2: INTEGRATION TESTS WITH EXPRESS API
  // ==========================================
  console.log("\x1b[36m--- Section 2: Full-Stack Express API Integration Tests ---\x1b[0m\n");

  testCaseAsync("API - Get Feed and Check Active Mock Data", async () => {
    const res = await fetch(`${BASE_URL}/api/pods/feed`);
    assert.strictEqual(res.status, 200, "Should return 200 OK");
    const json = await res.json();
    assert.strictEqual(json.success, true, "Response success should be true");
    assert.ok(Array.isArray(json.pods), "Response pods should be an array");
    assert.ok(json.pods.length >= 5, "Should return at least the 5 default mock pods");
    
    // Check one default mock pod
    const firstPod = json.pods.find((p: any) => p.id === "p-1");
    assert.ok(firstPod, "Default pod p-1 should be present in feed");
    assert.strictEqual(firstPod.category, "MENTAL_HEALTH", "Default category matches");
    assert.strictEqual(firstPod.user.role, "VERIFIED_CREATOR", "Role matches default database seeds");
  });

  testCaseAsync("API - Moderation Block: Keyword-based Flagging", async () => {
    // Post content containing prohibited words like 'abuse' or 'scam'
    const payload = {
      title: "Get Rich Fast Scheme",
      category: "CAREER",
      duration: 15,
      transcript: "This is a secure fast loop hack. Send money to this direct address scam today."
    };

    const res = await fetch(`${BASE_URL}/api/pods/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 201, "API returns 201 even when flagged to persist logs");
    const json = await res.json();
    assert.strictEqual(json.success, true, "Returns successful mock persist");
    assert.strictEqual(json.moderationResult.status, "FLAGGED", "Should block because of policy keywords");
    assert.ok(json.moderationResult.reason.includes("Policy Violation") || json.moderationResult.reason.includes("Spam"), "Reason must outline breach details");
  });

  testCaseAsync("API - Micro-pod Upload & Auto-moderation Approval Flow", async () => {
    const payload = {
      title: "Mental Health Checkin",
      category: "MENTAL_HEALTH",
      duration: 25,
      transcript: "Taking a deep breath today to remember we do not have to carry the weight of the family in absolute silence. Let us stand together as sisters."
    };

    const res = await fetch(`${BASE_URL}/api/pods/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 201, "Should successfully upload micro-podcast");
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.moderationResult.status, "APPROVED", "Safe micro-podcast must pass moderation flow");
    assert.ok(json.pod.id.startsWith("p-"), "Returns a valid podcast id");

    // Clean up created pod so it doesn't leak or exceed thresholds
    const deleteRes = await fetch(`${BASE_URL}/api/pods/${json.pod.id}`, { method: "DELETE" });
    const deleteJson = await deleteRes.json();
    assert.strictEqual(deleteJson.success, true, "Cleanup delete should succeed");
  });

  testCaseAsync("API - Strict 30s Duration Limit Guardrail", async () => {
    const payload = {
      title: "Long Podcast Post Attempt",
      category: "CAREER",
      duration: 35, // exceeds 30 seconds limit
      transcript: "Attempting to talk about career progression for more than the 30 seconds allowed on the server."
    };

    const res = await fetch(`${BASE_URL}/api/pods/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    assert.strictEqual(res.status, 400, "Should return 400 Bad Request on excessive duration");
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.includes("30-second strict limit"), "Should print duration breach error");
  });

  testCaseAsync("API - Storage Quota Threshold Guardrail (10 active uploads limit)", async () => {
    const createdIds: string[] = [];
    
    // First, let's check current pod count for u-current
    const feedRes = await fetch(`${BASE_URL}/api/pods/feed`);
    const feedJson = await feedRes.json();
    const currentCount = feedJson.pods.filter((p: any) => p.userId === "u-current").length;
    
    // Fill remaining slots up to 10
    const slotsToFill = 10 - currentCount;
    
    console.log(`  (Pre-filling ${slotsToFill} mock pod slots to trigger the limit check)`);
    for (let i = 0; i < slotsToFill; i++) {
      const res = await fetch(`${BASE_URL}/api/pods/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Quota Filler Pod #${i+1}`,
          category: "LEGAL_RIGHTS",
          duration: 12,
          transcript: `Safe mock filler transcript for slot testing sequence ${i+1}.`
        })
      });
      const data = await res.json();
      if (data.success && data.pod) {
        createdIds.push(data.pod.id);
      }
    }

    // Now, attempt the 11th upload, which MUST be blocked
    const overLimitRes = await fetch(`${BASE_URL}/api/pods/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "The 11th Blocked Post",
        category: "CLIMATE",
        duration: 10,
        transcript: "This is the eleventh post that should exceed our storage capacity threshold limit and trigger 403."
      })
    });

    assert.strictEqual(overLimitRes.status, 403, "Should reject with 403 Forbidden");
    const overLimitJson = await overLimitRes.json();
    assert.strictEqual(overLimitJson.success, false);
    assert.ok(overLimitJson.error.includes("threshold of 10 active pods"), "Should specify quota threshold limit breach");

    // Clean up all filled slots
    console.log(`  (Cleaning up ${createdIds.length} filled slots)`);
    for (const id of createdIds) {
      await fetch(`${BASE_URL}/api/pods/${id}`, { method: "DELETE" });
    }
  });

  // ==========================================
  // SECTION 3: RECT NATIVE SOURCE COMPONENT VALIDATION
  // ==========================================
  console.log("\x1b[36m--- Section 3: React Native Components Existence Tests ---\x1b[0m\n");

  testCase("React Native Source Exporters - Exists & Loaded", () => {
    // Read directly from native component directories
    const pCardExists = fs.existsSync(path.join(process.cwd(), "src", "components", "react-native", "PodCard.tsx"));
    const fScreenExists = fs.existsSync(path.join(process.cwd(), "src", "components", "react-native", "FeedScreen.tsx"));
    const rModalExists = fs.existsSync(path.join(process.cwd(), "src", "components", "react-native", "RecordPodModal.tsx"));

    assert.ok(pCardExists, "PodCard.tsx component should exist");
    assert.ok(fScreenExists, "FeedScreen.tsx component should exist");
    assert.ok(rModalExists, "RecordPodModal.tsx component should exist");
  });

  // ==========================================
  // FINAL SCOREBOARD SUMMARY
  // ==========================================
  console.log("\x1b[35m==================================================================\x1b[0m");
  console.log(`TEST EXECUTION SUMMARY: \x1b[32m${passed} PASSED\x1b[0m, \x1b[31m${failed} FAILED\x1b[0m`);
  console.log("\x1b[35m==================================================================\x1b[0m\n");
}

runTests();
