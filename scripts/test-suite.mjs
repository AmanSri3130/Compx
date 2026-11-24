import http from "http";

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on("error", reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== COMPX MASTER TEST SUITE ===");

  // 1. Test unauthenticated request to /admin (must be 404 stealth)
  console.log("\n1. Testing Unauthenticated Request to /admin...");
  const adminUnauth = await request({
    hostname: "localhost",
    port: 3000,
    path: "/admin",
    method: "GET",
  });
  console.log(`Status Code: ${adminUnauth.statusCode} (Expected: 404 Not Found for stealth)`);
  if (adminUnauth.statusCode === 404) {
    console.log("PASSED: /admin returned 404 to unauthenticated visitor.");
  } else {
    console.log(`FAILED: Unexpected status ${adminUnauth.statusCode}`);
  }

  // 2. Test Student Login via /api/auth/login
  console.log("\n2. Testing Student Login via /api/auth/login...");
  const studentLoginRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    JSON.stringify({ email: "student@compx.in", password: "Student@123" })
  );
  console.log(`Student Login Status: ${studentLoginRes.statusCode}`);
  const studentCookies = studentLoginRes.headers["set-cookie"] || [];
  const studentAuthCookie = studentCookies.find((c) => c.startsWith("compx_auth_token="));
  console.log(`Student Cookie set: ${studentAuthCookie ? "YES" : "NO"}`);

  // 3. Test Student hitting /admin with Student Cookie (must be 404 stealth)
  console.log("\n3. Testing Student accessing /admin with Student Cookie...");
  if (studentAuthCookie) {
    const studentCookieVal = studentAuthCookie.split(";")[0];
    const studentAdminRes = await request({
      hostname: "localhost",
      port: 3000,
      path: "/admin",
      method: "GET",
      headers: { Cookie: studentCookieVal },
    });
    console.log(`Status Code for Student on /admin: ${studentAdminRes.statusCode} (Expected 404)`);
    if (studentAdminRes.statusCode === 404) {
      console.log("PASSED: Student account receives 404 on /admin.");
    } else {
      console.log(`FAILED: Student received ${studentAdminRes.statusCode}`);
    }

    // 4. Test Student calling /api/admin/stats (must be 403 Forbidden)
    console.log("\n4. Testing Student calling /api/admin/stats with Student Cookie...");
    const studentAdminApi = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/admin/stats",
      method: "GET",
      headers: { Cookie: studentCookieVal },
    });
    console.log(`Status Code for Student on /api/admin/stats: ${studentAdminApi.statusCode} (Expected 403)`);
    if (studentAdminApi.statusCode === 403) {
      console.log("PASSED: Student receives 403 on admin endpoints.");
    } else {
      console.log(`FAILED: Student API call received ${studentAdminApi.statusCode}`);
    }
  }

  // 5. Test Master Admin Login via /api/auth/admin-login with Student credentials (must be rejected)
  console.log("\n5. Testing /api/auth/admin-login rejecting Student account...");
  const fakeAdminRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/admin-login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    JSON.stringify({ email: "student@compx.in", password: "Student@123" })
  );
  console.log(`Status Code: ${fakeAdminRes.statusCode} (Expected 403)`);
  if (fakeAdminRes.statusCode === 403) {
    console.log("PASSED: Student cannot login through Master Admin endpoint.");
  } else {
    console.log(`FAILED: Received status ${fakeAdminRes.statusCode}`);
  }

  // 6. Test Master Admin Login via /api/auth/admin-login with Super Admin
  console.log("\n6. Testing /api/auth/admin-login with Super Admin credentials...");
  const adminLoginRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/auth/admin-login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    JSON.stringify({ email: "superadmin@compx.in", password: "SuperAdmin@123" })
  );
  console.log(`Admin Login Status: ${adminLoginRes.statusCode}`);
  const adminCookies = adminLoginRes.headers["set-cookie"] || [];
  const adminAuthCookie = adminCookies.find((c) => c.startsWith("compx_master_admin_token="));
  console.log(`Master Admin Cookie set: ${adminAuthCookie ? "YES" : "NO"}`);

  // 7. Test Master Admin accessing /admin with Master Admin Cookie (must be 200 OK)
  if (adminAuthCookie) {
    const adminCookieVal = adminAuthCookie.split(";")[0];
    console.log("\n7. Testing Master Admin accessing /admin with Master Admin Cookie...");
    const masterAdminPage = await request({
      hostname: "localhost",
      port: 3000,
      path: "/admin",
      method: "GET",
      headers: { Cookie: adminCookieVal },
    });
    console.log(`Status Code for Master Admin on /admin: ${masterAdminPage.statusCode} (Expected 200)`);
    if (masterAdminPage.statusCode === 200) {
      console.log("PASSED: Master Admin successfully accessed /admin.");
    } else {
      console.log(`FAILED: Master Admin received ${masterAdminPage.statusCode}`);
    }

    // 8. Test Master Admin calling /api/admin/stats
    console.log("\n8. Testing Master Admin calling /api/admin/stats...");
    const masterAdminStats = await request({
      hostname: "localhost",
      port: 3000,
      path: "/api/admin/stats",
      method: "GET",
      headers: { Cookie: adminCookieVal },
    });
    console.log(`Status Code for Master Admin on /api/admin/stats: ${masterAdminStats.statusCode} (Expected 200)`);
    if (masterAdminStats.statusCode === 200) {
      const stats = JSON.parse(masterAdminStats.body);
      console.log("PASSED: Master Admin Stats response:", JSON.stringify({
        totalRevenue: stats.totalRevenue,
        pendingOrdersCount: stats.pendingOrdersCount,
        totalStudents: stats.totalStudents,
        totalNotes: stats.totalNotes
      }));
    }
  }

  // 9. Test Student Dashboard /account
  console.log("\n9. Testing Student Dashboard /account...");
  const accountRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/account",
    method: "GET",
  });
  console.log(`Status Code for /account: ${accountRes.statusCode} (Expected 200)`);

  // 10. Test Homepage /
  console.log("\n10. Testing Homepage /...");
  const homeRes = await request({
    hostname: "localhost",
    port: 3000,
    path: "/",
    method: "GET",
  });
  console.log(`Status Code for /: ${homeRes.statusCode} (Expected 200)`);

  console.log("\n=== ALL SECURITY & FUNCTIONALITY TESTS COMPLETED ===");
}

runTests().catch(console.error);
